package syncer

import (
	"bytes"
	"database/sql"
	"encoding/json"
	"log"
	"os"
	"strconv"
	"strings"
	"time"
)

// Normalize categories coming from feeds so filters and compare rows are consistent.
// Handles case and separators like hyphens.
func normalizeCategory(cat string) string {
	c := strings.ToLower(strings.TrimSpace(cat))
	c = strings.NewReplacer("-", " ", "_", " ", "/", " ").Replace(c)
	c = strings.Join(strings.Fields(c), " ")

	switch c {
	case "phone", "phones", "mobile", "mobiles":
		return "Phones"
	case "laptop", "laptops", "notebook", "notebooks":
		return "Laptops"
	case "headphone", "headphones", "earbud", "earbuds", "earphone", "earphones":
		return "Headphones"
	default:
		if strings.TrimSpace(cat) == "" {
			return "Other"
		}
		// Preserve original capitalization for unknown categories.
		return strings.TrimSpace(cat)
	}
}

type Feed struct {
	Source   string        `json:"source"`
	Products []FeedProduct  `json:"products"`
}

type FeedProduct struct {
	Name        string      `json:"name"`
	Brand       string      `json:"brand"`
	Category    string      `json:"category"`
	Description string      `json:"description"`
	ImageURL    string      `json:"imageUrl"`
	Offers      []FeedOffer `json:"offers"`
}

type FeedOffer struct {
	StoreName string   `json:"storeName"`
	Price     float64  `json:"price"`
	Rating    *float64 `json:"rating"`
	URL       string   `json:"url"`
}


func readFeedWithRetry(feedPath string, attempts int) ([]byte, error) {
	var lastErr error
	for i := 0; i < attempts; i++ {
		b, err := os.ReadFile(feedPath)
		if err != nil {
			return nil, err
		}
		b = bytes.TrimSpace(b)
		if len(b) == 0 {
			lastErr =  fmtErr("feed is empty")
		} else if json.Valid(b) {
			return b, nil
		} else {
			lastErr = fmtErr("invalid json")
		}
		// common on Windows if file is being edited while we read it
		time.Sleep(200 * time.Millisecond)
	}
	return nil, lastErr
}

type simpleErr string
func (e simpleErr) Error() string { return string(e) }
func fmtErr(s string) error { return simpleErr(s) }

func RunEvery(conn *sql.DB, interval time.Duration, feedPath string) {
	ticker := time.NewTicker(interval)
	defer ticker.Stop()

	RunOnce(conn, feedPath)

	for range ticker.C {
		RunOnce(conn, feedPath)
	}
}

func RunOnce(conn *sql.DB, feedPath string) {
	b, err := readFeedWithRetry(feedPath, 4)
	if err != nil {
		log.Println("sync: read/validate feed error:", err)
		return
	}

	var f Feed
	if err := json.Unmarshal(b, &f); err != nil {
		// If the JSON was valid but doesn't match the expected schema, we land here.
		log.Println("sync: json parse error:", err)
		return
	}

	log.Println("🔄 Sync feed:", f.Source, "products:", len(f.Products))

	// Track offers seen in this run (for deactivation step)
	seen := make(map[string]bool)

	for _, fp := range f.Products {
		cat := normalizeCategory(fp.Category)
		// Upsert product
		var productID int
		err := conn.QueryRow(`
			INSERT INTO products (name, brand, category, description, image_url)
			VALUES ($1,$2,$3,$4,$5)
			ON CONFLICT (name, brand)
			DO UPDATE SET
			  category=EXCLUDED.category,
			  description=EXCLUDED.description,
			  image_url=EXCLUDED.image_url
			RETURNING id;
		`, fp.Name, fp.Brand, cat, fp.Description, fp.ImageURL).Scan(&productID)

		if err != nil {
			log.Println("sync: product upsert error:", err)
			continue
		}

		for _, fo := range fp.Offers {
			// Upsert store
			var storeID int
			err := conn.QueryRow(`
				INSERT INTO stores (name)
				VALUES ($1)
				ON CONFLICT (name) DO UPDATE SET name=EXCLUDED.name
				RETURNING id;
			`, fo.StoreName).Scan(&storeID)

			if err != nil {
				log.Println("sync: store upsert error:", err)
				continue
			}

			// Offer unique key marker
			key := makeKey(productID, storeID, fo.URL)
			seen[key] = true

			// Upsert offer
			_, err = conn.Exec(`
				INSERT INTO offers (product_id, store_id, price, rating, url, active, last_seen_at)
				VALUES ($1,$2,$3,$4,$5,true,NOW())
				ON CONFLICT (product_id, store_id, url)
				DO UPDATE SET
				  price=EXCLUDED.price,
				  rating=EXCLUDED.rating,
				  active=true,
				  last_seen_at=NOW();
			`, productID, storeID, fo.Price, fo.Rating, fo.URL)

			if err != nil {
				log.Println("sync: offer upsert error:", err)
				continue
			}
		}
	}

	// Step 8.5 Deactivate offers not seen recently (optional but high-end)
	// Mark offers inactive if they were not updated in the last 10 minutes
	// (safe logic for demo; in production you’d compare against the seen map more directly)
	_, _ = conn.Exec(`
		UPDATE offers
		SET active = false
		WHERE last_seen_at < NOW() - INTERVAL '10 minutes';
	`)

	log.Println("✅ Sync complete")
}

func makeKey(productID, storeID int, url string) string {
	return fmtInt(productID) + "|" + fmtInt(storeID) + "|" + url
}

func fmtInt(n int) string {
	// tiny helper without importing fmt (keeps imports small)
	return strconv.Itoa(n)
}
