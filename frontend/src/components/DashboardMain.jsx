import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../styles/Dashboard.css';
import api from '../utils/api';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, BarChart, Bar, PieChart, Pie, Cell, Legend, CartesianGrid } from 'recharts';

function DashboardMain() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const role = user?.role;

  // Backend-driven metrics
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  // Lightweight overview content per role
  const [overview, setOverview] = useState(null);
  // Student-specific weekly attendance for Insights
  const [studentWeekly, setStudentWeekly] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        if (role === 'admin') {
          const m = await api.get('/admin/metrics/overview');
          setCards([
            { label: 'Total Students', value: m.totals?.students ?? 0, color: 'blue' },
            { label: 'Total Teachers', value: m.totals?.teachers ?? 0, color: 'green' },
            { label: 'Total Courses', value: m.totals?.courses ?? 0, color: 'purple' },
            { label: 'Attendance Rate', value: `${m.attendanceRate ?? 0}%`, color: 'orange' }
          ]);
  } else if (role === 'teacher_level1') { // HOD
          const [courses, doubts, timetable] = await Promise.all([
            api.get('/courses', { department: user?.department }),
            api.get('/doubts'),
            api.get('/timetable')
          ]);
          const teacherCount = (await api.get('/auth/users', { role: 'teacher_level2', department: user?.department })).length;
          setCards([
            { label: 'Total Courses', value: courses?.length ?? 0, color: 'blue' },
            { label: 'Reports Submitted', value: doubts?.filter(d => d.status !== 'pending').length ?? 0, color: 'green' },
            { label: 'Teachers Managed', value: teacherCount ?? 0, color: 'purple' },
            { label: 'Pending Doubts', value: doubts?.filter(d => d.status === 'pending').length ?? 0, color: 'orange' }
          ]);

          // Build small overview panels
          try {
            const todayName = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][new Date().getDay()];
            const courseNames = new Set((courses || []).map(c => c.courseName));

            // Filter timetable to this department if available on entries
            const dept = user?.department;
            const filteredTT = (timetable || []).filter(t => (t?.department ? t.department === dept : true));

            // Upcoming classes today (next 3)
            const now = new Date();
            const toMins = (s) => {
              const [h,m] = String(s || '00:00').split(':').map(Number);
              return h * 60 + m;
            };
            const nowMins = now.getHours() * 60 + now.getMinutes();
            const upcomingToday = filteredTT
              .filter(e => e.day === todayName)
              .map(e => ({
                course: e.course,
                startTime: e.startTime,
                room: e.room,
                instructor: e?.instructor?.name || '',
                startMins: toMins(e.startTime)
              }))
              .filter(e => e.startMins >= nowMins)
              .sort((a,b) => a.startMins - b.startMins)
              .slice(0, 3);

            // Fallback across the week if none left today
            let upcoming = upcomingToday;
            let upcomingTitle = 'Next Department Classes';
            if (!upcoming.length) {
              const shortDays = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
              const dayToIdx = { Sunday:0, Monday:1, Tuesday:2, Wednesday:3, Thursday:4, Friday:5, Saturday:6 };
              const nowDay = now.getDay();
              const all = filteredTT.map(e => {
                const idx = dayToIdx[e.day] ?? 0;
                const sM = toMins(e.startTime);
                let delta = (idx - nowDay + 7) % 7;
                if (delta === 0 && sM <= nowMins) delta = 7;
                const offset = delta * 1440 + (sM - nowMins);
                return { course: e.course, startTime: e.startTime, room: e.room, instructor: e?.instructor?.name, dayShort: shortDays[idx], _offset: offset };
              });
              upcoming = all.filter(x => x._offset > 0).sort((a,b)=>a._offset-b._offset).slice(0,3).map(({_offset, ...rest}) => rest);
            }

            // Recent doubts in department (latest 3)
            const recentDoubts = (doubts || [])
              .filter(d => courseNames.has(d.course))
              .sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt))
              .slice(0, 3)
              .map(d => ({ subject: d.subject, course: d.course, status: d.status, createdAt: d.createdAt }));

            // Insights: courses by semester (real counts)
            const semCountsMap = new Map();
            for (const c of (courses || [])) {
              const s = c.semester || 0;
              semCountsMap.set(s, (semCountsMap.get(s) || 0) + 1);
            }
            const semBar = Array.from(semCountsMap.entries())
              .sort((a,b)=>a[0]-b[0])
              .map(([s, count]) => ({ name: `Sem ${s}`, count }));

            // Doubts by status across department
            const hodDoubtStatus = ['pending','answered','resolved'].map(st => ({ status: st, count: (doubts||[]).filter(d => courseNames.has(d.course) && d.status === st).length }));

            setOverview({
              kind: 'hod',
              upcoming,
              recentDoubts,
              upcomingTitle,
              semBar,
              hodDoubtStatus
            });
          } catch (_) {
            setOverview(null);
          }
        } else if (role === 'teacher_level2') { // Teacher
          const [myCourses, myDoubts, attStats, myTT] = await Promise.all([
            api.get('/courses', { instructor: user?._id }),
            api.get('/doubts', { assignedTo: user?._id }),
            api.get('/attendance/stats', {}),
            api.get('/timetable')
          ]);
          setCards([
            { label: 'Courses Teaching', value: myCourses?.length ?? 0, color: 'blue' },
            { label: 'Doubts Answered', value: myDoubts?.filter(d => d.status !== 'pending').length ?? 0, color: 'purple' },
            { label: 'Attendance Rate', value: `${attStats?.overall?.presentPercentage ?? 0}%`, color: 'green' },
            { label: 'Reports Submitted', value: myDoubts?.length ?? 0, color: 'orange' }
          ]);
          try {
            const todayName = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][new Date().getDay()];
            const now = new Date();
            const toMins = (s) => {
              const [h,m] = String(s || '00:00').split(':').map(Number);
              return h * 60 + m;
            };
            const nowMins = now.getHours() * 60 + now.getMinutes();
            const upcomingToday = (myTT || [])
              .filter(e => e.day === todayName)
              .map(e => ({ course: e.course, startTime: e.startTime, room: e.room, startMins: toMins(e.startTime) }))
              .filter(e => e.startMins >= nowMins)
              .sort((a,b) => a.startMins - b.startMins)
              .slice(0,3);
            let upcoming = upcomingToday;
            let upcomingTitle = 'Next Classes';
            if (!upcoming.length) {
              const shortDays = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
              const dayToIdx = { Sunday:0, Monday:1, Tuesday:2, Wednesday:3, Thursday:4, Friday:5, Saturday:6 };
              const nowDay = now.getDay();
              const all = (myTT || []).map(e => {
                const idx = dayToIdx[e.day] ?? 0;
                const sM = toMins(e.startTime);
                let delta = (idx - nowDay + 7) % 7;
                if (delta === 0 && sM <= nowMins) delta = 7;
                const offset = delta * 1440 + (sM - nowMins);
                return { course: e.course, startTime: e.startTime, room: e.room, dayShort: shortDays[idx], _offset: offset };
              });
              upcoming = all.filter(x => x._offset > 0).sort((a,b)=>a._offset-b._offset).slice(0,3).map(({_offset, ...rest}) => rest);
            }
            const assigned = (myDoubts || [])
              .sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt))
              .slice(0,3)
              .map(d => ({ subject: d.subject, course: d.course, status: d.status }));
            // Weekly load from timetable
            const dayOrder = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
            const short = ['Mon','Tue','Wed','Thu','Fri','Sat'];
            const counts = dayOrder.map((d, i) => ({ day: short[i], count: (myTT||[]).filter(e => e.day === d).length }));
            const todayTotal = (myTT||[]).filter(e => e.day === todayName).length;
            const remaining = todayTotal - (upcomingToday?.length || 0);
            setOverview({ kind: 'teacher', upcoming, assigned, upcomingTitle, loadBar: counts, todaySummary: { total: todayTotal, remaining: Math.max(remaining, 0) } });
          } catch(_) {
            setOverview(null);
          }
        } else if (role === 'student') {
          const [myCourses, attStats, myDoubts, myResults, myTT] = await Promise.all([
            api.get('/courses', { department: user?.department, semester: user?.semester }),
            api.get('/attendance/stats', {}),
            api.get('/doubts', {}),
            api.get('/exams/results', {}),
            api.get('/timetable')
          ]);
          const own = (myResults || []).filter(r => String(r?.student?._id || r?.student?.id || r?.student) === String(user?._id));
          const perc = own.map(r => r.percentage || Math.round((r.marks / r.totalMarks) * 100)).filter(n => Number.isFinite(n));
          const gradesAvg = perc.length ? `${Math.round(perc.reduce((a,b)=>a+b,0)/perc.length)}%` : '—';
          setCards([
            { label: 'Enrolled Courses', value: myCourses?.length ?? 0, color: 'blue' },
            { label: 'Attendance Rate', value: `${attStats?.overall?.presentPercentage ?? 0}%`, color: 'green' },
            { label: 'Avg. Grade', value: gradesAvg, color: 'purple' },
            { label: 'Doubts Resolved', value: myDoubts?.filter(d => d.status === 'resolved').length ?? 0, color: 'orange' }
          ]);
          try {
            const todayName = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][new Date().getDay()];
            const now = new Date();
            const toMins = (s) => {
              const [h,m] = String(s || '00:00').split(':').map(Number);
              return h * 60 + m;
            };
            const nowMins = now.getHours() * 60 + now.getMinutes();
            const upcoming = (myTT || [])
              .filter(e => e.day === todayName)
              .map(e => ({ course: e.course, startTime: e.startTime, room: e.room, instructor: e?.instructor?.name, startMins: toMins(e.startTime) }))
              .filter(e => e.startMins >= nowMins)
              .sort((a,b) => a.startMins - b.startMins)
              .slice(0,3);
            let upcomingTitle = 'Upcoming Classes Today';

            // Fallback: show next classes in the week if none left today
            let upcomingFinal = upcoming;
            if (!upcomingFinal.length) {
              const shortDays = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
              const dayToIdx = { Sunday:0, Monday:1, Tuesday:2, Wednesday:3, Thursday:4, Friday:5, Saturday:6 };
              const nowDay = now.getDay(); // 0-6
              const all = (myTT || []).map(e => {
                const idx = dayToIdx[e.day] ?? 0;
                const sM = toMins(e.startTime);
                let delta = (idx - nowDay + 7) % 7;
                // if same day but time already passed, push to next week
                if (delta === 0 && sM <= nowMins) delta = 7;
                const offset = delta * 1440 + (sM - nowMins);
                return {
                  course: e.course,
                  startTime: e.startTime,
                  room: e.room,
                  instructor: e?.instructor?.name,
                  dayShort: shortDays[idx],
                  _offset: offset
                };
              });
              upcomingFinal = all
                .filter(x => Number.isFinite(x._offset) && x._offset > 0)
                .sort((a,b) => a._offset - b._offset)
                .slice(0,3)
                .map(({ _offset, ...rest }) => rest);
              if (upcomingFinal.length) upcomingTitle = 'Upcoming Classes';
            }
            const recentResults = own
              .sort((a,b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt))
              .slice(0,3)
              .map(r => ({ course: r.course, percentage: r.percentage ?? Math.round((r.marks/r.totalMarks)*100), examName: r.examName }));
            // Derive top attendance by course as an alternative when no results
            const topAttendance = (attStats?.byCourse || [])
              .map(c => ({ course: c._id, rate: c.total ? Math.round((c.present / c.total) * 100) : 0, total: c.total }))
              .sort((a,b) => b.rate - a.rate || b.total - a.total)
              .slice(0,3);

            setOverview({ kind: 'student', upcoming: upcomingFinal, recentResults, topAttendance, upcomingTitle });

            // Build last 7 days attendance series for Insights
            try {
              const end = new Date();
              const start = new Date();
              start.setDate(end.getDate() - 6);
              const records = await api.get('/attendance', { startDate: start.toISOString(), endDate: end.toISOString() });
              const isSameDay = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
              const shortDays = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
              const series = [];
              for (let i = 0; i < 7; i++) {
                const d = new Date(start);
                d.setDate(start.getDate() + i);
                const label = shortDays[d.getDay()];
                const dayRecs = (records || []).filter(r => isSameDay(new Date(r.date), d));
                const total = dayRecs.length;
                const present = dayRecs.filter(r => r.status === 'present').length;
                const rate = total ? Math.round((present / total) * 100) : 0;
                series.push({ day: label, rate });
              }
              setStudentWeekly(series);
            } catch (_) {
              setStudentWeekly(null);
            }
          } catch(_) {
            setOverview(null);
          }
        } else {
          setCards([]);
        }
      } catch (e) {
        setErr('Failed to load metrics');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [role, user?._id, user?.department, user?.semester]);

  const quickActions = {
    student: [
      { label: 'View Timetable', route: '/home/timetable' },
      { label: 'My Attendance', route: '/home/attendance' },
      { label: 'Ask Doubt', route: '/home/doubts' },
      { label: 'View Results', route: '/home/exams' }
    ],
    teacher_level2: [
      { label: 'Mark Attendance', route: '/home/attendance' },
      { label: 'View Doubts', route: '/home/doubts' },
      { label: 'Manage Schedule', route: '/home/timetable' },
      { label: 'Upload Grades', route: '/home/exams' }
    ],
    teacher_level1: [
      { label: 'Assign Roles', route: '/home/courses' },
      { label: 'Add Course', route: '/home/courses' },
      { label: 'Generate Report', route: '/home/exams' },
      { label: 'Manage Timetable', route: '/home/timetable' }
    ],
    admin: [
      { label: 'Upload PDFs', route: '/home/materials' },
      { label: 'Bulk Add Students', route: '/home/admin' },
      { label: 'View Metrics', route: '/home/dashboard' },
      { label: 'Manage Courses', route: '/home/courses' }
    ]
  };

  const userStats = useMemo(() => cards, [cards]);
  const userActions = quickActions[role] || [];

  // Build small datasets for visuals; keep it simple and derived from fetched pieces
  const insights = useMemo(() => {
    try {
      if (role === 'student') {
        // Weekly attendance bars from last 7 days (fallback to placeholder if missing)
        const data = (studentWeekly && studentWeekly.length === 7)
          ? studentWeekly
          : [70, 75, 80, 82, 85, 90, 88].map((v, i) => ({ day: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][i], rate: v }));
        const avg = Math.round((data.reduce((a,b)=>a + (b.rate||0), 0) / data.length) || 0);
        const best = data.reduce((best, cur) => (cur.rate > (best?.rate ?? -1) ? cur : best), null) || { day: '-', rate: 0 };
        return { type: 'student', title: 'Weekly Attendance (Present %)', bar: data, labelKey: 'day', valueKey: 'rate', seriesName: 'Present %', kpis: { avg, bestDay: best.day, bestRate: best.rate } };
      }
      if (role === 'teacher_level2') {
        // Prefer weekly load; fallback to doubts by status
        if (overview?.loadBar?.length) {
          return { type: 'teacher', title: 'Teaching Load by Day (classes)', bar: overview.loadBar, labelKey: 'day', valueKey: 'count', seriesName: 'Classes' };
        }
        const assigned = overview?.assigned || [];
        const byStatus = ['pending','answered','resolved'].map(s => ({ status: s, count: assigned.filter(d => d.status === s).length }));
        return { type: 'teacher', title: 'Doubts by Status', bar: byStatus, labelKey: 'status', valueKey: 'count', seriesName: 'Count' };
      }
      if (role === 'teacher_level1') {
        // HOD: bar of courses by semester (real), fallback to doubts by status
        if (overview?.semBar?.length) {
          return { type: 'hod', title: 'Courses by Semester', bar: overview.semBar, labelKey: 'name', valueKey: 'count', seriesName: 'Courses' };
        }
        if (overview?.hodDoubtStatus?.length) {
          return { type: 'hod', title: 'Doubts by Status', bar: overview.hodDoubtStatus, labelKey: 'status', valueKey: 'count', seriesName: 'Count' };
        }
        return null;
      }
      if (role === 'admin') {
        const data = [
          { name: 'Students', count: Number(userStats.find(s=>s.label==='Total Students')?.value) || 0 },
          { name: 'Teachers', count: Number(userStats.find(s=>s.label==='Total Teachers')?.value) || 0 },
          { name: 'Courses', count: Number(userStats.find(s=>s.label==='Total Courses')?.value) || 0 }
        ];
        return { type: 'admin', title: 'Organization Overview', bar: data, labelKey: 'name', valueKey: 'count', seriesName: 'Count' };
      }
    } catch {}
    return null;
  }, [role, overview, userStats]);

  // Notices from backend for all roles
  const [notices, setNotices] = useState([]);
  useEffect(() => {
    const loadNotices = async () => {
      try { const d = await api.get('/notices', { limit: 20 }); setNotices(d.notices || []); } catch (e) { console.warn('Notices fetch failed', e); }
    }
    loadNotices();
  }, [role]);

  // Notice detail modal
  const [openNotice, setOpenNotice] = useState(null);
  const onOpenNotice = (n) => setOpenNotice(n);
  const onCloseNotice = () => setOpenNotice(null);

  const roleClass = role === 'student'
    ? 'dashboard-student'
    : role === 'teacher_level2'
    ? 'dashboard-teacher'
    : role === 'teacher_level1'
    ? 'dashboard-hod'
    : role === 'admin'
    ? 'dashboard-admin'
    : '';

  return (
    <div className={`dashboard-container ${roleClass}`}>
      {role === 'student' && <h2>Student Dashboard</h2>}
      {role === 'teacher_level2' && <h2>Teacher Dashboard</h2>}
      {role === 'teacher_level1' && <h2>HOD Dashboard</h2>}
      {role === 'admin' && <h2>Admin Dashboard</h2>}
      {loading ? (
        <div style={{ color: '#64748b', margin: '16px 0' }}>Loading metrics…</div>
      ) : err ? (
        <div style={{ color: '#ef4444', margin: '16px 0' }}>{err}</div>
      ) : (
        <div className="stats-grid">
          {userStats.map((s, i) => {
            const keepColor = role === 'admin' || role === 'teacher_level1';
            const cls = `stat-card ${keepColor ? s.color : ''}`.trim();
            return (
              <div key={i} className={cls}>
              <div className="stat-label">{s.label}</div>
              <div className="stat-value">{s.value}</div>
              </div>
            );
          })}
        </div>
      )}
      <div className="quick-actions">
        {userActions.map((a, i) => (
          <button key={i} onClick={() => navigate(a.route)}>{a.label}</button>
        ))}
      </div>

  {/* Role-based overview panels to utilize whitespace */}
      {overview && (
        <div className="main-content-grid" style={{ marginTop: 20 }}>
          <div className="todays-classes">
            <h3>{overview?.upcomingTitle || 'Upcoming Classes Today'}</h3>
            {!overview?.upcoming?.length ? (
              <div style={{ color: '#64748b' }}>No upcoming classes for today.</div>
            ) : (
              <ul>
                {overview.upcoming.map((c, idx) => (
                  <li key={idx}><strong>{c.startTime}</strong> — {c.course} ({c.room}) {c.instructor ? `• ${c.instructor}` : ''} {c.dayShort ? <span style={{ color:'#64748b' }}>• {c.dayShort}</span> : null}</li>
                ))}
              </ul>
            )}
          </div>
          <div className="recent-activity">
            {overview.kind === 'student' ? (
              <>
                <h3>{overview?.recentResults?.length ? 'Recent Results' : (overview?.topAttendance?.length ? 'Top Attendance by Course' : 'Recent Results')}</h3>
                {overview?.recentResults?.length ? (
                  <ul>
                    {overview.recentResults.map((r, idx) => (
                      <li key={idx}><strong>{r.percentage}%</strong> — {r.course} {r.examName ? `• ${r.examName}` : ''}</li>
                    ))}
                  </ul>
                ) : overview?.topAttendance?.length ? (
                  <ul>
                    {overview.topAttendance.map((t, idx) => (
                      <li key={idx}><strong>{t.rate}%</strong> — {t.course}</li>
                    ))}
                  </ul>
                ) : (
                  <div style={{ color: '#64748b' }}>No recent results.</div>
                )}
              </>
            ) : overview.kind === 'teacher' ? (
              <>
                <h3>Assigned Doubts</h3>
                {!overview?.assigned?.length ? (
                  <div style={{ color: '#64748b' }}>No assigned doubts.</div>
                ) : (
                  <ul>
                    {overview.assigned.map((d, idx) => (
                      <li key={idx}><strong>{d.subject}</strong> — {d.course} <span style={{ color: '#64748b' }}>({d.status})</span></li>
                    ))}
                  </ul>
                )}
              </>
            ) : (
              <>
                <h3>Recent Doubts</h3>
                {!overview?.recentDoubts?.length ? (
                  <div style={{ color: '#64748b' }}>No recent doubts.</div>
                ) : (
                  <ul>
                    {overview.recentDoubts.map((d, idx) => (
                      <li key={idx}><strong>{d.subject}</strong> — {d.course} <span style={{ color: '#64748b' }}>({d.status})</span></li>
                    ))}
                  </ul>
                )}
              </>
            )}
          </div>
        </div>
      )}

  {/* Wider section: insights chart + notifications (no duplicates) */}
  <div className="dashboard-sections">
        <div className="panel">
          <h3>{insights?.title || 'Insights'}</h3>
          {insights?.type === 'student' && insights?.kpis && (
            <div style={{ display:'flex', gap:16, margin:'6px 0 8px 0', color:'#334155' }}>
              <div style={{ background:'#f1f5f9', borderRadius:8, padding:'6px 10px' }}>Weekly Avg: <strong>{insights.kpis.avg}%</strong></div>
              <div style={{ background:'#f1f5f9', borderRadius:8, padding:'6px 10px' }}>Best Day: <strong>{insights.kpis.bestDay}</strong> (<strong>{insights.kpis.bestRate}%</strong>)</div>
            </div>
          )}
          <div className="chart-box">
            {insights?.line && (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={insights.line} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
                  <XAxis dataKey="day" /><YAxis domain={[0,100]} tickFormatter={(t)=>`${t}%`} />
                  <Tooltip formatter={(v)=>`${v}%`} />
                  <Line type="monotone" dataKey="rate" stroke="#ef4444" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            )}
    {insights?.bar && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={insights.bar} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
      <CartesianGrid stroke="#e5e7eb" vertical={false} />
      <XAxis dataKey={insights.labelKey || (insights.type==='teacher' ? 'status' : (insights.type==='student' ? 'day' : 'name'))} />
                  {insights.type==='student' ? (
                    <YAxis domain={[0,100]} tickFormatter={(t)=>`${t}%`} />
                  ) : (
                    <YAxis />
                  )}
                  {insights.type==='student' ? (
                    <Tooltip formatter={(v)=>`${v}%`} />
                  ) : (
                    <Tooltip />
                  )}
      <Legend />
      <Bar name={insights.seriesName || 'Value'} dataKey={insights.valueKey || (insights.type==='teacher' ? 'count' : (insights.type==='student' ? 'rate' : 'count'))} fill="#3b82f6" radius={[6,6,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
            {insights?.pie && (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={insights.pie} dataKey="value" nameKey="name" outerRadius={90} label>
                    {insights.pie.map((entry, index) => (
                      <Cell key={`c-${index}`} fill={["#60a5fa","#34d399","#fbbf24","#f87171","#a78bfa","#fb7185","#22d3ee","#4ade80"][index % 8]} />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
        <div className="panel">
          <h3>Notifications</h3>
          {!notices?.length ? (
            <div style={{ color:'#64748b' }}>No notifications.</div>
          ) : (
            (() => {
              const items = notices.slice(0, 8); // keep buffer for seamless scroll
              const loopList = [...items, ...items]; // duplicate for looping
              const itemHeight = 56; // match CSS
              const totalHeight = itemHeight * items.length;
              const duration = Math.max(8, items.length * 3); // seconds
              return (
                <div className="notice-marquee" style={{ '--marqueeH': `${totalHeight}px`, '--marqueeDur': `${duration}s` }}>
                  <div className="track">
                    <ul className="notifications-list">
                      {loopList.map((n, i) => (
                        <li key={i + '-' + (n._id || 'n') } onClick={()=>onOpenNotice(n)} style={{ cursor:'pointer' }} title="Click to view details">
                          <span className="notif-dot" style={{ background:'#3b82f6' }} />
                          <div>
                            <div className="notif-title">{n.title}</div>
                            <div className="notif-meta">{new Date(n.createdAt).toLocaleString()}</div>
                            {n.attachments?.length ? (
                              <div style={{ marginTop:4 }}>
                                {n.attachments.map((a, ai) => {
                                  const href = `${api.getOrigin()}${a.url}`;
                                  return (
                                    <a key={ai} href={href} target="_blank" rel="noreferrer" style={{ marginRight:8 }}>{a.filename}</a>
                                  );
                                })}
                              </div>
                            ) : null}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })()
          )}
        </div>
        {openNotice && (
          <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.35)', display:'flex', alignItems:'center', justifyContent:'center', padding:16, zIndex: 1000 }} onClick={onCloseNotice}>
            <div style={{ background:'#fff', width:'min(720px, 92vw)', maxHeight:'80vh', overflow:'auto', borderRadius:12, boxShadow:'0 8px 24px rgba(0,0,0,0.2)' }} onClick={(e)=>e.stopPropagation()}>
              <div style={{ borderBottom:'1px solid #e5e7eb', padding:'12px 16px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div>
                  <div style={{ fontWeight:700, fontSize:18 }}>{openNotice.title}</div>
                  <div style={{ color:'#6b7280', fontSize:12 }}>{new Date(openNotice.createdAt).toLocaleString()}</div>
                </div>
                <button className="btn-close" onClick={onCloseNotice} aria-label="Close">×</button>
              </div>
              <div style={{ padding:16 }}>
                {openNotice.description ? (
                  <p style={{ whiteSpace:'pre-wrap', lineHeight:1.5 }}>{openNotice.description}</p>
                ) : (
                  <div style={{ color:'#6b7280' }}>No description.</div>
                )}
                {openNotice.attachments?.length ? (
                  <div style={{ marginTop:12 }}>
                    <strong>Attachments:</strong>
                    <div style={{ marginTop:6 }}>
                      {openNotice.attachments.map((a, i) => {
                        const href = `${api.getOrigin()}${a.url}`;
                        return <div key={i}><a href={href} target="_blank" rel="noreferrer">{a.filename}</a></div>;
                      })}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DashboardMain;
