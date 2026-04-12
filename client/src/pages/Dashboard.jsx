import { useEffect, useState } from 'react';
import { Users, ClipboardList, CheckCircle, Clock, AlertTriangle, TrendingUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import api from '../utils/api';

const COLORS = ['#4f7cff','#22c55e','#f59e0b','#a855f7','#ef4444','#06b6d4'];

function StatCard({ icon, label, value, color, sub }) {
  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ background: color + '22' }}>
        <span style={{ color }}>{icon}</span>
      </div>
      <div className="stat-body">
        <div className="stat-label">{label}</div>
        <div className="stat-value">{value ?? '—'}</div>
        {sub && <div className="stat-change">{sub}</div>}
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = { Pending: 'badge-yellow', 'In Progress': 'badge-blue', Completed: 'badge-green' };
  return <span className={`badge ${map[status] || 'badge-gray'}`}>{status}</span>;
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/stats')
      .then(res => setData(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="loading-center">
      <div style={{ width: 28, height: 28, border: '3px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%' }} className="spin" />
      <span>Loading dashboard...</span>
    </div>
  );

  const s = data?.stats || {};

  return (
    <div style={{ animation: 'slideUp 0.3s ease' }}>
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p>Overview of your school management system</p>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <StatCard icon={<Users size={20} />} label="Total Students" value={s.totalStudents} color="#4f7cff" sub={`${s.activeStudents} active`} />
        <StatCard icon={<ClipboardList size={20} />} label="Total Tasks" value={s.totalTasks} color="#a855f7" sub={`${s.pendingTasks} pending`} />
        <StatCard icon={<CheckCircle size={20} />} label="Completed" value={s.completedTasks} color="#22c55e" sub={`${s.completionRate}% rate`} />
        <StatCard icon={<Clock size={20} />} label="In Progress" value={s.inProgressTasks} color="#f59e0b" sub="ongoing tasks" />
        <StatCard icon={<AlertTriangle size={20} />} label="Overdue" value={s.overdueTasks} color="#ef4444" sub="need attention" />
        <StatCard icon={<TrendingUp size={20} />} label="Completion Rate" value={`${s.completionRate}%`} color="#06b6d4" sub="overall" />
      </div>

      {/* Progress */}
      {s.totalTasks > 0 && (
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="card-header">
            <div>
              <div className="card-title">Task Completion Progress</div>
              <div className="card-subtitle">{s.completedTasks} of {s.totalTasks} tasks completed</div>
            </div>
            <span className="badge badge-blue">{s.completionRate}%</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${s.completionRate}%` }} />
          </div>
          <div style={{ display: 'flex', gap: 20, marginTop: 12 }}>
            {[
              { label: 'Completed', val: s.completedTasks, color: 'var(--success)' },
              { label: 'In Progress', val: s.inProgressTasks, color: 'var(--warning)' },
              { label: 'Pending', val: s.pendingTasks, color: 'var(--text-dim)' },
              { label: 'Overdue', val: s.overdueTasks, color: 'var(--danger)' },
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: item.color, display: 'inline-block' }} />
                {item.label}: <strong style={{ color: 'var(--text)' }}>{item.val}</strong>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Two-column grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Recent Students */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Recent Students</div>
              <div className="card-subtitle">Latest additions</div>
            </div>
            <a href="/students" style={{ fontSize: 12, color: 'var(--accent)', textDecoration: 'none' }}>View all →</a>
          </div>
          {data?.recentStudents?.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px 0', fontSize: 13 }}>No students yet</div>
          ) : (
            data?.recentStudents?.map(student => (
              <div className="recent-item" key={student._id}>
                <div className="avatar" style={{ background: 'var(--accent-dim)', color: 'var(--accent)' }}>
                  {student.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
                </div>
                <div className="recent-item-info">
                  <div className="recent-item-name">{student.name}</div>
                  <div className="recent-item-sub">Class {student.class} · {student.rollNumber}</div>
                </div>
                <div className="recent-item-time">{formatDistanceToNow(new Date(student.createdAt), { addSuffix: true })}</div>
              </div>
            ))
          )}
        </div>

        {/* Recent Tasks */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Recent Tasks</div>
              <div className="card-subtitle">Latest assignments</div>
            </div>
            <a href="/tasks" style={{ fontSize: 12, color: 'var(--accent)', textDecoration: 'none' }}>View all →</a>
          </div>
          {data?.recentTasks?.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px 0', fontSize: 13 }}>No tasks yet</div>
          ) : (
            data?.recentTasks?.map(task => (
              <div className="recent-item" key={task._id}>
                <div className="avatar" style={{ background: 'var(--purple-dim)', color: 'var(--purple)' }}>
                  {task.subject?.slice(0, 2).toUpperCase()}
                </div>
                <div className="recent-item-info">
                  <div className="recent-item-name">{task.title}</div>
                  <div className="recent-item-sub">{task.assignedTo?.name} · {task.subject}</div>
                </div>
                <StatusBadge status={task.status} />
              </div>
            ))
          )}
        </div>

        {/* Class Distribution */}
        {data?.classDistribution?.length > 0 && (
          <div className="card">
            <div className="card-header">
              <div className="card-title">Students by Class</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {data.classDistribution.map((item, i) => {
                const pct = Math.round((item.count / s.totalStudents) * 100);
                return (
                  <div key={item._id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                      <span style={{ color: 'var(--text-muted)' }}>Class {item._id}</span>
                      <span style={{ color: 'var(--text)', fontWeight: 600 }}>{item.count} <span style={{ color: 'var(--text-dim)', fontWeight: 400 }}>({pct}%)</span></span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${pct}%`, background: COLORS[i % COLORS.length] }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Task Priority */}
        {data?.tasksByPriority?.length > 0 && (
          <div className="card">
            <div className="card-header">
              <div className="card-title">Tasks by Priority</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {['High', 'Medium', 'Low'].map(priority => {
                const found = data.tasksByPriority.find(t => t._id === priority);
                const count = found?.count || 0;
                const pct = s.totalTasks > 0 ? Math.round((count / s.totalTasks) * 100) : 0;
                const colorMap = { High: 'var(--danger)', Medium: 'var(--warning)', Low: 'var(--success)' };
                return (
                  <div key={priority}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                      <span style={{ color: colorMap[priority], fontWeight: 600 }}>{priority}</span>
                      <span style={{ color: 'var(--text)' }}>{count} tasks</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${pct}%`, background: colorMap[priority] }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
