package handlers

import (
	"database/sql"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/lib/pq"
)

type TopDealRow struct {
	ID         int64    `json:"id"`
	Name       string   `json:"name"`
	Brand      string   `json:"brand"`
	Category   string   `json:"category"`
	ImageURL   string   `json:"imageUrl"`
	BestPrice  *float64 `json:"bestPrice"`
	BestSource *string  `json:"bestSource"`
	BestRating *float64 `json:"bestRating"`
}

// GET /analytics/top-deals
// Returns products sorted by bestPrice (lowest first) with best offer per product.
func TopDeals(conn *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		condition := parseConditionParam(c.Query("condition"))
		stores := parseStoresParam(c.Query("stores"))

		rows, err := conn.Query(`
			SELECT
				p.id,
				p.name,
				COALESCE(p.brand, '') AS brand,
				COALESCE(p.category, '') AS category,
				COALESCE(p.image_url, '') AS image_url,
				best.best_price,
				best.best_source,
				best.best_rating
			FROM products p
			LEFT JOIN LATERAL (
				SELECT
					o.price AS best_price,
					s.name AS best_source,
					o.rating AS best_rating
				FROM offers o
				JOIN stores s ON s.id = o.store_id
				WHERE o.product_id = p.id
				  AND o.active = true
				  AND o.condition = $1
				  AND s.name = ANY($2)
				ORDER BY o.price ASC NULLS LAST, o.rating DESC NULLS LAST
				LIMIT 1
			) best ON true
			WHERE best.best_price IS NOT NULL
			ORDER BY best.best_price ASC
			LIMIT 20
		`, condition, pq.Array(stores))
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		defer rows.Close()

		out := []TopDealRow{}
		for rows.Next() {
			var r TopDealRow
			if err := rows.Scan(
				&r.ID, &r.Name, &r.Brand, &r.Category, &r.ImageURL,
				&r.BestPrice, &r.BestSource, &r.BestRating,
			); err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}
			out = append(out, r)
		}

		c.JSON(http.StatusOK, out)
	}
}
