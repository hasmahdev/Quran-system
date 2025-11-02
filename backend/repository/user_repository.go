package repository

import (
	"context"

	"github.com/jackc/pgx/v4/pgxpool"
	"github.com/kolind-am/quran-project/backend/models"
)

// UserRepository defines the interface for user data operations.
type UserRepository interface {
	FindUsersByRole(ctx context.Context, role string) ([]models.User, error)
	CreateUser(ctx context.Context, user *models.User) error
	UpdateUser(ctx context.Context, id int, user *models.User) error
	DeleteUser(ctx context.Context, id int) error
	FindUserByUsername(ctx context.Context, username string) (*models.User, error)
}

// pgxUserRepository is an implementation of UserRepository using pgx.
type pgxUserRepository struct {
	db *pgxpool.Pool
}

// NewUserRepository creates a new user repository.
func NewUserRepository(db *pgxpool.Pool) UserRepository {
	return &pgxUserRepository{db: db}
}

// FindUsersByRole retrieves users from the database filtered by role.
func (r *pgxUserRepository) FindUsersByRole(ctx context.Context, role string) ([]models.User, error) {
	rows, err := r.db.Query(ctx, "SELECT id, username, role, phone FROM users WHERE role=$1", role)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var users []models.User
	for rows.Next() {
		var user models.User
		if err := rows.Scan(&user.ID, &user.Username, &user.Role, &user.Phone); err != nil {
			return nil, err
		}
		users = append(users, user)
	}
	return users, nil
}

// CreateUser inserts a new user into the database.
func (r *pgxUserRepository) CreateUser(ctx context.Context, user *models.User) error {
	_, err := r.db.Exec(ctx, "INSERT INTO users (username, password, role, phone) VALUES ($1, $2, $3, $4)", user.Username, user.Password, user.Role, user.Phone)
	return err
}

// UpdateUser updates an existing user in the database.
func (r *pgxUserRepository) UpdateUser(ctx context.Context, id int, user *models.User) error {
	_, err := r.db.Exec(ctx, "UPDATE users SET username=$1, role=$2, phone=$3 WHERE id=$4", user.Username, user.Role, user.Phone, id)
	return err
}

// DeleteUser removes a user from the database.
func (r *pgxUserRepository) DeleteUser(ctx context.Context, id int) error {
	_, err := r.db.Exec(ctx, "DELETE FROM users WHERE id=$1", id)
	return err
}

// FindUserByUsername retrieves a single user by their username.
func (r *pgxUserRepository) FindUserByUsername(ctx context.Context, username string) (*models.User, error) {
	var user models.User
	err := r.db.QueryRow(ctx, "SELECT id, username, password, role, phone FROM users WHERE username=$1", username).Scan(&user.ID, &user.Username, &user.Password, &user.Role, &user.Phone)
	if err != nil {
		return nil, err
	}
	return &user, nil
}
