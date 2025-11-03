package services

import (
	"context"

	"github.com/kolind-am/quran-project/backend/models"
	"github.com/kolind-am/quran-project/backend/repository"
)

// ProgressService defines the interface for progress-related business logic.
type ProgressService interface {
	GetClassProgress(ctx context.Context, classID int) ([]models.Progress, error)
	UpdateProgress(ctx context.Context, id int, progress *models.Progress) error
	CreateProgress(ctx context.Context, progress *models.Progress) (*models.Progress, error)
}

type progressService struct {
	repo repository.ProgressRepository
}

// NewProgressService creates a new progress service.
func NewProgressService(repo repository.ProgressRepository) ProgressService {
	return &progressService{repo: repo}
}

func (s *progressService) GetClassProgress(ctx context.Context, classID int) ([]models.Progress, error) {
	return s.repo.FindByClassID(ctx, classID)
}

func (s *progressService) UpdateProgress(ctx context.Context, id int, progress *models.Progress) error {
	return s.repo.Update(ctx, id, progress)
}

func (s *progressService) CreateProgress(ctx context.Context, progress *models.Progress) (*models.Progress, error) {
	return s.repo.Create(ctx, progress)
}
