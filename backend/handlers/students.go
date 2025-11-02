package handlers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v4"
	"github.com/kolind-am/quran-project/backend/services"
)

// StudentHandler holds the student service.
type StudentHandler struct {
	service services.StudentService
}

// NewStudentHandler creates a new StudentHandler.
func NewStudentHandler(service services.StudentService) *StudentHandler {
	return &StudentHandler{service: service}
}

// GetMyData handles the request to get the authenticated student's data.
func (h *StudentHandler) GetMyData(c *fiber.Ctx) error {
	user := c.Locals("user").(*jwt.Token)
	claims := user.Claims.(jwt.MapClaims)
	id := int(claims["id"].(float64))

	studentData, err := h.service.GetStudentData(c.Context(), id)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to get student data"})
	}
	return c.JSON(studentData)
}
