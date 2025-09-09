// API utility for EduBridge frontend
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';

class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Get auth token from localStorage
  getAuthToken() {
    return localStorage.getItem('token');
  }

  // Set auth token in localStorage
  setAuthToken(token) {
    localStorage.setItem('token', token);
  }

  // Remove auth token from localStorage
  removeAuthToken() {
    localStorage.removeItem('token');
  }

  // Make HTTP request
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const token = this.getAuthToken();

    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // GET request
  async get(endpoint, params = {}) {
    // Remove undefined/null params to avoid 'key=undefined' in URL
    const cleaned = Object.fromEntries(
      Object.entries(params || {}).filter(([, v]) => v !== undefined && v !== null && v !== '')
    );
    const queryString = new URLSearchParams(cleaned).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    return this.request(url, { method: 'GET' });
  }

  // POST request
  async post(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // PUT request
  async put(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // DELETE request
  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  // Upload file
  async uploadFile(endpoint, file, additionalData = {}) {
    const formData = new FormData();
    formData.append('file', file);
    
    Object.keys(additionalData).forEach(key => {
      formData.append(key, additionalData[key]);
    });

    const token = this.getAuthToken();
    const url = `${this.baseURL}${endpoint}`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Upload failed');
      }

      return data;
    } catch (error) {
      console.error('File upload failed:', error);
      throw error;
    }
  }

  // Study materials
  async uploadStudyMaterial({ file, title, description, courseId }) {
    return this.uploadFile('/materials', file, { title, description, courseId });
  }

  async getStudyMaterials(params = {}) {
    return this.get('/materials', params);
  }

  // Download binary file with auth
  async downloadFile(endpoint) {
    const token = this.getAuthToken();
    const url = `${this.baseURL}${endpoint}`;
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` })
      }
    });
    if (!res.ok) {
      let msg = 'Download failed';
      try { const j = await res.json(); if (j?.message) msg = j.message; } catch {}
      throw new Error(msg);
    }
    return res.blob();
  }

  // Authentication methods
  async login(email, password) {
    const response = await this.post('/auth/login', { email, password });
    if (response.token) {
      this.setAuthToken(response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
    }
    return response;
  }

  async register(userData) {
    const response = await this.post('/auth/register', userData);
    if (response.token) {
      this.setAuthToken(response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
    }
    return response;
  }

  async logout() {
    this.removeAuthToken();
    localStorage.removeItem('user');
  }

  async getCurrentUser() {
    return this.get('/auth/me');
  }

  async updateProfile(userData) {
    return this.put('/auth/profile', userData);
  }

  async getUsers(params = {}) {
    return this.get('/auth/users', params);
  }

  // Exam methods
  async getExams(params = {}) {
    return this.get('/exams', params);
  }

  async createExam(examData) {
    return this.post('/exams', examData);
  }

  async updateExam(id, examData) {
    return this.put(`/exams/${id}`, examData);
  }

  async deleteExam(id) {
    return this.delete(`/exams/${id}`);
  }

  async getExamResults(params = {}) {
    return this.get('/exams/results', params);
  }

  async uploadExamResults(results) {
    return this.post('/exams/results', { results });
  }

  async getExamConfigs() {
    return this.get('/exams/config');
  }

  async createExamConfig(configData) {
    return this.post('/exams/config', configData);
  }

  async getExamStats(params = {}) {
    return this.get('/exams/stats', params);
  }
  async getExamSubjectAverages(params = {}) {
    return this.get('/exams/stats', { ...params, groupBy: 'course' });
  }

  // Attendance methods
  async getAttendance(params = {}) {
    return this.get('/attendance', params);
  }

  async markAttendance(attendanceData) {
    return this.post('/attendance', attendanceData);
  }

  async updateAttendance(id, attendanceData) {
    return this.put(`/attendance/${id}`, attendanceData);
  }

  async deleteAttendance(id) {
    return this.delete(`/attendance/${id}`);
  }

  async markBulkAttendance(attendanceRecords, date, semester) {
    return this.post('/attendance/bulk', { attendanceRecords, date, semester });
  }

  async getAttendanceStats(params = {}) {
    return this.get('/attendance/stats', params);
  }

  // Doubt methods
  async getDoubts(params = {}) {
    return this.get('/doubts', params);
  }

  async createDoubt(doubtData) {
    return this.post('/doubts', doubtData);
  }

  async answerDoubt(id, answer) {
    return this.put(`/doubts/${id}/answer`, { answer });
  }

  async resolveDoubt(id) {
    return this.put(`/doubts/${id}/resolve`);
  }

  async updateDoubt(id, doubtData) {
    return this.put(`/doubts/${id}`, doubtData);
  }

  async deleteDoubt(id) {
    return this.delete(`/doubts/${id}`);
  }

  async getDoubtStats() {
    return this.get('/doubts/stats');
  }

  // Course methods
  async getCourses(params = {}) {
    return this.get('/courses', params);
  }

  async getCourseStudents(courseId) {
    return this.get(`/courses/${courseId}/students`);
  }

  async createCourse(courseData) {
    return this.post('/courses', courseData);
  }

  async updateCourse(id, courseData) {
    return this.put(`/courses/${id}`, courseData);
  }

  async deleteCourse(id) {
    return this.delete(`/courses/${id}`);
  }

  async getCourse(id) {
    return this.get(`/courses/${id}`);
  }

  // HOD: instructor assignment
  async uploadCourseAssignments(file) {
    return this.uploadFile('/courses/assignments/upload', file);
  }

  async setCourseInstructor(courseId, instructorId) {
    return this.put(`/courses/${courseId}/instructor`, { instructorId });
  }

  // Timetable methods
  async getTimetable(params = {}) {
    return this.get('/timetable', params);
  }

  async createTimetableEntry(timetableData) {
    return this.post('/timetable', timetableData);
  }

  async updateTimetableEntry(id, timetableData) {
    return this.put(`/timetable/${id}`, timetableData);
  }

  async deleteTimetableEntry(id) {
    return this.delete(`/timetable/${id}`);
  }

  async getWeeklyTimetable(params = {}) {
    return this.get('/timetable/week', params);
  }
}

// Create and export a singleton instance
const apiClient = new ApiClient();
export default apiClient;
