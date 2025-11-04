package handlers

import (
	"log"
	"strconv"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v4"
	"github.com/kolind-am/quran-project/backend/models"
	"github.com/kolind-am/quran-project/backend/services"
)

// ClassHandler holds the class service.
type ClassHandler struct {
	service services.ClassService
}

// NewClassHandler creates a new ClassHandler.
func NewClassHandler(service services.ClassService) *ClassHandler {
	return &ClassHandler{service: service}
}

// GetClasses handles the request to get all classes.
func (h *ClassHandler) GetClasses(c *fiber.Ctx) error {
	classes, err := h.service.GetClasses(c.Context())
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to get classes"})
	}
	return c.JSON(classes)
}

// GetTeacherClasses handles the request to get a teacher's classes.
func (h *ClassHandler) GetTeacherClasses(c *fiber.Ctx) error {
	id, err := strconv.Atoi(c.Params("teacherId"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid teacher ID"})
	}
	classes, err := h.service.GetTeacherClasses(c.Context(), id)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to get teacher classes"})
	}
	return c.JSON(classes)
}

// CreateClass handles the request to create a new class.
func (h *ClassHandler) CreateClass(c *fiber.Ctx) error {
	var class models.Class
	if err := c.BodyParser(&class); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "cannot parse JSON"})
	}
	if err := h.service.CreateClass(c.Context(), &class); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to create class"})
	}
	return c.Status(fiber.StatusCreated).JSON(class)
}

// UpdateClass handles the request to update a class.
func (h *ClassHandler) UpdateClass(c *fiber.Ctx) error {
	id, err := strconv.Atoi(c.Params("classId"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid class ID"})
	}
	var class models.Class
	if err := c.BodyParser(&class); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "cannot parse JSON"})
	}
	if err := h.service.UpdateClass(c.Context(), id, &class); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to update class"})
	}
	return c.JSON(class)
}

// DeleteClass handles the request to delete a class.
func (h *ClassHandler) DeleteClass(c *fiber.Ctx) error {
	id, err := strconv.Atoi(c.Params("classId"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid class ID"})
	}
	if err := h.service.DeleteClass(c.Context(), id); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to delete class"})
	}
	return c.SendStatus(fiber.StatusNoContent)
}

// GetClassStudents handles the request to get students in a class.
func (h *ClassHandler) GetClassStudents(c *fiber.Ctx) error {
	id, err := strconv.Atoi(c.Params("classId"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid class ID"})
	}
	students, err := h.service.GetClassStudents(c.Context(), id)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to get class students"})
	}
	return c.JSON(students)
}

// AddClassStudent handles the request to add a student to a class.
func (h *ClassHandler) AddClassStudent(c *fiber.Ctx) error {
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

	// Validate student_id
	if req.StudentID <= 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "student_id is required and must be a positive integer"})
	}

	user := c.Locals("user").(*jwt.Token)
	claims := user.Claims.(jwt.MapClaims)
	teacherId := int(claims["id"].(float64))

	log.Printf("Attempting to add student %d to class %d by teacher %d", req.StudentID, classId, teacherId)

	student, err := h.service.AddStudentToClass(c.Context(), classId, req.StudentID, teacherId)
	if err != nil {
		log.Printf("Error adding student to class: %v", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to add student to class"})
	}

	log.Printf("Successfully added student %d to class %d", req.StudentID, classId)
	return c.Status(fiber.StatusCreated).JSON(student)
}

// RemoveClassStudent handles the request to remove a student from a class.
func (h *ClassHandler) RemoveClassStudent(c *fiber.Ctx) error {
	classId, err := strconv.Atoi(c.Params("classId"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid class ID"})
	}
	studentId, err := strconv.Atoi(c.Params("studentId"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid student ID"})
	}
	if err := h.service.RemoveStudentFromClass(c.Context(), classId, studentId); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to remove student from class"})
	}
	return c.SendStatus(fiber.StatusNoContent)
}
