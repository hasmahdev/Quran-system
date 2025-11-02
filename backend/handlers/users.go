package handlers

import (
	"strconv"

	"github.com/gofiber/fiber/v2"
	"github.com/kolind-am/quran-project/backend/models"
	"github.com/kolind-am/quran-project/backend/services"
)

// UserHandler holds the user service.
type UserHandler struct {
	service services.UserService
}

// NewUserHandler creates a new UserHandler.
func NewUserHandler(service services.UserService) *UserHandler {
	return &UserHandler{service: service}
}

// GetUsers handles the request to get users.
func (h *UserHandler) GetUsers(c *fiber.Ctx) error {
	role := c.Query("role")
	users, err := h.service.GetUsers(c.Context(), role)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to get users"})
	}
	return c.JSON(users)
}

// CreateUser handles the request to create a user.
func (h *UserHandler) CreateUser(c *fiber.Ctx) error {
	var user models.User
	if err := c.BodyParser(&user); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "cannot parse JSON"})
	}

	if err := h.service.CreateUser(c.Context(), &user); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to create user"})
	}

	user.Password = "" // Don't send password back
	return c.Status(fiber.StatusCreated).JSON(user)
}

// UpdateUser handles the request to update a user.
func (h *UserHandler) UpdateUser(c *fiber.Ctx) error {
	id, err := strconv.Atoi(c.Params("userId"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid user ID"})
	}

	var user models.User
	if err := c.BodyParser(&user); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "cannot parse JSON"})
	}

	updatedUser, err := h.service.UpdateUser(c.Context(), id, &user)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to update user"})
	}

	return c.JSON(updatedUser)
}

// DeleteUser handles the request to delete a user.
func (h *UserHandler) DeleteUser(c *fiber.Ctx) error {
	id, err := strconv.Atoi(c.Params("userId"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid user ID"})
	}

	if err := h.service.DeleteUser(c.Context(), id); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to delete user"})
	}

	return c.SendStatus(fiber.StatusNoContent)
}
