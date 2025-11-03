package models

// User represents a user in the system (teacher, student, or admin).
type User struct {
	ID       int     `json:"id"`
	Username string  `json:"full_name"`
	Password string  `json:"password,omitempty"` // omitempty to prevent sending it in responses
	Role     string  `json:"role"`
	Phone    *string `json:"phone,omitempty"`
}

// StudentWithProgress represents a student with their progress information.
type StudentWithProgress struct {
	ID         int    `json:"id"`
	FullName   string `json:"full_name"`
	Role       string `json:"role"`
	ProgressID *int   `json:"progress_id"`
	Surah      *int   `json:"surah"`
	Ayah       *int   `json:"ayah"`
	Page       *int   `json:"page"`
}

// LoginRequest represents the payload for a login request.
type LoginRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

// Class represents a class or a group of students.
type Class struct {
	ID        int    `json:"id"`
	Name      string `json:"name"`
	TeacherID int    `json:"teacher_id"`
}

// Progress represents a student's progress in a specific class.
type Progress struct {
	ID        int `json:"id"`
	StudentID int `json:"student_id"`
	ClassID   int `json:"class_id"` // Added to associate progress with a class
	Surah     int `json:"surah"`
	Ayah      int `json:"ayah"`
	Page      int `json:"page"`
	UpdatedBy int `json:"updated_by"` // Teacher who updated the progress
}

// StudentData represents the data for a student's dashboard.
type StudentData struct {
	Username      string `json:"username"`
	ProgressSurah int    `json:"progress_surah"`
	ProgressAyah  int    `json:"progress_ayah"`
	ProgressPage  int    `json:"progress_page"`
}
