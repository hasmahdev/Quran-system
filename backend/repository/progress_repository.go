package repository

import (
	"context"

	"github.com/jackc/pgx/v4/pgxpool"
	"github.com/kolind-am/quran-project/backend/models"
)

// ProgressRepository defines the interface for progress data operations.
type ProgressRepository interface {
	FindByClassID(ctx context.Context, classID int) ([]models.Progress, error)
	Update(ctx context.Context, id int, progress *models.Progress) error
	Create(ctx context.Context, progress *models.Progress) (*models.Progress, error)
}

type pgxProgressRepository struct {
	db *pgxpool.Pool
}

// NewProgressRepository creates a new progress repository.
func NewProgressRepository(db *pgxpool.Pool) ProgressRepository {
	return &pgxProgressRepository{db: db}
}

func (r *pgxProgressRepository) FindByClassID(ctx context.Context, classID int) ([]models.Progress, error) {
	rows, err := r.db.Query(ctx, "SELECT id, student_id, surah, ayah, page FROM progress WHERE class_id=$1", classID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var progresses []models.Progress
	for rows.Next() {
		var progress models.Progress
		if err := rows.Scan(&progress.ID, &progress.StudentID, &progress.Surah, &progress.Ayah, &progress.Page); err != nil {
			return nil, err
		}
		progresses = append(progresses, progress)
	}
	return progresses, nil
}

func (r *pgxProgressRepository) Update(ctx context.Context, id int, progress *models.Progress) error {
	_, err := r.db.Exec(ctx, "UPDATE progress SET surah=$1, ayah=$2, page=$3 WHERE id=$4", progress.Surah, progress.Ayah, progress.Page, id)
	return err
}

func (r *pgxProgressRepository) Create(ctx context.Context, progress *models.Progress) (*models.Progress, error) {
	query := `
		INSERT INTO progress (student_id, class_id, surah, ayah, page, updated_by)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING id, student_id, class_id, surah, ayah, page, updated_by
	`
	createdProgress := &models.Progress{}
	err := r.db.QueryRow(ctx, query, progress.StudentID, progress.ClassID, progress.Surah, progress.Ayah, progress.Page, progress.UpdatedBy).Scan(
		&createdProgress.ID,
		&createdProgress.StudentID,
		&createdProgress.ClassID,
		&createdProgress.Surah,
		&createdProgress.Ayah,
		&createdProgress.Page,
		&createdProgress.UpdatedBy,
	)
	if err != nil {
		return nil, err
	}
	return createdProgress, nil
}
