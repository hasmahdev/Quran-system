package repository

import (
	"context"

	"github.com/jackc/pgx/v4/pgxpool"
)

// StudentRepository defines the interface for student data operations.
type StudentRepository interface {
	FindStudentData(ctx context.Context, id int) (*StudentData, error)
}

type pgxStudentRepository struct {
	db *pgxpool.Pool
}

// NewStudentRepository creates a new student repository.
func NewStudentRepository(db *pgxpool.Pool) StudentRepository {
	return &pgxStudentRepository{db: db}
}

type StudentData struct {
	Username      string `json:"username"`
	ProgressSurah int    `json:"progress_surah"`
	ProgressAyah  int    `json:"progress_ayah"`
	ProgressPage  int    `json:"progress_page"`
}

func (r *pgxStudentRepository) FindStudentData(ctx context.Context, id int) (*StudentData, error) {
	var student StudentData
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
