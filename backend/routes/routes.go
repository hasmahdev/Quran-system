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
	classRepo := repository.NewClassRepository(database.DB)
	progressRepo := repository.NewProgressRepository(database.DB)
	studentRepo := repository.NewStudentRepository(database.DB)

	// Initialize services
	userService := services.NewUserService(userRepo)
	classService := services.NewClassService(classRepo, progressRepo)
	progressService := services.NewProgressService(progressRepo)
	studentService := services.NewStudentService(studentRepo)

	// Initialize handlers
	authHandler := handlers.NewAuthHandler(userRepo, jwtSecret)
	userHandler := handlers.NewUserHandler(userService)
	classHandler := handlers.NewClassHandler(classService)
	progressHandler := handlers.NewProgressHandler(progressService)
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

	// Class Management
	api.Get("/classes", classHandler.GetClasses)
	api.Get("/teachers/:teacherId/classes", classHandler.GetTeacherClasses)
	api.Post("/classes", classHandler.CreateClass)
	api.Put("/classes/:classId", classHandler.UpdateClass)
	api.Delete("/classes/:classId", classHandler.DeleteClass)

	// Class Member Management
	api.Get("/classes/:classId/students", classHandler.GetClassStudents)
	api.Post("/classes/:classId/students", classHandler.AddClassStudent)
	api.Delete("/classes/:classId/students/:studentId", classHandler.RemoveClassStudent)

	// Progress Management
	api.Get("/classes/:classId/progress", progressHandler.GetClassProgress)
	api.Put("/progress/:progressId", progressHandler.UpdateProgress)

	// Student Management
	api.Get("/students/me", studentHandler.GetMyData)
}
