package handlers

import (
	"database/sql"
	"encoding/json"

	"github.com/gin-gonic/gin"
)

type CreateProductReq struct {
	Name        string `json:"name"`
	Brand       string `json:"brand"`
	Category    string `json:"category"`
	Description string `json:"description"`
	ImageURL    string `json:"imageUrl"`
}

type CreateOfferReq struct {
	ProductID int      `json:"productId"`
	StoreName string   `json:"storeName"`
	Price     float64  `json:"price"`
	Rating    *float64 `json:"rating"`
	URL       string   `json:"url"`
}

type UpsertSpecsReq struct {
	ProductID int            `json:"productId"`
	Specs     map[string]any `json:"specs"`
}

func AdminCreateProduct(conn *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var body CreateProductReq
		if err := c.BindJSON(&body); err != nil || body.Name == "" {
			c.JSON(400, gin.H{"error": "invalid body"})
			return
		}

		var id int
		err := conn.QueryRow(`
			INSERT INTO products (name, brand, category, description, image_url)
			VALUES ($1,$2,$3,$4,$5)
			RETURNING id;
		`, body.Name, body.Brand, body.Category, body.Description, body.ImageURL).Scan(&id)
		if err != nil {
			c.JSON(500, gin.H{"error": err.Error()})
			return
		}

		c.JSON(200, gin.H{"id": id})
	}
}

func AdminCreateOffer(conn *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var body CreateOfferReq
		if err := c.BindJSON(&body); err != nil || body.ProductID == 0 || body.StoreName == "" || body.Price <= 0 || body.URL == "" {
			c.JSON(400, gin.H{"error": "invalid body"})
			return
		}

		// Upsert store
		var storeID int
		err := conn.QueryRow(`
			INSERT INTO stores (name) VALUES ($1)
			ON CONFLICT (name) DO UPDATE SET name=EXCLUDED.name
			RETURNING id;
		`, body.StoreName).Scan(&storeID)
		if err != nil {
			c.JSON(500, gin.H{"error": err.Error()})
			return
		}

		_, err = conn.Exec(`
			INSERT INTO offers (product_id, store_id, price, rating, url, active, last_seen_at)
			VALUES ($1,$2,$3,$4,$5,true,NOW());
		`, body.ProductID, storeID, body.Price, body.Rating, body.URL)
		if err != nil {
			c.JSON(500, gin.H{"error": err.Error()})
			return
		}

		c.JSON(200, gin.H{"ok": true})
	}
}

// POST /admin/specs
// Body: { productId: 1, specs: { ... } }
func AdminUpsertSpecs(conn *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var body UpsertSpecsReq
		if err := c.BindJSON(&body); err != nil || body.ProductID == 0 {
			c.JSON(400, gin.H{"error": "invalid body"})
			return
		}

		b, err := json.Marshal(body.Specs)
		if err != nil {
			c.JSON(400, gin.H{"error": "specs must be valid JSON"})
			return
		}

		_, err = conn.Exec(`
			INSERT INTO product_specs (product_id, specs_json, last_updated)
			VALUES ($1, $2::jsonb, NOW())
			ON CONFLICT (product_id)
			DO UPDATE SET specs_json = EXCLUDED.specs_json, last_updated = NOW();
		`, body.ProductID, string(b))
		if err != nil {
			c.JSON(500, gin.H{"error": err.Error()})
			return
		}

		c.JSON(200, gin.H{"ok": true})
	}
}
