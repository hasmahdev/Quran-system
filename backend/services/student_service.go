package services

import (
	"context"

	"github.com/kolind-am/quran-project/backend/repository"
)

// StudentService defines the interface for student-related business logic.
type StudentService interface {
	GetStudentData(ctx context.Context, id int) (*repository.StudentData, error)
}

type studentService struct {
	repo repository.StudentRepository
}

// NewStudentService creates a new student service.
func NewStudentService(repo repository.StudentRepository) StudentService {
	return &studentService{repo: repo}
}

func (s *studentService) GetStudentData(ctx context.Context, id int) (*repository.StudentData, error) {
	return s.repo.FindStudentData(ctx, id)
}
