package db

import (
	"database/sql"
	"log"
	"os"

	_ "github.com/lib/pq"
)

func Open() *sql.DB {
	// ✅ Prefer DATABASE_URL (Render)
	databaseURL := os.Getenv("DATABASE_URL")

	var conn *sql.DB
	var err error

	if databaseURL != "" {
		// Render / production
		conn, err = sql.Open("postgres", databaseURL)
	} else {
		// Local development fallback
		host := os.Getenv("DB_HOST")
		port := os.Getenv("DB_PORT")
		user := os.Getenv("DB_USER")
		pass := os.Getenv("DB_PASSWORD")
		name := os.Getenv("DB_NAME")

		dsn := "host=" + host +
			" port=" + port +
			" user=" + user +
			" password=" + pass +
			" dbname=" + name +
			" sslmode=disable"

		conn, err = sql.Open("postgres", dsn)
	}

	if err != nil {
		log.Fatal("sql.Open failed:", err)
	}

	if err := conn.Ping(); err != nil {
		log.Fatal("db ping failed:", err)
	}

	log.Println("✅ Database connected")
	return conn
}
