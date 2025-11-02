package handlers

import (
	"log"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v4"
	"github.com/kolind-am/quran-project/backend/models"
	"github.com/kolind-am/quran-project/backend/repository"
	"golang.org/x/crypto/bcrypt"
)

const (
	bcryptCost = 10
	jwtExpiry  = 72 * time.Hour
)

// AuthHandler holds dependencies for authentication.
type AuthHandler struct {
	userRepo  repository.UserRepository
	jwtSecret string
}

// NewAuthHandler creates a new AuthHandler.
func NewAuthHandler(userRepo repository.UserRepository, jwtSecret string) *AuthHandler {
	return &AuthHandler{userRepo: userRepo, jwtSecret: jwtSecret}
}

// Login handles user authentication.
func (h *AuthHandler) Login(c *fiber.Ctx) error {
	var req models.LoginRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "cannot parse JSON"})
	}

	log.Printf("Login attempt for user: %s", req.Username)

	user, err := h.userRepo.FindUserByUsername(c.Context(), req.Username)
	if err != nil {
		log.Printf("User lookup failed for '%s': %v", req.Username, err)
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "invalid credentials"})
	}
	log.Printf("User '%s' found in database.", req.Username)

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
		log.Printf("Password comparison failed for user '%s': %v", req.Username, err)
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "invalid credentials"})
	}
	log.Printf("Password for user '%s' is correct.", req.Username)

	claims := jwt.MapClaims{
		"id":   user.ID,
		"role": user.Role,
		"exp":  time.Now().Add(jwtExpiry).Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	t, err := token.SignedString([]byte(h.jwtSecret))
	if err != nil {
		log.Printf("Token generation failed for user '%s': %v", req.Username, err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "could not log in"})
	}
	log.Printf("Token generated successfully for user '%s'.", req.Username)

	return c.JSON(fiber.Map{"token": t})
}
