package db

import (
	"database/sql"
	"fmt"
	"log"
	"os"

	_ "github.com/lib/pq"
)

func Open() *sql.DB {
	host := os.Getenv("DB_HOST")
	port := os.Getenv("DB_PORT")
	user := os.Getenv("DB_USER")
	pass := os.Getenv("DB_PASSWORD")
	name := os.Getenv("DB_NAME")

	dsn := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
		host, port, user, pass, name)

	conn, err := sql.Open("postgres", dsn)
	if err != nil {
		log.Fatal("sql.Open failed:", err)
	}

	if err := conn.Ping(); err != nil {
		log.Fatal("db ping failed:", err)
	}
	return conn
}
