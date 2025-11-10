package routes

import (
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/kolind-am/quran-project/backend/database"
	"github.com/kolind-am/quran-project/backend/handlers"
	"github.com/kolind-am/quran-project/backend/middleware"
	"github.com/kolind-am/quran-project/backend/repository"
	"github.com/kolind-am/quran-project/backend/services"
)

// SetupRoutes configures all the application routes.
func SetupRoutes(app *fiber.App, jwtSecret string) {
	app.Use(logger.New())

	// Initialize repositories
	userRepo := repository.NewUserRepository(database.DB)
	studentRepo := repository.NewStudentRepository(database.DB)

	// Initialize services
	userService := services.NewUserService(userRepo)
	studentService := services.NewStudentService(studentRepo)

	// Initialize handlers
	authHandler := handlers.NewAuthHandler(userRepo, jwtSecret)
	userHandler := handlers.NewUserHandler(userService)
	studentHandler := handlers.NewStudentHandler(studentService)

	// Public routes
	app.Get("/", func(c *fiber.Ctx) error {
		return c.SendString("Hello, World!")
	})
	app.Post("/login", authHandler.Login)

	// API group with JWT middleware
	api := app.Group("/api", middleware.Protected(jwtSecret))

	// User Management
	api.Get("/users", userHandler.GetUsers)
	api.Post("/users", userHandler.CreateUser)
	api.Put("/users/:userId", userHandler.UpdateUser)
	api.Delete("/users/:userId", userHandler.DeleteUser)

	// Student Management
	api.Get("/students/me", studentHandler.GetMyData)
}
