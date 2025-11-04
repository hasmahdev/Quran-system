const API_URL = 'https://qu.ghars.site/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'API request failed');
  }
  // For DELETE requests with no body
  if (response.status === 204) {
    return true;
  }
  return response.json();
};

// User Functions
export const getUsersByRole = async (role: string) => {
  const response = await fetch(`${API_URL}/users?role=${role}`, {
    headers: getAuthHeaders(),
    cache: 'no-cache',
  });
  const data = await handleResponse(response);
  return data || [];
};

export const createUser = async (userData: any) => {
  const response = await fetch(`${API_URL}/users`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(userData),
  });
  return handleResponse(response);
};

export const updateUser = async (userId: string, updates: any) => {
  const response = await fetch(`${API_URL}/users/${userId}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(updates),
  });
  return handleResponse(response);
};

export const deleteUser = async (userId: string) => {
  await fetch(`${API_URL}/users/${userId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  return true;
};

// Student Functions
export const getStudents = async () => {
  const response = await fetch(`${API_URL}/students`, {
    headers: getAuthHeaders(),
    cache: 'no-cache',
  });
  const data = await handleResponse(response);
  return data || [];
};

export const getMyData = async () => {
    const response = await fetch(`${API_URL}/students/me`, {
        headers: getAuthHeaders(),
        cache: 'no-cache',
    });
    return handleResponse(response);
};

export const createStudentProgress = async (progressData: any) => {
    const response = await fetch(`${API_URL}/progress`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(progressData),
    });
    return handleResponse(response);
};

// Progress Functions
export const getProgressForClass = async (classId: string) => {
    const response = await fetch(`${API_URL}/classes/${classId}/progress`, {
        headers: getAuthHeaders(),
        cache: 'no-cache',
    });
    return handleResponse(response);
};

export const updateStudentProgress = async (progressId: string, updates: any) => {
    const response = await fetch(`${API_URL}/progress/${progressId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updates),
    });
    return handleResponse(response);
};

// Class Member Functions
export const getStudentsInClass = async (classId: string) => {
    const response = await fetch(`${API_URL}/classes/${classId}/students`, {
        headers: getAuthHeaders(),
        cache: 'no-cache',
    });
    return handleResponse(response);
};

export const addStudentToClass = async (classId: string, studentId: string) => {
    const response = await fetch(`${API_URL}/classes/${classId}/students`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ student_id: studentId }),
    });
    return handleResponse(response);
};

export const removeStudentFromClass = async (classId: string, studentId: string) => {
    await fetch(`${API_URL}/classes/${classId}/students/${studentId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
    });
    return true;
};

// Class Functions
export const getClasses = async () => {
    const response = await fetch(`${API_URL}/classes`, {
        headers: getAuthHeaders(),
        cache: 'no-cache',
    });
    const data = await handleResponse(response);
    return data || [];
};

export const getClassesByTeacher = async (teacherId: string) => {
    const response = await fetch(`${API_URL}/teachers/${teacherId}/classes`, {
        headers: getAuthHeaders(),
        cache: 'no-cache',
    });
    return handleResponse(response);
};

export const createClass = async (classData: any) => {
    const response = await fetch(`${API_URL}/classes`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(classData),
    });
    return handleResponse(response);
};

export const updateClass = async (classId: string, updates: any) => {
    const response = await fetch(`${API_URL}/classes/${classId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updates),
    });
    return handleResponse(response);
};

export const deleteClass = async (classId: string) => {
    await fetch(`${API_URL}/classes/${classId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
    });
    return true;
};
