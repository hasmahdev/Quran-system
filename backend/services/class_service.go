package services

import (
	"context"

	"github.com/kolind-am/quran-project/backend/models"
	"github.com/kolind-am/quran-project/backend/repository"
)

// ClassService defines the interface for class-related business logic.
type ClassService interface {
	GetClasses(ctx context.Context) ([]models.Class, error)
	GetTeacherClasses(ctx context.Context, teacherID int) ([]models.Class, error)
	CreateClass(ctx context.Context, class *models.Class) error
	UpdateClass(ctx context.Context, id int, class *models.Class) error
	DeleteClass(ctx context.Context, id int) error
	GetClassStudents(ctx context.Context, classID int) ([]models.StudentWithProgress, error)
	AddStudentToClass(ctx context.Context, classID, studentID, teacherId int) error
	RemoveStudentFromClass(ctx context.Context, classID, studentID int) error
}

type classService struct {
	classRepo    repository.ClassRepository
	progressRepo repository.ProgressRepository // To create progress when adding a student
}

// NewClassService creates a new class service.
func NewClassService(classRepo repository.ClassRepository, progressRepo repository.ProgressRepository) ClassService {
	return &classService{classRepo: classRepo, progressRepo: progressRepo}
}

func (s *classService) GetClasses(ctx context.Context) ([]models.Class, error) {
	return s.classRepo.FindAll(ctx)
}

func (s *classService) GetTeacherClasses(ctx context.Context, teacherID int) ([]models.Class, error) {
	return s.classRepo.FindByTeacherID(ctx, teacherID)
}

func (s *classService) CreateClass(ctx context.Context, class *models.Class) error {
	return s.classRepo.Create(ctx, class)
}

func (s *classService) UpdateClass(ctx context.Context, id int, class *models.Class) error {
	return s.classRepo.Update(ctx, id, class)
}

func (s *classService) DeleteClass(ctx context.Context, id int) error {
	return s.classRepo.Delete(ctx, id)
}

func (s *classService) GetClassStudents(ctx context.Context, classID int) ([]models.StudentWithProgress, error) {
	return s.classRepo.FindStudentsByClassID(ctx, classID)
}

func (s *classService) AddStudentToClass(ctx context.Context, classID, studentID, teacherId int) error {
	// This logic requires a transaction to ensure atomicity, which should be handled in the repository/database layer.
	// For simplicity in this refactoring, we'll call the methods sequentially.
	// A more robust implementation would involve a transaction.
	if err := s.classRepo.AddStudentToClass(ctx, classID, studentID); err != nil {
		return err
	}

	// Create initial progress for the student
	progress := &models.Progress{
		StudentID: studentID,
		ClassID:   classID,
		Surah:     1,
		Ayah:      1,
		Page:      1,
		UpdatedBy: teacherId,
	}
	return s.progressRepo.Create(ctx, progress)
}

func (s *classService) RemoveStudentFromClass(ctx context.Context, classID, studentID int) error {
	return s.classRepo.RemoveStudentFromClass(ctx, classID, studentID)
}
