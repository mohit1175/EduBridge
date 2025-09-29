import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import apiClient from '../utils/api';
import '../styles/Courses.css';
import '../styles/Dashboard.css';

function CoursesNew() {
  const { user, isStudent, isTeacher, isHOD } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // State for courses
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [selectedTeachers, setSelectedTeachers] = useState([]);
  const [drawer, setDrawer] = useState({ open: false, course: null, students: [], query: '', candidates: [], busy: false });
  
  // State for filters
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [semesterFilter, setSemesterFilter] = useState('All');
  // Pagination (fixed 5 per page)
  const [page, setPage] = useState(1);
  const [perPage] = useState(5);
  
  // State for creating new course
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newCourse, setNewCourse] = useState({
    courseName: '',
    courseCode: '',
    department: '',
    semester: '',
    credits: '',
    description: ''
  });

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  // Reset page when filters or page size change
  useEffect(() => {
    setPage(1);
  }, [departmentFilter, semesterFilter, perPage]);

  const loadData = async () => {
    try {
      setLoading(true);
  const [coursesResponse, teacherList] = await Promise.all([
        apiClient.getCourses(),
        isHOD ? apiClient.getUsers({ role: 'teacher_level2', department: user?.department }) : Promise.resolve([])
      ]);
      setCourses(coursesResponse);
  setTeachers(teacherList || []);
    } catch (error) {
      console.error('Error loading courses data:', error);
      setError('Failed to load courses data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    try {
      await apiClient.createCourse({
        ...newCourse,
        semester: parseInt(newCourse.semester),
        credits: parseInt(newCourse.credits)
      });
      setNewCourse({
        courseName: '',
        courseCode: '',
        department: '',
        semester: '',
        credits: '',
        description: ''
      });
      setShowCreateForm(false);
      await loadData();
    } catch (error) {
      console.error('Error creating course:', error);
      alert('Failed to create course');
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm('Are you sure you want to delete this course?')) {
      return;
    }

    try {
      await apiClient.deleteCourse(courseId);
      await loadData();
    } catch (error) {
      console.error('Error deleting course:', error);
      alert('Failed to delete course');
    }
  };

  const handleSetInstructor = async (courseId, instructorId) => {
    if (!instructorId) return; // ignore clearing via placeholder
    try {
      await apiClient.setCourseInstructor(courseId, instructorId);
      await loadData();
    } catch (e) {
      alert(e.message || 'Failed to update instructor');
    }
  };

  const handleAddInstructors = async (courseId, ids = selectedTeachers) => {
    try {
      if (!ids || !ids.length) return;
      await apiClient.addCourseInstructors(courseId, ids);
      setSelectedTeachers([]);
      await loadData();
    } catch (e) {
      alert(e.message || 'Failed to add instructors');
    }
  };

  const handleRemoveInstructor = async (courseId, teacherId) => {
    try {
      await apiClient.removeCourseInstructor(courseId, teacherId);
      await loadData();
    } catch (e) {
      alert(e.message || 'Failed to remove instructor');
    }
  };

  // Bulk assignment upload (HOD)
  const [assignFile, setAssignFile] = useState(null);
  const [uploadResults, setUploadResults] = useState(null);
  const onUploadAssignments = async (e) => {
    e.preventDefault();
    if (!assignFile) return;
    try {
      const res = await apiClient.uploadCourseAssignments(assignFile);
      const results = res?.results || [];
      const assigned = results.filter(r => r.status === 'assigned').length;
      const skipped = results.filter(r => r.status !== 'assigned').length;
      setUploadResults({ assigned, skipped, items: results.slice(0, 10) });
      setAssignFile(null);
      await loadData();
      // keep a subtle confirmation
      console.info('Assignments processed');
    } catch (err) {
      alert(err.message || 'Upload failed');
    }
  };

  const downloadTemplate = () => {
    const headers = ['courseCode','courseName','department','semester','credits','teacherEmail'];
    const csv = headers.join(',') + '\n';
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'course_assign_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // HOD drawer helpers
  const openManageStudents = async (course) => {
    try {
      setDrawer(d => ({ ...d, open: true, course, busy: true, query: '' }));
  const fresh = await apiClient.getCourse(course._id);
  setDrawer(d => ({ ...d, students: fresh?.students || [], busy: false }));
    } catch (e) {
      alert(e.message || 'Failed to load students');
      setDrawer(d => ({ ...d, busy: false }));
    }
  };

  const searchCandidates = async (q) => {
    setDrawer(d => ({ ...d, query: q }));
    if (!q || q.length < 2) { setDrawer(d => ({ ...d, candidates: [] })); return; }
    try {
      // Simple filter: same department+semester students
      const users = await apiClient.getUsers({ role: 'student', department: user?.department });
      const lc = q.toLowerCase();
      const out = (users || []).filter(u => (
        (u.email?.toLowerCase().includes(lc)) || (u.name?.toLowerCase().includes(lc)) || (u.rollNumber?.toLowerCase?.().includes(lc))
      ));
      setDrawer(d => ({ ...d, candidates: out.slice(0, 10) }));
    } catch (_) {}
  };

  const enrollCandidate = async (studentId) => {
    try {
      setDrawer(d => ({ ...d, busy: true }));
      await apiClient.enrollStudentToCourse(drawer.course._id, studentId);
  const fresh = await apiClient.getCourse(drawer.course._id);
  setDrawer(d => ({ ...d, students: fresh?.students || [], candidates: [], query: '', busy: false }));
    } catch (e) {
      alert(e.message || 'Failed to enroll');
      setDrawer(d => ({ ...d, busy: false }));
    }
  };

  const unenrollStudent = async (studentId) => {
    try {
  if (!window.confirm('Remove this student from the course?')) return;
      setDrawer(d => ({ ...d, busy: true }));
      await apiClient.unenrollStudentFromCourse(drawer.course._id, studentId);
  const fresh = await apiClient.getCourse(drawer.course._id);
  setDrawer(d => ({ ...d, students: fresh?.students || [], busy: false }));
    } catch (e) {
      alert(e.message || 'Failed to unenroll');
      setDrawer(d => ({ ...d, busy: false }));
    }
  };

  // Filter courses
  let filteredCourses = courses;
  if (isStudent) {
    // For students, default to their department and semester
    filteredCourses = filteredCourses.filter(course => (
      (!user?.department || course.department === user.department) &&
      (!user?.semester || course.semester === user.semester)
    ));
  } else if (isTeacher) {
    // Show only courses taught by this teacher
    filteredCourses = filteredCourses.filter(course => course.instructor?._id === user?.id);
  } else {
    if (departmentFilter !== 'All') {
      filteredCourses = filteredCourses.filter(course => course.department === departmentFilter);
    }
    if (semesterFilter !== 'All') {
      filteredCourses = filteredCourses.filter(course => course.semester === parseInt(semesterFilter));
    }
  }

  // Get unique departments and semesters for filters
  const departments = Array.from(new Set(courses.map(course => course.department)));
  const semesters = Array.from(new Set(courses.map(course => course.semester))).sort();

  // Pagination math
  const totalPages = Math.max(1, Math.ceil((filteredCourses?.length || 0) / perPage));
  const safePage = Math.min(page, totalPages);
  const startIdx = (safePage - 1) * perPage;
  const endIdx = startIdx + perPage;
  const paginatedCourses = filteredCourses.slice(startIdx, endIdx);

  if (loading) {
    return (
      <div className="courses-page">
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <h3>Loading courses...</h3>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="courses-page">
        <div style={{ textAlign: 'center', padding: '50px', color: 'red' }}>
          <h3>Error: {error}</h3>
          <button onClick={loadData} style={{ marginTop: '20px', padding: '10px 20px' }}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="courses-page">
      <div className="courses-header">
        <h2>{isStudent ? 'My Semester Subjects' : isTeacher ? 'My Courses' : 'Courses'}</h2>
        {isHOD && (
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <form onSubmit={onUploadAssignments} style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <input type="file" accept=".xlsx,.xls,.csv" onChange={(e)=>setAssignFile(e.target.files?.[0]||null)} />
              <button type="submit" className="btn-primary">Bulk Assign</button>
              <button type="button" className="btn-secondary" onClick={downloadTemplate}>Download Template</button>
            </form>
            <button 
              onClick={() => setShowCreateForm(true)}
              className="btn-primary"
            >
              Add New Course
            </button>
          </div>
        )}
      </div>

      {isHOD && uploadResults && (
        <div className="upload-results" role="region" aria-label="Bulk assign results">
          <strong>Bulk Assign Summary:</strong>
          <div className="upload-summary">
            <span className="ok">Assigned: {uploadResults.assigned}</span>
            <span className="warn">Skipped: {uploadResults.skipped}</span>
          </div>
          {uploadResults.items?.length > 0 && (
            <ul className="upload-list">
              {uploadResults.items.map((it, idx) => (
                <li key={idx}>
                  <span className={`tag ${it.status === 'assigned' ? 'ok' : 'warn'}`}>{it.status}</span>
                  {it.row?.courseCode || it.courseId ? ' - ' : ' '}
                  {it.row?.courseCode || ''}
                  {it.instructor ? ` → ${it.instructor}` : ''}
                  {it.reason ? ` (${it.reason})` : ''}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Filters (hide for students) */}
      {!isStudent && (
        <div className="courses-filters">
          <select value={departmentFilter} onChange={(e) => setDepartmentFilter(e.target.value)}>
            <option value="All">All Departments</option>
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>

          <select value={semesterFilter} onChange={(e) => setSemesterFilter(e.target.value)}>
            <option value="All">All Semesters</option>
            {semesters.map(sem => (
              <option key={sem} value={sem}>Semester {sem}</option>
            ))}
          </select>
        </div>
      )}

      {/* Create Course Form */}
      {showCreateForm && (
        <div className="create-course-modal">
          <div className="modal-content">
            <h3>Add New Course</h3>
            <form onSubmit={handleCreateCourse}>
              <div className="form-group">
                <label>Course Name:</label>
                <input
                  type="text"
                  value={newCourse.courseName}
                  onChange={(e) => setNewCourse({ ...newCourse, courseName: e.target.value })}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Course Code:</label>
                <input
                  type="text"
                  value={newCourse.courseCode}
                  onChange={(e) => setNewCourse({ ...newCourse, courseCode: e.target.value })}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Department:</label>
                <input
                  type="text"
                  value={newCourse.department}
                  onChange={(e) => setNewCourse({ ...newCourse, department: e.target.value })}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Semester:</label>
                <select
                  value={newCourse.semester}
                  onChange={(e) => setNewCourse({ ...newCourse, semester: e.target.value })}
                  required
                >
                  <option value="">Select Semester</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                    <option key={sem} value={sem}>Semester {sem}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label>Credits:</label>
                <select
                  value={newCourse.credits}
                  onChange={(e) => setNewCourse({ ...newCourse, credits: e.target.value })}
                  required
                >
                  <option value="">Select Credits</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(credit => (
                    <option key={credit} value={credit}>{credit} Credits</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label>Description:</label>
                <textarea
                  value={newCourse.description}
                  onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                  rows={3}
                />
              </div>
              
              <div className="form-actions">
                <button type="submit" className="btn-primary">Create Course</button>
                <button 
                  type="button" 
                  onClick={() => setShowCreateForm(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Courses Grid */}
      <div className="courses-grid">
        {filteredCourses.length === 0 ? (
          <div className="no-courses">
            <h3>No courses found</h3>
            <p>No courses match your current filters.</p>
          </div>
        ) : (
          paginatedCourses.map(course => (
            <div key={course._id} className="course-card">
              <div className="course-header">
                <h3>{course.courseName}</h3>
                <span className="course-code">{course.courseCode}</span>
              </div>
              
              <div className="course-details">
                <p><strong>Program:</strong> {course.program || '—'}</p>
                <p><strong>Department:</strong> {course.department}</p>
                <p><strong>Semester:</strong> {course.semester}</p>
                <p><strong>Credits:</strong> {course.credits}</p>
                <p><strong>Instructor:</strong> {course.instructor?.name || 'TBA'}</p>
                {course.instructors?.length > 0 && (
                  <div style={{ marginTop: 6 }}>
                    <strong>Co-Instructors:</strong>
                    <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginTop:6 }}>
                      {course.instructors.map(t => (
                        <span key={t._id} style={{ background:'#eef2ff', padding:'2px 8px', borderRadius: 10 }}>
                          {t.name}
                          {isHOD && (
                            <button onClick={()=>handleRemoveInstructor(course._id, t._id)} style={{ marginLeft:6, border:'none', background:'transparent', cursor:'pointer' }}>×</button>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {isHOD && (
                  <div className="assign-row">
                    <select defaultValue={course.instructor?._id || ''} onChange={(e)=>handleSetInstructor(course._id, e.target.value)}>
                      <option value="">Select Instructor</option>
                      {teachers.map(t => (
                        <option key={t._id} value={t._id}>{t.name} ({t.role})</option>
                      ))}
                    </select>
                    <small className="assign-hint">Change instructor from list or use Bulk Assign for Excel upload.</small>
                  </div>
                )}
                {isHOD && (
                  <div className="assign-row" style={{ marginTop: 8 }}>
                    <label>Add Co-Instructor:</label>
                    <select
                      defaultValue=""
                      onChange={(e) => {
                        const id = e.target.value;
                        if (!id) return;
                        // avoid duplicates or selecting the main instructor
                        if (course.instructor?._id === id || (course.instructors || []).some(t => t._id === id)) {
                          e.target.value = '';
                          return;
                        }
                        handleAddInstructors(course._id, [id]);
                        // reset back to placeholder like the Instructor selector UX
                        e.target.value = '';
                      }}
                    >
                      <option value="">Select Co-Instructor</option>
                      {teachers.map(t => (
                        <option key={t._id} value={t._id}>{t.name}</option>
                      ))}
                    </select>
                  </div>
                )}
                
                {course.description && (
                  <div className="course-description">
                    <p><strong>Description:</strong></p>
                    <p>{course.description}</p>
                  </div>
                )}
              </div>
              
              <div className="course-actions">
                {isStudent || isTeacher ? (
                  <a
                    className="btn-syllabus"
                    href={`/uploads/admin/${course.courseCode}.pdf`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Download Syllabus
                  </a>
                ) : (
                  (isTeacher || isHOD) && (
                    <button 
                      onClick={() => handleDeleteCourse(course._id)}
                      className="btn-danger"
                    >
                      Delete
                    </button>
                  )
                )}
                {isHOD && (
                  <button className="btn-primary" style={{ marginLeft: 8 }} onClick={()=>openManageStudents(course)}>
                    Manage Students
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pager */}
      {filteredCourses.length > 0 && totalPages > 1 && (
        <div className="courses-pager" role="navigation" aria-label="Courses pages">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button
              key={p}
              type="button"
              className={`page-btn ${p === safePage ? 'active' : ''}`}
              onClick={() => setPage(p)}
              aria-current={p === safePage ? 'page' : undefined}
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Course Statistics */}
      {filteredCourses.length > 0 && (
        <div className="course-stats">
          <h3 className="section-heading">Course Statistics</h3>
          <div className="stats-grid">
            <div className="stat-card blue" role="figure" aria-label="Total courses">
              <div className="stat-value">{filteredCourses.length}</div>
              <div className="stat-label">Total Courses</div>
            </div>
            <div className="stat-card purple" role="figure" aria-label="Programs count">
              <div className="stat-value">{Array.from(new Set(filteredCourses.map(c => c.program))).length}</div>
              <div className="stat-label">Programs</div>
            </div>
            <div className="stat-card orange" role="figure" aria-label="Semesters count">
              <div className="stat-value">{Array.from(new Set(filteredCourses.map(c => c.semester))).length}</div>
              <div className="stat-label">Semesters</div>
            </div>
            <div className="stat-card green" role="figure" aria-label="Total credits">
              <div className="stat-value">{filteredCourses.reduce((sum, course) => sum + course.credits, 0)}</div>
              <div className="stat-label">Total Credits</div>
            </div>
          </div>
        </div>
      )}

      {/* Manage Students Drawer */}
      {isHOD && drawer.open && (
        <div style={{ position:'fixed', inset:0, background:'rgba(15,23,42,0.35)', display:'flex', justifyContent:'flex-end', zIndex:9999 }} onClick={()=>setDrawer(d=>({...d, open:false}))}>
          <div style={{ width:'420px', maxWidth:'92vw', height:'100%', background:'#fff', padding:16, overflowY:'auto' }} onClick={(e)=>e.stopPropagation()}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <h3>Manage Students – {drawer.course?.courseName}</h3>
              <button onClick={()=>setDrawer(d=>({...d, open:false}))} className="btn-secondary">Close</button>
            </div>
            <div style={{ margin:'12px 0' }}>
              <input
                placeholder="Search by email, name, or roll…"
                value={drawer.query}
                onChange={(e)=>searchCandidates(e.target.value)}
                style={{ width:'100%', padding:'10px 12px', border:'1px solid #e2e8f0', borderRadius:8 }}
              />
              {drawer.candidates?.length > 0 && (
                <div style={{ marginTop:8, border:'1px solid #e2e8f0', borderRadius:8 }}>
                  {drawer.candidates.map(u => (
                    <div key={u._id} style={{ display:'flex', justifyContent:'space-between', padding:'8px 10px', borderBottom:'1px solid #f1f5f9' }}>
                      <div>
                        <div><strong>{u.name}</strong> <small>({u.email})</small></div>
                        <div style={{ color:'#64748b', fontSize:12 }}>{u.department} • Sem {u.semester || '—'}</div>
                      </div>
                      <button
                        className="btn-primary"
                        onClick={()=>enrollCandidate(u._id)}
                        disabled={drawer.busy || (drawer.students || []).some(s => s._id === u._id)}
                      >
                        {(drawer.students || []).some(s => s._id === u._id) ? 'Enrolled' : 'Enroll'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <h4>Currently Enrolled</h4>
            {!drawer.students?.length ? (
              <div style={{ color:'#64748b' }}>No students enrolled yet.</div>
            ) : (
              <ul style={{ listStyle:'none', padding:0 }}>
                {drawer.students.map(s => (
                  <li key={s._id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 0', borderBottom:'1px solid #f1f5f9' }}>
                    <div>
                      <div><strong>{s.name}</strong> <small>({s.email})</small></div>
                      <div style={{ color:'#64748b', fontSize:12 }}>{s.rollNumber || '—'}</div>
                    </div>
                    <button className="btn-danger" onClick={()=>unenrollStudent(s._id)} disabled={drawer.busy}>Remove</button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default CoursesNew;
