package config

import (
	"os"
	"time"
)

// Config holds all configuration for the application.
type Config struct {
	DatabaseURL string
	JWTSecret   string
	ServerPort  string
	JWTExpiry   time.Duration
}

// Load loads configuration from environment variables.
func Load() *Config {
	// Provide default values for critical settings
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		// A default for local development, but should be set in production
		dbURL = "postgres://user:password@localhost:5432/quran_dev"
	}

	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		// This should absolutely be set in a real environment.
		// Using a hardcoded default is a security risk.
		jwtSecret = "a_very_secret_default_key"
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "3002"
	}

	return &Config{
		DatabaseURL: dbURL,
		JWTSecret:   jwtSecret,
		ServerPort:  port,
		JWTExpiry:   72 * time.Hour, // Keep this configurable if needed
	}
}
