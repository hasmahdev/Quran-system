package repository

import (
	"context"

	"github.com/jackc/pgx/v4/pgxpool"
	"github.com/kolind-am/quran-project/backend/models"
)

// StudentRepository defines the interface for student data operations.
type StudentRepository interface {
	FindStudentData(ctx context.Context, id int) (*models.StudentData, error)
}

type pgxStudentRepository struct {
	db *pgxpool.Pool
}

// NewStudentRepository creates a new student repository.
func NewStudentRepository(db *pgxpool.Pool) StudentRepository {
	return &pgxStudentRepository{db: db}
}

func (r *pgxStudentRepository) FindStudentData(ctx context.Context, id int) (*models.StudentData, error) {
	var student models.StudentData
	query := `
		SELECT u.username, p.surah, p.ayah, p.page
		FROM users u
		LEFT JOIN progress p ON u.id = p.student_id
		WHERE u.id = $1
		ORDER BY p.id DESC
		LIMIT 1
	`
	err := r.db.QueryRow(ctx, query, id).Scan(&student.Username, &student.ProgressSurah, &student.ProgressAyah, &student.ProgressPage)
	if err != nil {
		return nil, err
	}
	return &student, nil
}
