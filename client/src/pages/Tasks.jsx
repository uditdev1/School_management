import { useEffect, useState, useCallback } from 'react';
import { Plus, Search, Edit2, Trash2, CheckCircle, ClipboardList, Clock } from 'lucide-react';
import { format, isPast } from 'date-fns';
import toast from 'react-hot-toast';
import api from '../utils/api';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';

const PRIORITIES = ['Low', 'Medium', 'High'];
const STATUSES = ['Pending', 'In Progress', 'Completed'];
const SUBJECTS = ['Mathematics','Science','English','Hindi','Social Studies','Computer Science','Physics','Chemistry','Biology','History','Geography','Economics','Other'];

const initForm = { title: '', description: '', subject: '', assignedTo: '', dueDate: '', priority: 'Medium', status: 'Pending' };

function PriorityBadge({ p }) {
  const map = { High: 'badge-red', Medium: 'badge-yellow', Low: 'badge-green' };
  return <span className={`badge ${map[p] || 'badge-gray'}`}>{p}</span>;
}

function StatusBadge({ s }) {
  const map = { Pending: 'badge-gray', 'In Progress': 'badge-blue', Completed: 'badge-green' };
  return <span className={`badge ${map[s] || 'badge-gray'}`}>{s}</span>;
}

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterStudent, setFilterStudent] = useState('');
  const [page, setPage] = useState(1);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(initForm);
  const [saving, setSaving] = useState(false);

  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState(null);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 10 });
      if (search) params.set('search', search);
      if (filterStatus) params.set('status', filterStatus);
      if (filterPriority) params.set('priority', filterPriority);
      if (filterStudent) params.set('student', filterStudent);
      const res = await api.get(`/tasks?${params}`);
      setTasks(res.data.data);
      setPagination(res.data.pagination);
    } catch {
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [page, search, filterStatus, filterPriority, filterStudent]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);
  useEffect(() => { setPage(1); }, [search, filterStatus, filterPriority, filterStudent]);

  useEffect(() => {
    api.get('/students?limit=100').then(res => setStudents(res.data.data)).catch(() => {});
  }, []);

  const openAdd = () => { setEditing(null); setForm(initForm); setModalOpen(true); };
  const openEdit = (t) => {
    setEditing(t);
    setForm({
      title: t.title, description: t.description || '',
      subject: t.subject, assignedTo: t.assignedTo?._id || '',
      dueDate: t.dueDate ? t.dueDate.split('T')[0] : '',
      priority: t.priority, status: t.status,
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/tasks/${editing._id}`, form);
        toast.success('Task updated');
      } else {
        await api.post('/tasks', form);
        toast.success('Task assigned');
      }
      setModalOpen(false);
      fetchTasks();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/tasks/${deleteId}`);
      toast.success('Task deleted');
      setDeleteId(null);
      fetchTasks();
    } catch {
      toast.error('Failed to delete');
    } finally {
      setDeleting(false);
    }
  };

  const toggleComplete = async (task) => {
    const newStatus = task.status === 'Completed' ? 'Pending' : 'Completed';
    setTogglingId(task._id);
    try {
      await api.patch(`/tasks/${task._id}/status`, { status: newStatus });
      toast.success(`Marked as ${newStatus}`);
      fetchTasks();
    } catch {
      toast.error('Failed to update status');
    } finally {
      setTogglingId(null);
    }
  };

  const f = (k) => (e) => setForm(prev => ({ ...prev, [k]: e.target.value }));

  const isOverdue = (task) => task.status !== 'Completed' && isPast(new Date(task.dueDate));

  return (
    <div style={{ animation: 'slideUp 0.3s ease' }}>
      <div className="page-header">
        <div>
          <h1>Tasks & Assignments</h1>
          <p>{pagination.total} total tasks assigned</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd} disabled={students.length === 0}>
          <Plus size={16} /> Assign Task
        </button>
      </div>

      {students.length === 0 && !loading && (
        <div style={{ background: 'var(--warning-dim)', border: '1px solid var(--warning)', borderRadius: 'var(--radius)', padding: '12px 16px', fontSize: 13, color: 'var(--warning)', marginBottom: 16, display: 'flex', gap: 8, alignItems: 'center' }}>
          <Clock size={15} /> Add students first before assigning tasks.
        </div>
      )}

      {/* Toolbar */}
      <div className="toolbar">
        <div className="search-wrap">
          <Search size={15} className="search-icon" />
          <input className="search-input" placeholder="Search by title or subject..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="form-select" style={{ width: 140 }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">All Status</option>
          {STATUSES.map(s => <option key={s}>{s}</option>)}
        </select>
        <select className="form-select" style={{ width: 130 }} value={filterPriority} onChange={e => setFilterPriority(e.target.value)}>
          <option value="">All Priority</option>
          {PRIORITIES.map(p => <option key={p}>{p}</option>)}
        </select>
        <select className="form-select" style={{ width: 160 }} value={filterStudent} onChange={e => setFilterStudent(e.target.value)}>
          <option value="">All Students</option>
          {students.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="loading-center"><div style={{ width: 24, height: 24, border: '3px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%' }} className="spin" /></div>
      ) : tasks.length === 0 ? (
        <div className="empty-state">
          <ClipboardList size={48} />
          <h3>No tasks found</h3>
          <p>Assign your first task or adjust the filters</p>
          {students.length > 0 && <button className="btn btn-primary" onClick={openAdd}><Plus size={15} /> Assign Task</button>}
        </div>
      ) : (
        <>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th style={{ width: 40 }}></th>
                  <th>Task</th>
                  <th>Student</th>
                  <th>Subject</th>
                  <th>Due Date</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map(task => (
                  <tr key={task._id} style={task.status === 'Completed' ? { opacity: 0.6 } : {}}>
                    <td>
                      <button
                        className="btn btn-ghost btn-sm"
                        style={{ padding: 4, color: task.status === 'Completed' ? 'var(--success)' : 'var(--text-dim)' }}
                        onClick={() => toggleComplete(task)}
                        disabled={togglingId === task._id}
                        title={task.status === 'Completed' ? 'Mark as Pending' : 'Mark as Completed'}
                      >
                        <CheckCircle size={18} />
                      </button>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, textDecoration: task.status === 'Completed' ? 'line-through' : 'none' }}>{task.title}</div>
                      {task.description && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2, maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{task.description}</div>}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div className="avatar" style={{ background: 'var(--accent-dim)', color: 'var(--accent)', fontSize: 11, width: 28, height: 28 }}>
                          {task.assignedTo?.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
                        </div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 500 }}>{task.assignedTo?.name || '—'}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Class {task.assignedTo?.class}</div>
                        </div>
                      </div>
                    </td>
                    <td className="td-muted">{task.subject}</td>
                    <td>
                      <span className={isOverdue(task) ? 'overdue' : 'td-muted'}>
                        {format(new Date(task.dueDate), 'dd MMM yyyy')}
                        {isOverdue(task) && <span style={{ fontSize: 11, marginLeft: 4 }}>⚠ Overdue</span>}
                      </span>
                    </td>
                    <td><PriorityBadge p={task.priority} /></td>
                    <td><StatusBadge s={task.status} /></td>
                    <td>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => openEdit(task)} title="Edit"><Edit2 size={14} /></button>
                        <button className="btn btn-ghost btn-sm" onClick={() => setDeleteId(task._id)} title="Delete" style={{ color: 'var(--danger)' }}><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pagination.pages > 1 && (
            <div className="pagination">
              <button className="page-btn" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>‹</button>
              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(p => (
                <button key={p} className={`page-btn ${p === page ? 'active' : ''}`} onClick={() => setPage(p)}>{p}</button>
              ))}
              <button className="page-btn" disabled={page >= pagination.pages} onClick={() => setPage(p => p + 1)}>›</button>
            </div>
          )}
        </>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Task' : 'Assign New Task'}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? <><span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%' }} className="spin" /> Saving...</> : (editing ? 'Update Task' : 'Assign Task')}
            </button>
          </>
        }
      >
        <form onSubmit={handleSave}>
          <div className="form-group">
            <label className="form-label">Task Title <span className="required">*</span></label>
            <input className="form-input" placeholder="e.g. Chapter 5 Exercise" value={form.title} onChange={f('title')} required />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Subject <span className="required">*</span></label>
              <select className="form-select" value={form.subject} onChange={f('subject')} required>
                <option value="">Select subject</option>
                {SUBJECTS.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Assign To <span className="required">*</span></label>
              <select className="form-select" value={form.assignedTo} onChange={f('assignedTo')} required>
                <option value="">Select student</option>
                {students.map(s => (
                  <option key={s._id} value={s._id}>{s.name} — Class {s.class} ({s.rollNumber})</option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Due Date <span className="required">*</span></label>
              <input type="date" className="form-input" value={form.dueDate} onChange={f('dueDate')} required min={new Date().toISOString().split('T')[0]} />
            </div>
            <div className="form-group">
              <label className="form-label">Priority</label>
              <select className="form-select" value={form.priority} onChange={f('priority')}>
                {PRIORITIES.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
          </div>
          {editing && (
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-select" value={form.status} onChange={f('status')}>
                {STATUSES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          )}
          <div className="form-group">
            <label className="form-label">Description / Instructions</label>
            <textarea className="form-textarea" placeholder="Detailed instructions for the task..." value={form.description} onChange={f('description')} />
          </div>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Task?"
        message="This task will be permanently deleted. This action cannot be undone."
        confirmText="Yes, Delete"
      />
    </div>
  );
}