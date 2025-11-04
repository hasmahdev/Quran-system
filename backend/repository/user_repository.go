package repository

import (
	"context"
	"strconv"

	"github.com/jackc/pgx/v4/pgxpool"
	"github.com/kolind-am/quran-project/backend/models"
)

// UserRepository defines the interface for user data operations.
type UserRepository interface {
	FindUsersByRole(ctx context.Context, role string) ([]models.User, error)
	CreateUser(ctx context.Context, user *models.User) error
	UpdateUser(ctx context.Context, id int, user *models.User) (*models.User, error)
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
	query := `
		SELECT u.id, u.username, u.role, u.phone, c.id, c.name, c.teacher_id
		FROM users u
		LEFT JOIN class_members cm ON u.id = cm.student_id
		LEFT JOIN classes c ON cm.class_id = c.id
		WHERE u.role = $1
	`
	rows, err := r.db.Query(ctx, query, role)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	userMap := make(map[int]*models.User)
	for rows.Next() {
		var user models.User
		var class models.Class
		var classId, teacherId *int
		var className *string
		if err := rows.Scan(&user.ID, &user.Username, &user.Role, &user.Phone, &classId, &className, &teacherId); err != nil {
			return nil, err
		}

		if _, ok := userMap[user.ID]; !ok {
			userMap[user.ID] = &user
		}

		if classId != nil {
			class.ID = *classId
			class.Name = *className
			class.TeacherID = *teacherId
			userMap[user.ID].Classes = append(userMap[user.ID].Classes, class)
		}
	}

	var users []models.User
	for _, user := range userMap {
		users = append(users, *user)
	}

	return users, nil
}

// CreateUser inserts a new user into the database.
func (r *pgxUserRepository) CreateUser(ctx context.Context, user *models.User) error {
	_, err := r.db.Exec(ctx, "INSERT INTO users (username, password, role, phone) VALUES ($1, $2, $3, $4)", user.Username, user.Password, user.Role, user.Phone)
	return err
}

// UpdateUser updates an existing user in the database.
func (r *pgxUserRepository) UpdateUser(ctx context.Context, id int, user *models.User) (*models.User, error) {
	// Start building the query
	query := "UPDATE users SET"
	var args []interface{}
	argId := 1

	if user.Username != "" {
		query += " username=$" + strconv.Itoa(argId)
		args = append(args, user.Username)
		argId++
	}

	if user.Role != "" {
		query += ", role=$" + strconv.Itoa(argId)
		args = append(args, user.Role)
		argId++
	}

	if user.Phone != nil {
		query += ", phone=$" + strconv.Itoa(argId)
		args = append(args, *user.Phone)
		argId++
	}

	if user.Password != "" {
		query += ", password=$" + strconv.Itoa(argId)
		args = append(args, user.Password)
		argId++
	}

	query += " WHERE id=$" + strconv.Itoa(argId) + " RETURNING id, username, role, phone"
	args = append(args, id)

	updatedUser := &models.User{}
	err := r.db.QueryRow(ctx, query, args...).Scan(&updatedUser.ID, &updatedUser.Username, &updatedUser.Role, &updatedUser.Phone)
	if err != nil {
		return nil, err
	}
	return updatedUser, nil
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
