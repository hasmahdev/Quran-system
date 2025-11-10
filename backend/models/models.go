package models

// User represents a user in the system (teacher, student, or admin).
type User struct {
	ID             int     `json:"id"`
	Username       string  `json:"username"`
	Password       string  `json:"password,omitempty"` // omitempty to prevent sending it in responses
	Role           string  `json:"role"`
	Phone          *string `json:"phone,omitempty"`
	Classes        []Class `json:"classes,omitempty"`
	ProgressSurah  *int    `json:"progress_surah,omitempty"`
	ProgressAyah   *int    `json:"progress_ayah,omitempty"`
	ProgressPage   *int    `json:"progress_page,omitempty"`
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

// StudentData represents the data for a student's dashboard.
type StudentData struct {
	Username      string `json:"username"`
	ProgressSurah int    `json:"progress_surah"`
	ProgressAyah  int    `json:"progress_ayah"`
	ProgressPage  int    `json:"progress_page"`
}
