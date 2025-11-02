package main

import (
	"log"
	"os"
	"os/signal"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/kolind-am/quran-project/backend/config"
	"github.com/kolind-am/quran-project/backend/database"
	"github.com/kolind-am/quran-project/backend/routes"
)

func main() {
	// Load configuration from environment variables
	cfg := config.Load()

	// Connect to the database
	database.Connect(cfg.DatabaseURL)
	defer database.Close()

	// Create a new Fiber app
	app := fiber.New()

	// Setup CORS
	app.Use(cors.New(cors.Config{
		AllowOrigins: "https://quran.ghars.site, http://localhost:3000",
		AllowHeaders: "Origin, Content-Type, Accept, Authorization",
		AllowMethods: "GET,POST,HEAD,PUT,DELETE,PATCH",
	}))

	// Setup routes
	routes.SetupRoutes(app, cfg.JWTSecret)

	// Start the server and implement graceful shutdown
	go func() {
		if err := app.Listen(":" + cfg.ServerPort); err != nil {
			log.Panic(err)
		}
	}()

	// Wait for an interrupt signal to gracefully shut down the server
	c := make(chan os.Signal, 1)
	signal.Notify(c, os.Interrupt)
	<-c

	log.Println("Gracefully shutting down...")
	_ = app.Shutdown()
}
