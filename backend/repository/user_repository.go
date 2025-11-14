package repository

import (
	"context"
	"fmt"
	"strings"

	"github.com/jackc/pgx/v4/pgxpool"
	"github.com/kolind-am/quran-project/backend/models"
)

// UserRepository defines the interface for user data operations.
type UserRepository interface {
	FindUsersByRole(ctx context.Context, role string) ([]models.User, error)
	CreateUser(ctx context.Context, user *models.User) (*models.User, error)
	UpdateUser(ctx context.Context, id string, user *models.User) (*models.User, error)
	DeleteUser(ctx context.Context, id string) error
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
        SELECT u.id, u.username, u.role, u.phone, u.progress_surah, u.progress_ayah, u.progress_page,
               c.id as class_id, c.name as class_name, c.teacher_id
        FROM users u
        LEFT JOIN student_classes sc ON u.id = sc.student_id
        LEFT JOIN classes c ON sc.class_id = c.id
        WHERE u.role = $1
    `
	rows, err := r.db.Query(ctx, query, role)
	if err != nil {
		return nil, fmt.Errorf("error querying users by role: %w", err)
	}
	defer rows.Close()

	userMap := make(map[string]*models.User)
	for rows.Next() {
		var userID, username, userRole string
		var phone *string
		var progressSurah, progressAyah, progressPage *int
		var classID, className, teacherID *string

		err := rows.Scan(&userID, &username, &userRole, &phone, &progressSurah, &progressAyah, &progressPage, &classID, &className, &teacherID)
		if err != nil {
			return nil, fmt.Errorf("error scanning user row: %w", err)
		}

		if _, exists := userMap[userID]; !exists {
			userMap[userID] = &models.User{
				ID:            userID,
				Username:      username,
				Role:          userRole,
				Phone:         phone,
				ProgressSurah: progressSurah,
				ProgressAyah:  progressAyah,
				ProgressPage:  progressPage,
				Classes:       []models.Class{},
			}
		}

		if classID != nil && className != nil && teacherID != nil {
			userMap[userID].Classes = append(userMap[userID].Classes, models.Class{
				ID:        *classID,
				Name:      *className,
				TeacherID: *teacherID,
			})
		}
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating user rows: %w", err)
	}

	users := make([]models.User, 0, len(userMap))
	for _, user := range userMap {
		users = append(users, *user)
	}

	return users, nil
}

// CreateUser inserts a new user into the database.
func (r *pgxUserRepository) CreateUser(ctx context.Context, user *models.User) (*models.User, error) {
	var createdUser models.User
	err := r.db.QueryRow(ctx, "INSERT INTO users (username, password, role, phone) VALUES ($1, $2, $3, $4) RETURNING id, username, role, phone", user.Username, user.Password, user.Role, user.Phone).Scan(&createdUser.ID, &createdUser.Username, &createdUser.Role, &createdUser.Phone)
	if err != nil {
		return nil, err
	}
	return &createdUser, nil
}

// UpdateUser updates an existing user in the database.
func (r *pgxUserRepository) UpdateUser(ctx context.Context, id string, user *models.User) (*models.User, error) {
	var setClauses []string
	var args []interface{}
	argId := 1

	if user.Username != "" {
		setClauses = append(setClauses, fmt.Sprintf("username=$%d", argId))
		args = append(args, user.Username)
		argId++
	}
	if user.Role != "" {
		setClauses = append(setClauses, fmt.Sprintf("role=$%d", argId))
		args = append(args, user.Role)
		argId++
	}
	if user.Phone != nil {
		setClauses = append(setClauses, fmt.Sprintf("phone=$%d", argId))
		args = append(args, *user.Phone)
		argId++
	}
	if user.Password != "" {
		setClauses = append(setClauses, fmt.Sprintf("password=$%d", argId))
		args = append(args, user.Password)
		argId++
	}
	if user.ProgressSurah != nil {
		setClauses = append(setClauses, fmt.Sprintf("progress_surah=$%d", argId))
		args = append(args, *user.ProgressSurah)
		argId++
	}
	if user.ProgressAyah != nil {
		setClauses = append(setClauses, fmt.Sprintf("progress_ayah=$%d", argId))
		args = append(args, *user.ProgressAyah)
		argId++
	}
	if user.ProgressPage != nil {
		setClauses = append(setClauses, fmt.Sprintf("progress_page=$%d", argId))
		args = append(args, *user.ProgressPage)
		argId++
	}

	// Only proceed if there are fields to update
	if len(setClauses) == 0 {
		// No fields to update, so just fetch and return the current user data
		updatedUser := &models.User{}
		err := r.db.QueryRow(ctx, "SELECT id, username, role, phone, progress_surah, progress_ayah, progress_page FROM users WHERE id=$1", id).Scan(&updatedUser.ID, &updatedUser.Username, &updatedUser.Role, &updatedUser.Phone, &updatedUser.ProgressSurah, &updatedUser.ProgressAyah, &updatedUser.ProgressPage)
		if err != nil {
			return nil, err
		}
		return updatedUser, nil
	}

	query := fmt.Sprintf("UPDATE users SET %s WHERE id=$%d RETURNING id, username, role, phone, progress_surah, progress_ayah, progress_page", strings.Join(setClauses, ", "), argId)
	args = append(args, id)

	updatedUser := &models.User{}
	err := r.db.QueryRow(ctx, query, args...).Scan(&updatedUser.ID, &updatedUser.Username, &updatedUser.Role, &updatedUser.Phone, &updatedUser.ProgressSurah, &updatedUser.ProgressAyah, &updatedUser.ProgressPage)
	if err != nil {
		return nil, err
	}
	return updatedUser, nil
}

// DeleteUser removes a user from the database.
func (r *pgxUserRepository) DeleteUser(ctx context.Context, id string) error {
	_, err := r.db.Exec(ctx, "DELETE FROM users WHERE id=$1", id)
	return err
}

// FindUserByUsername retrieves a single user by their username.
func (r *pgxUserRepository) FindUserByUsername(ctx context.Context, username string) (*models.User, error) {
	var user models.User
	err := r.db.QueryRow(ctx, "SELECT id, username, password, role, phone FROM users WHERE username=$1", username).Scan(&user.ID, &user.Username, &user.Password, &user.Role, &user.Phone)
	if err != nil {
		return nil, fmt.Errorf("error finding user by username %s: %w", username, err)
	}
	return &user, nil
}
