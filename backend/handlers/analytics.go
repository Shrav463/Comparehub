package handlers

import (
	"database/sql"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

type TrendingProduct struct {
	ID     int64  `json:"id"`
	Name   string `json:"name"`
	Image  string `json:"imageUrl"`
	Clicks int64  `json:"clicks"`
}

type StoreClicks struct {
	Store  string `json:"store"`
	Clicks int64  `json:"clicks"`
}

type TopSearch struct {
	Query    string `json:"query"`
	Searches int64  `json:"searches"`
}

// GET /analytics/summary
func AnalyticsSummary(conn *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Trending products (last 7 days)
		trending := []TrendingProduct{}
		rows, err := conn.Query(`
			SELECT p.id, p.name, COALESCE(p.image_url, ''), COUNT(*) AS clicks
			FROM click_events ce
			JOIN products p ON p.id = ce.product_id
			WHERE ce.created_at >= now() - interval '7 days'
			GROUP BY p.id, p.name, p.image_url
			ORDER BY clicks DESC
			LIMIT 6
		`)
		if err == nil {
			defer rows.Close()
			for rows.Next() {
				var t TrendingProduct
				_ = rows.Scan(&t.ID, &t.Name, &t.Image, &t.Clicks)
				trending = append(trending, t)
			}
		}

		// Store click breakdown
		stores := []StoreClicks{}
		rows2, err2 := conn.Query(`
			SELECT s.name, COUNT(*) AS clicks
			FROM click_events ce
			JOIN stores s ON s.id = ce.store_id
			WHERE ce.created_at >= now() - interval '7 days'
			GROUP BY s.name
			ORDER BY clicks DESC
			LIMIT 6
		`)
		if err2 == nil {
			defer rows2.Close()
			for rows2.Next() {
				var s StoreClicks
				_ = rows2.Scan(&s.Store, &s.Clicks)
				stores = append(stores, s)
			}
		}

		// Trending searches (last 7 days)
		searches := []TopSearch{}
		rows3, err3 := conn.Query(`
			SELECT lower(trim(query)) AS q, COUNT(*) AS searches
			FROM search_events
			WHERE created_at >= now() - interval '7 days'
			  AND query IS NOT NULL AND query <> ''
			GROUP BY q
			ORDER BY searches DESC
			LIMIT 8
		`)
		if err3 == nil {
			defer rows3.Close()
			for rows3.Next() {
				var s TopSearch
				_ = rows3.Scan(&s.Query, &s.Searches)
				searches = append(searches, s)
			}
		}

		c.JSON(http.StatusOK, gin.H{
			"trendingProducts": trending,
			"storeClicks":      stores,
			"topSearches":      searches,
		})
	}
}

// POST /track/click
// Body: { productId, storeName, url }
// We resolve store_id and offer_id internally (best effort).
func TrackClick(conn *sql.DB) gin.HandlerFunc {
	type Req struct {
		ProductID int64  `json:"productId"`
		StoreName string `json:"storeName"`
		URL       string `json:"url"`
	}

	return func(c *gin.Context) {
		var req Req
		if err := c.BindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid body"})
			return
		}
		if req.ProductID == 0 || strings.TrimSpace(req.StoreName) == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "productId and storeName required"})
			return
		}

		// Resolve store_id by name (case-insensitive)
		var storeID sql.NullInt64
		_ = conn.QueryRow(`
			SELECT id FROM stores
			WHERE lower(name) = lower($1)
			LIMIT 1
		`, req.StoreName).Scan(&storeID)

		// Resolve offer_id by product_id + store_id + url (best effort)
		var offerID sql.NullInt64
		if storeID.Valid && strings.TrimSpace(req.URL) != "" {
			_ = conn.QueryRow(`
				SELECT id FROM offers
				WHERE product_id = $1 AND store_id = $2 AND url = $3
				LIMIT 1
			`, req.ProductID, storeID.Int64, req.URL).Scan(&offerID)
		}

		// Insert click event
		// store_id may be NULL if store wasn't found
		// offer_id may be NULL if we couldn't map it
		_, _ = conn.Exec(`
			INSERT INTO click_events (product_id, offer_id, store_id)
			VALUES ($1, $2, $3)
		`, req.ProductID, offerID, storeID)

		c.JSON(http.StatusOK, gin.H{
			"ok":      true,
			"storeId": storeID,
			"offerId": offerID,
		})
	}
}
