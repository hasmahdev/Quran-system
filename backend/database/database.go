package database

import (
	"context"
	"fmt"
	"log"

	"github.com/jackc/pgx/v4/pgxpool"
)

// DB holds the database connection pool.
var DB *pgxpool.Pool

// Connect initializes the database connection pool.
func Connect(databaseURL string) {
	var err error
	DB, err = pgxpool.Connect(context.Background(), databaseURL)
	if err != nil {
		log.Fatalf("Unable to connect to database: %v\n", err)
	}
	fmt.Println("Successfully connected to the database")
}

// Close closes the database connection pool.
func Close() {
	if DB != nil {
		DB.Close()
		fmt.Println("Database connection pool closed.")
	}
}
