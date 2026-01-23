package handlers

import (
	"database/sql"
	"encoding/json"
	"strconv"

	"github.com/lib/pq"

	"github.com/gin-gonic/gin"
)

type ProductRow struct {
	ID          int    `json:"id"`
	Name        string `json:"name"`
	Brand       string `json:"brand"`
	Category    string `json:"category"`
	Description string `json:"description"`
	ImageURL    string `json:"imageUrl"`

	BestPrice  float64 `json:"bestPrice"`
	BestSource string  `json:"bestSource"`
	BestRating float64 `json:"bestRating"`
	BestURL    string  `json:"bestUrl"`

	// Optional extras derived from specs_json (if present)
	ReviewCount *int64 `json:"reviewCount,omitempty"`
}

type OfferRow struct {
	Store  string   `json:"source"` // React expects o.source
	Price  float64  `json:"price"`
	Rating *float64 `json:"rating"`
	URL    string   `json:"url"`
}

func ListProducts(conn *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		storesParam := c.Query("stores")
		condition := parseConditionParam(c.Query("condition"))
		stores := parseStoresParam(storesParam)
		q := c.Query("q")
		category := c.DefaultQuery("category", "all")
		sort := c.DefaultQuery("sort", "low") // low | high | rating
		brand := c.DefaultQuery("brand", "all")
		minPriceStr := c.Query("minPrice")
		maxPriceStr := c.Query("maxPrice")
		minRatingStr := c.Query("minRating")
		pageStr := c.DefaultQuery("page", "1")

		page, _ := strconv.Atoi(pageStr)
		if page < 1 {
			page = 1
		}
		limit := 24
		offset := (page - 1) * limit

		var minPrice *float64
		var maxPrice *float64
		var minRating *float64
		if minPriceStr != "" {
			if v, err := strconv.ParseFloat(minPriceStr, 64); err == nil {
				minPrice = &v
			}
		}
		if maxPriceStr != "" {
			if v, err := strconv.ParseFloat(maxPriceStr, 64); err == nil {
				maxPrice = &v
			}
		}
		if minRatingStr != "" {
			if v, err := strconv.ParseFloat(minRatingStr, 64); err == nil {
				minRating = &v
			}
		}

		order := "best_price ASC"
		if sort == "high" {
			order = "best_price DESC"
		} else if sort == "rating" {
			order = "best_rating DESC"
		}

		// Best offer per product using LATERAL join, plus optional filters.
		// We also LEFT JOIN product_specs to surface review_count in list views.
		query := `
			SELECT
			  p.id, p.name, COALESCE(p.brand,''), COALESCE(p.category,''), COALESCE(p.description,''), COALESCE(p.image_url,''),
			  COALESCE(bo.best_price, 0) AS best_price,
			  COALESCE(bo.best_source, '') AS best_source,
			  COALESCE(bo.best_rating, 0) AS best_rating,
			  COALESCE(bo.best_url, '') AS best_url,
			  (ps.specs_json->>'review_count')::bigint AS review_count
			FROM products p
			LEFT JOIN product_specs ps ON ps.product_id = p.id
			LEFT JOIN LATERAL (
			  SELECT
			    o.price AS best_price,
			    s.name  AS best_source,
			    COALESCE(o.rating, 0) AS best_rating,
			    o.url   AS best_url
			  FROM offers o
			  JOIN stores s ON s.id = o.store_id
			  WHERE o.product_id = p.id
			    AND o.active = true
			    AND o.condition = $9
			    AND s.name = ANY($10)
			  ORDER BY o.price ASC
			  LIMIT 1
			) bo ON true
			WHERE
			  ($1 = '' OR LOWER(p.name) LIKE LOWER('%' || $1 || '%') OR LOWER(p.brand) LIKE LOWER('%' || $1 || '%'))
			  AND ($2 = 'all' OR p.category = $2)
			  AND ($3 = 'all' OR LOWER(p.brand) = LOWER($3))
			  AND ($4::numeric IS NULL OR bo.best_price >= $4)
			  AND ($5::numeric IS NULL OR bo.best_price <= $5)
			  AND ($6::numeric IS NULL OR bo.best_rating >= $6)
			ORDER BY ` + order + `
			LIMIT $7 OFFSET $8;
		`

		rows, err := conn.Query(query, q, category, brand, minPrice, maxPrice, minRating, limit, offset, condition, pq.Array(stores))
		if err != nil {
			c.JSON(500, gin.H{"error": err.Error()})
			return
		}
		defer rows.Close()

		out := []ProductRow{}
		for rows.Next() {
			var r ProductRow
			if err := rows.Scan(&r.ID, &r.Name, &r.Brand, &r.Category, &r.Description, &r.ImageURL, &r.BestPrice, &r.BestSource, &r.BestRating, &r.BestURL, &r.ReviewCount); err != nil {
				c.JSON(500, gin.H{"error": err.Error()})
				return
			}
			out = append(out, r)
		}

		c.JSON(200, out)
	}
}

func GetProduct(conn *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		id := c.Param("id")
		condition := parseConditionParam(c.Query("condition"))
		stores := parseStoresParam(c.Query("stores"))

		var p struct {
			ID          int        `json:"id"`
			Name        string     `json:"name"`
			Brand       string     `json:"brand"`
			Category    string     `json:"category"`
			Description string     `json:"description"`
			ImageURL    string     `json:"imageUrl"`
			Offers      []OfferRow `json:"offers"`
			Specs       any        `json:"specs,omitempty"`
			LastUpdated *string    `json:"lastUpdated,omitempty"`
		}

		// 1) Product
		err := conn.QueryRow(`
			SELECT id, name, COALESCE(brand,''), COALESCE(category,''), COALESCE(description,''), COALESCE(image_url,'')
			FROM products
			WHERE id = $1;
		`, id).Scan(&p.ID, &p.Name, &p.Brand, &p.Category, &p.Description, &p.ImageURL)

		if err == sql.ErrNoRows {
			c.JSON(404, gin.H{"error": "product not found"})
			return
		}
		if err != nil {
			c.JSON(500, gin.H{"error": err.Error()})
			return
		}

		// 2) Offers
		rows, err := conn.Query(`
			SELECT s.name, o.price, o.rating, o.url
			FROM offers o
			JOIN stores s ON s.id = o.store_id
			WHERE o.product_id = $1
			  AND o.active = true
			  AND o.condition = $2
			  AND s.name = ANY($3)
			ORDER BY o.price ASC;
		`, id, condition, pq.Array(stores))
		if err != nil {
			c.JSON(500, gin.H{"error": err.Error()})
			return
		}
		defer rows.Close()

		offers := []OfferRow{}
		for rows.Next() {
			var o OfferRow
			if err := rows.Scan(&o.Store, &o.Price, &o.Rating, &o.URL); err != nil {
				c.JSON(500, gin.H{"error": err.Error()})
				return
			}
			offers = append(offers, o)
		}

		p.Offers = offers

		// 3) Specs (optional)
		var raw json.RawMessage
		var last sql.NullString
		err = conn.QueryRow(`
			SELECT specs_json, to_char(last_updated, 'YYYY-MM-DD')
			FROM product_specs
			WHERE product_id = $1;
		`, id).Scan(&raw, &last)
		if err == nil {
			// decode to map for nicer JSON output
			var m map[string]any
			if e := json.Unmarshal(raw, &m); e == nil {
				p.Specs = m
			}
			if last.Valid {
				p.LastUpdated = &last.String
			}
		} else if err != sql.ErrNoRows {
			c.JSON(500, gin.H{"error": err.Error()})
			return
		}
		c.JSON(200, p)
	}
}

func GetOffers(conn *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		id := c.Param("id")
		condition := parseConditionParam(c.Query("condition"))
		stores := parseStoresParam(c.Query("stores"))

		rows, err := conn.Query(`
			SELECT s.name, o.price, o.rating, o.url
			FROM offers o
			JOIN stores s ON s.id = o.store_id
			WHERE o.product_id = $1
			  AND o.active = true
			  AND o.condition = $2
			  AND s.name = ANY($3)
			ORDER BY o.price ASC;
		`, id, condition, pq.Array(stores))
		if err != nil {
			c.JSON(500, gin.H{"error": err.Error()})
			return
		}
		defer rows.Close()

		out := []OfferRow{}
		for rows.Next() {
			var o OfferRow
			if err := rows.Scan(&o.Store, &o.Price, &o.Rating, &o.URL); err != nil {
				c.JSON(500, gin.H{"error": err.Error()})
				return
			}
			out = append(out, o)
		}

		c.JSON(200, gin.H{"offers": out})
	}
}
