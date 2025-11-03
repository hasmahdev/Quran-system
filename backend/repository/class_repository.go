package repository

import (
	"context"

	"github.com/jackc/pgx/v4/pgxpool"
	"github.com/kolind-am/quran-project/backend/models"
)

// ClassRepository defines the interface for class data operations.
type ClassRepository interface {
	FindAll(ctx context.Context) ([]models.Class, error)
	FindByTeacherID(ctx context.Context, teacherID int) ([]models.Class, error)
	Create(ctx context.Context, class *models.Class) error
	Update(ctx context.Context, id int, class *models.Class) error
	Delete(ctx context.Context, id int) error
	FindStudentsByClassID(ctx context.Context, classID int) ([]models.StudentWithProgress, error)
	FindStudentByClassAndStudentID(ctx context.Context, classID, studentID int) (*models.StudentWithProgress, error)
	AddStudentToClass(ctx context.Context, classID, studentID int) error
	RemoveStudentFromClass(ctx context.Context, classID, studentID int) error
}

type pgxClassRepository struct {
	db *pgxpool.Pool
}

// NewClassRepository creates a new class repository.
func NewClassRepository(db *pgxpool.Pool) ClassRepository {
	return &pgxClassRepository{db: db}
}

func (r *pgxClassRepository) FindAll(ctx context.Context) ([]models.Class, error) {
	rows, err := r.db.Query(ctx, "SELECT id, name, teacher_id FROM classes")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var classes []models.Class
	for rows.Next() {
		var class models.Class
		if err := rows.Scan(&class.ID, &class.Name, &class.TeacherID); err != nil {
			return nil, err
		}
		classes = append(classes, class)
	}
	return classes, nil
}

func (r *pgxClassRepository) FindByTeacherID(ctx context.Context, teacherID int) ([]models.Class, error) {
	rows, err := r.db.Query(ctx, "SELECT id, name, teacher_id FROM classes WHERE teacher_id=$1", teacherID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var classes []models.Class
	for rows.Next() {
		var class models.Class
		if err := rows.Scan(&class.ID, &class.Name, &class.TeacherID); err != nil {
			return nil, err
		}
		classes = append(classes, class)
	}
	return classes, nil
}

func (r *pgxClassRepository) Create(ctx context.Context, class *models.Class) error {
	_, err := r.db.Exec(ctx, "INSERT INTO classes (name, teacher_id) VALUES ($1, $2)", class.Name, class.TeacherID)
	return err
}

func (r *pgxClassRepository) Update(ctx context.Context, id int, class *models.Class) error {
	_, err := r.db.Exec(ctx, "UPDATE classes SET name=$1 WHERE id=$2", class.Name, id)
	return err
}

func (r *pgxClassRepository) Delete(ctx context.Context, id int) error {
	_, err := r.db.Exec(ctx, "DELETE FROM classes WHERE id=$1", id)
	return err
}

func (r *pgxClassRepository) FindStudentsByClassID(ctx context.Context, classID int) ([]models.StudentWithProgress, error) {
	query := `
		SELECT u.id, u.full_name, u.role, p.id, p.surah, p.ayah, p.page
		FROM users u
		JOIN class_members cm ON u.id = cm.student_id
		LEFT JOIN progress p ON u.id = p.student_id AND cm.class_id = p.class_id
		WHERE cm.class_id = $1
	`
	rows, err := r.db.Query(ctx, query, classID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var students []models.StudentWithProgress
	for rows.Next() {
		var student models.StudentWithProgress
		var progressID, surah, ayah, page *int
		if err := rows.Scan(&student.ID, &student.FullName, &student.Role, &progressID, &surah, &ayah, &page); err != nil {
			return nil, err
		}
		student.ProgressID = progressID
		student.Surah = surah
		student.Ayah = ayah
		student.Page = page
		students = append(students, student)
	}
	return students, nil
}

func (r *pgxClassRepository) AddStudentToClass(ctx context.Context, classID, studentID int) error {
	_, err := r.db.Exec(ctx, "INSERT INTO class_members (class_id, student_id) VALUES ($1, $2) ON CONFLICT DO NOTHING", classID, studentID)
	return err
}

func (r *pgxClassRepository) RemoveStudentFromClass(ctx context.Context, classID, studentID int) error {
	_, err := r.db.Exec(ctx, "DELETE FROM class_members WHERE class_id=$1 AND student_id=$2", classID, studentID)
	return err
}

func (r *pgxClassRepository) FindStudentByClassAndStudentID(ctx context.Context, classID, studentID int) (*models.StudentWithProgress, error) {
	query := `
        SELECT u.id, u.full_name, u.role, p.id, p.surah, p.ayah, p.page
        FROM users u
        JOIN class_members cm ON u.id = cm.student_id
        LEFT JOIN progress p ON u.id = p.student_id AND cm.class_id = p.class_id
        WHERE cm.class_id = $1 AND u.id = $2
    `
	var student models.StudentWithProgress
	var progressID, surah, ayah, page *int
	err := r.db.QueryRow(ctx, query, classID, studentID).Scan(&student.ID, &student.FullName, &student.Role, &progressID, &surah, &ayah, &page)
	if err != nil {
		return nil, err
	}
	student.ProgressID = progressID
	student.Surah = surah
	student.Ayah = ayah
	student.Page = page
	return &student, nil
}
