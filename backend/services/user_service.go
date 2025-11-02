package services

import (
	"context"

	"github.com/kolind-am/quran-project/backend/models"
	"github.com/kolind-am/quran-project/backend/repository"
	"golang.org/x/crypto/bcrypt"
)

// UserService defines the interface for user-related business logic.
type UserService interface {
	GetUsers(ctx context.Context, role string) ([]models.User, error)
	CreateUser(ctx context.Context, user *models.User) error
	UpdateUser(ctx context.Context, id int, user *models.User) (*models.User, error)
	DeleteUser(ctx context.Context, id int) error
}

// userService is an implementation of UserService.
type userService struct {
	repo repository.UserRepository
}

// NewUserService creates a new user service.
func NewUserService(repo repository.UserRepository) UserService {
	return &userService{repo: repo}
}

// GetUsers retrieves users, applying any business rules.
func (s *userService) GetUsers(ctx context.Context, role string) ([]models.User, error) {
	// In a real application, you might have more complex logic here,
	// like checking permissions or filtering based on the current user.
	return s.repo.FindUsersByRole(ctx, role)
}

// CreateUser handles the business logic for creating a new user.
func (s *userService) CreateUser(ctx context.Context, user *models.User) error {
	// Hash the password before storing it
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}
	user.Password = string(hashedPassword)

	return s.repo.CreateUser(ctx, user)
}

// UpdateUser handles the business logic for updating a user.
func (s *userService) UpdateUser(ctx context.Context, id int, user *models.User) (*models.User, error) {
	// Add any validation or business logic before updating.
	return s.repo.UpdateUser(ctx, id, user)
}

// DeleteUser handles the business logic for deleting a user.
func (s *userService) DeleteUser(ctx context.Context, id int) error {
	// You might want to add checks here, like preventing deletion of the last admin.
	return s.repo.DeleteUser(ctx, id)
}
