package main

import (
	"database/sql"
	"log"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"

	"go-ecommerce-backend/db"
	"go-ecommerce-backend/handlers"
	"go-ecommerce-backend/middleware"
	syncer "go-ecommerce-backend/sync"
)

func runSchema(conn *sql.DB) {
	schemaBytes, err := os.ReadFile("sql/schema.sql")
	if err != nil {
		log.Fatal("Could not read schema.sql:", err)
	}
	if _, err := conn.Exec(string(schemaBytes)); err != nil {
		log.Fatal("Could not run schema.sql:", err)
	}
	log.Println("✅ DB schema ready")
}

func runSeed(conn *sql.DB) {
	seedFiles := []string{"sql/seed.sql", "sql/seed_specs.sql"}
	for _, f := range seedFiles {
		b, err := os.ReadFile(f)
		if err != nil {
			log.Println("Could not read", f, ":", err)
			continue
		}
		if _, err := conn.Exec(string(b)); err != nil {
			log.Println("Could not run", f, ":", err)
			continue
		}
	}
	log.Println("🌱 Demo seed data ready")
}

func resolveFeedPath() string {
	// 1) Allow override via env
	if p := os.Getenv("FEED_PATH"); p != "" {
		return p
	}

	candidates := []string{
		"feeds/source_demo.json",                              // when running from backend/
		filepath.Join("backend", "feeds", "source_demo.json"), // when running from repo root
	}

	// 2) Also try relative to the executable (useful for built binaries)
	if exe, err := os.Executable(); err == nil {
		base := filepath.Dir(exe)
		candidates = append(candidates, filepath.Join(base, "feeds", "source_demo.json"))
	}

	for _, c := range candidates {
		if _, err := os.Stat(c); err == nil {
			return c
		}
	}

	// Fall back to the most common
	return "feeds/source_demo.json"
}

func main() {
	_ = godotenv.Load()

	conn := db.Open()
	runSchema(conn)
	runSeed(conn)

	// Auto-sync worker is OFF by default.
	// Turn it on only when you explicitly want to demo feed ingestion.
	feedPath := resolveFeedPath()
	if strings.EqualFold(os.Getenv("ENABLE_SYNC"), "true") {
		go syncer.RunEvery(conn, 2*time.Minute, feedPath)
		log.Println("🔁 ENABLE_SYNC=true (auto-sync worker running)")
	} else {
		log.Println("ℹ️ ENABLE_SYNC is off (use /admin/sync-now to import feed)")
	}

	r := gin.Default()

	// ✅ CORS: allow local dev + allow your deployed frontend via env
	allowedOrigins := []string{"http://localhost:5173"} // keep local dev
	if o := os.Getenv("FRONTEND_ORIGIN"); o != "" {
		// Example: https://comparehub.vercel.app
		allowedOrigins = append(allowedOrigins, o)
	}

	r.Use(cors.New(cors.Config{
    AllowOriginFunc: func(origin string) bool {
        // local dev
        if origin == "http://localhost:5173" {
            return true
        }
        // allow your specific Vercel project domain
        if origin == "https://comparehub-npo6cumsm-shrav463s-projects.vercel.app" {
            return true
        }
        // allow any Vercel preview URLs (optional but very helpful)
        if strings.HasSuffix(origin, ".vercel.app") {
            return true
        }
        return false
    },
    AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
    AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
    ExposeHeaders:    []string{"Content-Length"},
    AllowCredentials: false,
}))

	r.GET("/health", func(c *gin.Context) { c.JSON(200, gin.H{"status": "ok"}) })

	// -----------------------
	// Public APIs
	// -----------------------
	r.GET("/products", handlers.ListProducts(conn))
	r.GET("/products/:id", handlers.GetProduct(conn))
	r.GET("/products/:id/offers", handlers.GetOffers(conn))
	r.GET("/compare", handlers.Compare(conn))
	r.GET("/analytics/top-deals", handlers.TopDeals(conn))

	// -----------------------
	// Analytics
	// -----------------------
	r.GET("/analytics/summary", handlers.AnalyticsSummary(conn))
	r.POST("/track/click", handlers.TrackClick(conn))

	// -----------------------
	// Public auth
	// -----------------------
	r.POST("/auth/login", handlers.Login())

	// -----------------------
	// Protected admin APIs
	// -----------------------
	admin := r.Group("/admin", middleware.RequireAdmin())
	{
		admin.POST("/products", handlers.AdminCreateProduct(conn))
		admin.POST("/offers", handlers.AdminCreateOffer(conn))
		admin.POST("/specs", handlers.AdminUpsertSpecs(conn))

		admin.POST("/sync-now", func(c *gin.Context) {
			syncer.RunOnce(conn, feedPath)
			c.JSON(200, gin.H{"ok": true})
		})
	}

	// ✅ Render requires PORT and listening on 0.0.0.0
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080" // local fallback
	}

	log.Println("🚀 Backend running on port:", port)
	if err := r.Run("0.0.0.0:" + port); err != nil {
		log.Fatal(err)
	}
}
