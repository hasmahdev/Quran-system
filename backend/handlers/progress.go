package handlers

import (
	"strconv"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v4"
	"github.com/kolind-am/quran-project/backend/models"
	"github.com/kolind-am/quran-project/backend/services"
)

// ProgressHandler holds the progress service.
type ProgressHandler struct {
	service services.ProgressService
}

// NewProgressHandler creates a new ProgressHandler.
func NewProgressHandler(service services.ProgressService) *ProgressHandler {
	return &ProgressHandler{service: service}
}

// GetClassProgress handles the request to get class progress.
func (h *ProgressHandler) GetClassProgress(c *fiber.Ctx) error {
	classId, err := strconv.Atoi(c.Params("classId"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid class ID"})
	}
	progress, err := h.service.GetClassProgress(c.Context(), classId)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to get class progress"})
	}
	return c.JSON(progress)
}

// CreateProgress handles the request to create a new progress record.
func (h *ProgressHandler) CreateProgress(c *fiber.Ctx) error {
	var progress models.Progress
	if err := c.BodyParser(&progress); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "cannot parse JSON"})
	}

	user := c.Locals("user").(*jwt.Token)
	claims := user.Claims.(jwt.MapClaims)
	teacherId := int(claims["id"].(float64))
	progress.UpdatedBy = teacherId

	createdProgress, err := h.service.CreateProgress(c.Context(), &progress)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to create progress"})
	}
	return c.Status(fiber.StatusCreated).JSON(createdProgress)
}

// UpdateProgress handles the request to update progress.
func (h *ProgressHandler) UpdateProgress(c *fiber.Ctx) error {
	id, err := strconv.Atoi(c.Params("progressId"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid progress ID"})
	}
	var progress models.Progress
	if err := c.BodyParser(&progress); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "cannot parse JSON"})
	}
	if err := h.service.UpdateProgress(c.Context(), id, &progress); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to update progress"})
	}
	return c.JSON(progress)
}
