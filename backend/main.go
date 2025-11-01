package main

import (
	"context"
	"log"
	"os"
	"strconv"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	jwtware "github.com/gofiber/jwt/v3"
	"github.com/golang-jwt/jwt/v4"
	"github.com/jackc/pgx/v4"
	"golang.org/x/crypto/bcrypt"
)

type User struct {
	ID       int    `json:"id"`
	Username string `json:"full_name"`
	Password string `json:"password"`
	Role     string `json:"role"`
}

type StudentWithProgress struct {
	ID         int    `json:"id"`
	Username   string `json:"full_name"`
	Role       string `json:"role"`
	ProgressID *int   `json:"progress_id"`
	Surah      *int   `json:"surah"`
	Ayah       *int   `json:"ayah"`
	Page       *int   `json:"page"`
}

type LoginRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

var (
	db        *pgx.Conn
	jwtSecret = []byte(os.Getenv("JWT_SECRET"))
)

func main() {
	connStr := os.Getenv("DATABASE_URL") + "?statement_cache_mode=describe"
	var err error
	db, err = pgx.Connect(context.Background(), connStr)
	if err != nil {
		log.Fatalf("Unable to connect to database: %v\n", err)
	}
	defer db.Close(context.Background())

	app := fiber.New()

	app.Use(cors.New(cors.Config{
		AllowOrigins: "*",
		AllowHeaders: "Origin, Content-Type, Accept, Authorization",
		AllowMethods: "GET,POST,HEAD,PUT,DELETE,PATCH",
	}))
	app.Use(logger.New())

	app.Get("/", func(c *fiber.Ctx) error {
		return c.SendString("Hello, World!")
	})

	app.Post("/login", loginHandler)

	api := app.Group("/api", jwtware.New(jwtware.Config{
		SigningKey: jwtSecret,
	}))

	// User Management
	api.Get("/users", getUsers)
	api.Post("/users", createUser)
	api.Put("/users/:userId", updateUser)
	api.Delete("/users/:userId", deleteUser)

	// Class Management
	api.Get("/classes", getClasses)
	api.Get("/teachers/:teacherId/classes", getTeacherClasses)
	api.Post("/classes", createClass)
	api.Put("/classes/:classId", updateClass)
	api.Delete("/classes/:classId", deleteClass)

	// Class Member Management
	api.Get("/classes/:classId/students", getClassStudents)
	api.Post("/classes/:classId/students", addClassStudent)
	api.Delete("/classes/:classId/students/:studentId", removeClassStudent)

	// Progress Management
	api.Get("/classes/:classId/progress", getClassProgress)
	api.Put("/progress/:progressId", updateProgress)

	// Student Management
	api.Get("/students/me", getMyData)

	port := os.Getenv("PORT")
	if port == "" {
		port = "3002"
	}

	log.Fatal(app.Listen(":" + port))
}

func loginHandler(c *fiber.Ctx) error {
	var req LoginRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "cannot parse JSON"})
	}

	log.Printf("Login attempt for user: %s", req.Username)

	var user User
	err := db.QueryRow(context.Background(), "SELECT id, username, password, role FROM users WHERE username=$1", req.Username).Scan(&user.ID, &user.Username, &user.Password, &user.Role)
	if err != nil {
		log.Printf("User lookup failed for '%s': %v", req.Username, err)
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "invalid credentials"})
	}
	log.Printf("User '%s' found in database.", req.Username)

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
		log.Printf("Password comparison failed for user '%s': %v", req.Username, err)
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "invalid credentials"})
	}
	log.Printf("Password for user '%s' is correct.", req.Username)

	claims := jwt.MapClaims{
		"id":   user.ID,
		"role": user.Role,
		"exp":  time.Now().Add(time.Hour * 72).Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	t, err := token.SignedString(jwtSecret)
	if err != nil {
		log.Printf("Token generation failed for user '%s': %v", req.Username, err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "could not log in"})
	}
	log.Printf("Token generated successfully for user '%s'.", req.Username)

	return c.JSON(fiber.Map{"token": t})
}

// User Management Handlers
func getUsers(c *fiber.Ctx) error {
	role := c.Query("role")
	rows, err := db.Query(context.Background(), "SELECT id, username, role FROM users WHERE role=$1", role)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "database error"})
	}
	defer rows.Close()

	var users []User
	for rows.Next() {
		var user User
		if err := rows.Scan(&user.ID, &user.Username, &user.Role); err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "database error"})
		}
		users = append(users, user)
	}
	return c.JSON(users)
}

func createUser(c *fiber.Ctx) error {
	var user User
	if err := c.BodyParser(&user); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "cannot parse JSON"})
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), 10)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to hash password"})
	}
	user.Password = string(hashedPassword)

	_, err = db.Exec(context.Background(), "INSERT INTO users (username, password, role) VALUES ($1, $2, $3)", user.Username, user.Password, user.Role)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "database error"})
	}

	return c.Status(fiber.StatusCreated).JSON(user)
}

func updateUser(c *fiber.Ctx) error {
	id, err := strconv.Atoi(c.Params("userId"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid user ID"})
	}

	var user User
	if err := c.BodyParser(&user); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "cannot parse JSON"})
	}

	_, err = db.Exec(context.Background(), "UPDATE users SET username=$1, role=$2 WHERE id=$3", user.Username, user.Role, id)
	if err != nil {
		log.Printf("Error updating user: %v", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "database error"})
	}

	return c.JSON(user)
}

func deleteUser(c *fiber.Ctx) error {
	id, err := strconv.Atoi(c.Params("userId"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid user ID"})
	}

	_, err = db.Exec(context.Background(), "DELETE FROM users WHERE id=$1", id)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "database error"})
	}

	return c.SendStatus(fiber.StatusNoContent)
}

// Class Management Handlers
func getClasses(c *fiber.Ctx) error {
	rows, err := db.Query(context.Background(), "SELECT id, name, teacher_id FROM classes")
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "database error"})
	}
	defer rows.Close()

	type Class struct {
		ID        int    `json:"id"`
		Name      string `json:"name"`
		TeacherID int    `json:"teacher_id"`
	}

	var classes []Class
	for rows.Next() {
		var class Class
		if err := rows.Scan(&class.ID, &class.Name, &class.TeacherID); err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "database error"})
		}
		classes = append(classes, class)
	}
	return c.JSON(classes)
}

func getTeacherClasses(c *fiber.Ctx) error {
	id, err := strconv.Atoi(c.Params("teacherId"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid teacher ID"})
	}

	rows, err := db.Query(context.Background(), "SELECT id, name, teacher_id FROM classes WHERE teacher_id=$1", id)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "database error"})
	}
	defer rows.Close()

	type Class struct {
		ID        int    `json:"id"`
		Name      string `json:"name"`
		TeacherID int    `json:"teacher_id"`
	}

	var classes []Class
	for rows.Next() {
		var class Class
		if err := rows.Scan(&class.ID, &class.Name, &class.TeacherID); err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "database error"})
		}
		classes = append(classes, class)
	}
	return c.JSON(classes)
}

func createClass(c *fiber.Ctx) error {
	type Class struct {
		Name      string `json:"name"`
		TeacherID int    `json:"teacher_id"`
	}
	var class Class
	if err := c.BodyParser(&class); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "cannot parse JSON"})
	}

	_, err := db.Exec(context.Background(), "INSERT INTO classes (name, teacher_id) VALUES ($1, $2)", class.Name, class.TeacherID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "database error"})
	}

	return c.Status(fiber.StatusCreated).JSON(class)
}

func updateClass(c *fiber.Ctx) error {
	id, err := strconv.Atoi(c.Params("classId"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid class ID"})
	}

	type Class struct {
		Name string `json:"name"`
	}
	var class Class
	if err := c.BodyParser(&class); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "cannot parse JSON"})
	}

	_, err = db.Exec(context.Background(), "UPDATE classes SET name=$1 WHERE id=$2", class.Name, id)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "database error"})
	}

	return c.JSON(class)
}

func deleteClass(c *fiber.Ctx) error {
	id, err := strconv.Atoi(c.Params("classId"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid class ID"})
	}

	_, err = db.Exec(context.Background(), "DELETE FROM classes WHERE id=$1", id)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "database error"})
	}

	return c.SendStatus(fiber.StatusNoContent)
}

// Class Member Management Handlers
func getClassStudents(c *fiber.Ctx) error {
	id, err := strconv.Atoi(c.Params("classId"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid class ID"})
	}

	query := `
        SELECT u.id, u.username, u.role, p.id, p.surah, p.ayah, p.page
        FROM users u
        JOIN class_members cm ON u.id = cm.student_id
        LEFT JOIN progress p ON u.id = p.student_id AND cm.class_id = p.class_id
        WHERE cm.class_id = $1
    `
	rows, err := db.Query(context.Background(), query, id)
	if err != nil {
		log.Printf("Error getting class students with progress: %v", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "database error"})
	}
	defer rows.Close()

	var students []StudentWithProgress
	for rows.Next() {
		var student StudentWithProgress
		if err := rows.Scan(&student.ID, &student.Username, &student.Role, &student.ProgressID, &student.Surah, &student.Ayah, &student.Page); err != nil {
			log.Printf("Error scanning student with progress: %v", err)
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "database error"})
		}
		students = append(students, student)
	}
	return c.JSON(students)
}

func addClassStudent(c *fiber.Ctx) error {
	classId, err := strconv.Atoi(c.Params("classId"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid class ID"})
	}
	type Request struct {
		StudentID int `json:"student_id"`
	}
	var req Request
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "cannot parse JSON"})
	}

	tx, err := db.Begin(context.Background())
	if err != nil {
		log.Printf("Error starting transaction: %v", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "database error"})
	}
	defer tx.Rollback(context.Background())

	_, err = tx.Exec(context.Background(), "INSERT INTO class_members (class_id, student_id) VALUES ($1, $2) ON CONFLICT DO NOTHING", classId, req.StudentID)
	if err != nil {
		log.Printf("Error adding student to class: %v", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "database error"})
	}

	user := c.Locals("user").(*jwt.Token)
	claims := user.Claims.(jwt.MapClaims)
	teacherId := int(claims["id"].(float64))

	_, err = tx.Exec(context.Background(), "INSERT INTO progress (student_id, class_id, surah, ayah, page, updated_by) VALUES ($1, $2, 1, 1, 1, $3) ON CONFLICT DO NOTHING", req.StudentID, classId, teacherId)
	if err != nil {
		log.Printf("Error creating progress for student: %v", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "database error"})
	}

	err = tx.Commit(context.Background())
	if err != nil {
		log.Printf("Error committing transaction: %v", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "database error"})
	}

	return c.SendStatus(fiber.StatusCreated)
}

func removeClassStudent(c *fiber.Ctx) error {
	classId, err := strconv.Atoi(c.Params("classId"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid class ID"})
	}
	studentId, err := strconv.Atoi(c.Params("studentId"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid student ID"})
	}

	_, err = db.Exec(context.Background(), "DELETE FROM class_members WHERE class_id=$1 AND student_id=$2", classId, studentId)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "database error"})
	}

	return c.SendStatus(fiber.StatusNoContent)
}

// Progress Management Handlers
func getClassProgress(c *fiber.Ctx) error {
	classId, err := strconv.Atoi(c.Params("classId"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid class ID"})
	}
	rows, err := db.Query(context.Background(), "SELECT id, student_id, surah, ayah, page FROM progress WHERE class_id=$1", classId)
	if err != nil {
		log.Printf("Error getting class progress: %v", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "database error"})
	}
	defer rows.Close()

	type Progress struct {
		ID        int `json:"id"`
		StudentID int `json:"student_id"`
		Surah     int `json:"surah"`
		Ayah      int `json:"ayah"`
		Page      int `json:"page"`
	}
	var progresses []Progress
	for rows.Next() {
		var progress Progress
		if err := rows.Scan(&progress.ID, &progress.StudentID, &progress.Surah, &progress.Ayah, &progress.Page); err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "database error"})
		}
		progresses = append(progresses, progress)
	}
	return c.JSON(progresses)
}

func updateProgress(c *fiber.Ctx) error {
	id, err := strconv.Atoi(c.Params("progressId"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid progress ID"})
	}
	type Progress struct {
		Surah int `json:"surah"`
		Ayah  int `json:"ayah"`
		Page  int `json:"page"`
	}
	var progress Progress
	if err := c.BodyParser(&progress); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "cannot parse JSON"})
	}
	_, err = db.Exec(context.Background(), "UPDATE progress SET surah=$1, ayah=$2, page=$3 WHERE id=$4", progress.Surah, progress.Ayah, progress.Page, id)
	if err != nil {
		log.Printf("Error updating progress: %v", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "database error"})
	}
	return c.JSON(progress)
}

// Student Management Handlers
func getMyData(c *fiber.Ctx) error {
	user := c.Locals("user").(*jwt.Token)
	claims := user.Claims.(jwt.MapClaims)
	id := int(claims["id"].(float64))

	var student struct {
		Username      string `json:"username"`
		ProgressSurah int    `json:"progress_surah"`
		ProgressAyah  int    `json:"progress_ayah"`
		ProgressPage  int    `json:"progress_page"`
	}

	err := db.QueryRow(context.Background(), "SELECT username, progress_surah, progress_ayah, progress_page FROM users WHERE id=$1", id).Scan(&student.Username, &student.ProgressSurah, &student.ProgressAyah, &student.ProgressPage)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "database error"})
	}

	return c.JSON(student)
}
