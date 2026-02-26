package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/lib/pq"
)

// GET /compare?ids=1,2,3
func Compare(conn *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		raw := c.Query("ids")
		if strings.TrimSpace(raw) == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "ids is required, ex: /compare?ids=1,2"})
			return
		}

		parts := strings.Split(raw, ",")
		ids := make([]int, 0, len(parts))

		for _, s := range parts {
			s = strings.TrimSpace(s)
			if s == "" {
				continue
			}
			n, err := strconv.Atoi(s)
			if err != nil || n <= 0 {
				c.JSON(http.StatusBadRequest, gin.H{"error": "invalid ids param"})
				return
			}
			ids = append(ids, n)
		}

		if len(ids) < 2 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "select at least 2 product ids"})
			return
		}

		// Build placeholders: $1,$2,$3...
		ph := make([]string, len(ids))
		args := make([]any, len(ids))
		for i, id := range ids {
			ph[i] = "$" + strconv.Itoa(i+1)
			args[i] = id
		}

		condition := parseConditionParam(c.Query("condition"))
		stores := parseStoresParam(c.Query("stores"))
		// Normalize store names so the client can send "BestBuy" or "Best Buy"
		// while still matching DB values.
		storesNorm := make([]string, 0, len(stores))
		for _, s := range stores {
			clean := strings.ToLower(strings.ReplaceAll(strings.TrimSpace(s), " ", ""))
			if clean != "" {
				storesNorm = append(storesNorm, clean)
			}
		}

		type Offer struct {
			Source string   `json:"source"`
			Price  float64  `json:"price"`
			Rating *float64 `json:"rating"`
			URL    string   `json:"url"`
		}

		type BestOffer struct {
			Source string   `json:"source"`
			Price  *float64 `json:"price"`
			Rating *float64 `json:"rating"`
			URL    *string  `json:"url"`
		}

		type Product struct {
			ID          int       `json:"id"`
			Name        string    `json:"name"`
			Brand       string    `json:"brand"`
			Category    string    `json:"category"`
			Description string    `json:"description"`
			ImageURL    string    `json:"imageUrl"`
			Offers      []Offer   `json:"offers"`
			Specs       any       `json:"specs,omitempty"`
			BestOffer   BestOffer `json:"bestOffer"`
		}

		// 1) Load products
		productSQL := `
			SELECT id, name, brand, category, description, image_url
			FROM products
			WHERE id IN (` + strings.Join(ph, ",") + `)
			ORDER BY id;
		`

		rows, err := conn.Query(productSQL, args...)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		defer rows.Close()

		products := []Product{}
		index := map[int]*Product{}

		for rows.Next() {
			var p Product
			if err := rows.Scan(&p.ID, &p.Name, &p.Brand, &p.Category, &p.Description, &p.ImageURL); err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}
			p.Offers = []Offer{}
			products = append(products, p)
			index[p.ID] = &products[len(products)-1]
		}

		// 2) Load specs for those products
		specSQL := `
			SELECT product_id, specs_json
			FROM product_specs
			WHERE product_id IN (` + strings.Join(ph, ",") + `);
		`
		specRows, err := conn.Query(specSQL, args...)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		defer specRows.Close()
		for specRows.Next() {
			var pid int
			var raw []byte
			if err := specRows.Scan(&pid, &raw); err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}
			if p := index[pid]; p != nil {
				var m map[string]any
				_ = json.Unmarshal(raw, &m)
				p.Specs = m
			}
		}

		// 3) Load offers for those products (filtered)
		offerSQL := `
			SELECT o.product_id, s.name, o.price, o.rating, o.url
			FROM offers o
			JOIN stores s ON s.id = o.store_id
			WHERE o.active = true
			  AND o.condition = $` + strconv.Itoa(len(args)+1) + `
			  AND lower(replace(s.name, ' ', '')) = ANY($` + strconv.Itoa(len(args)+2) + `)
			  AND o.product_id IN (` + strings.Join(ph, ",") + `)
			ORDER BY o.product_id, o.price ASC;
		`
		offerArgs := append(append([]any{}, args...), condition, pq.Array(storesNorm))
		offerRows, err := conn.Query(offerSQL, offerArgs...)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		defer offerRows.Close()

		for offerRows.Next() {
			var pid int
			var o Offer
			if err := offerRows.Scan(&pid, &o.Source, &o.Price, &o.Rating, &o.URL); err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}
			if p := index[pid]; p != nil {
				p.Offers = append(p.Offers, o)
			}
		}

		// 4) Compute best offer per product
		for i := range products {
			p := &products[i]
			if len(p.Offers) == 0 {
				p.BestOffer = BestOffer{Source: ""}
				continue
			}
			best := p.Offers[0]
			price := best.Price
			url := best.URL
			p.BestOffer = BestOffer{Source: best.Source, Price: &price, Rating: best.Rating, URL: &url}
		}

		c.JSON(http.StatusOK, gin.H{"products": products, "filters": gin.H{"condition": condition, "stores": stores}})
	}
}
