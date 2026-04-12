import { useEffect, useState, useCallback } from 'react';
import { UserPlus, Search, Edit2, Trash2, Users } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import api from '../utils/api';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';

const CLASSES = ['1','2','3','4','5','6','7','8','9','10','11','12'];
const GENDERS = ['Male','Female','Other'];
const SECTIONS = ['A','B','C','D','E'];

const initForm = {
  name: '', rollNumber: '', class: '', section: 'A',
  email: '', phone: '', parentName: '', address: '',
  gender: 'Male', status: 'Active', dateOfBirth: '',
};

function StatusBadge({ status }) {
  return <span className={`badge ${status === 'Active' ? 'badge-green' : 'badge-gray'}`}>{status}</span>;
}

export default function Students() {
  const [students, setStudents] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [page, setPage] = useState(1);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(initForm);
  const [saving, setSaving] = useState(false);

  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 10 });
      if (search) params.set('search', search);
      if (filterClass) params.set('class', filterClass);
      if (filterStatus) params.set('status', filterStatus);
      const res = await api.get(`/students?${params}`);
      setStudents(res.data.data);
      setPagination(res.data.pagination);
    } catch (e) {
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  }, [page, search, filterClass, filterStatus]);

  useEffect(() => { fetchStudents(); }, [fetchStudents]);

  // debounce search
  useEffect(() => { setPage(1); }, [search, filterClass, filterStatus]);

  const openAdd = () => { setEditing(null); setForm(initForm); setModalOpen(true); };
  const openEdit = (s) => {
    setEditing(s);
    setForm({
      name: s.name, rollNumber: s.rollNumber, class: s.class,
      section: s.section || 'A', email: s.email || '', phone: s.phone || '',
      parentName: s.parentName || '', address: s.address || '',
      gender: s.gender || 'Male', status: s.status || 'Active',
      dateOfBirth: s.dateOfBirth ? s.dateOfBirth.split('T')[0] : '',
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/students/${editing._id}`, form);
        toast.success('Student updated');
      } else {
        await api.post('/students', form);
        toast.success('Student added');
      }
      setModalOpen(false);
      fetchStudents();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/students/${deleteId}`);
      toast.success('Student deleted');
      setDeleteId(null);
      fetchStudents();
    } catch {
      toast.error('Failed to delete student');
    } finally {
      setDeleting(false);
    }
  };

  const f = (k) => (e) => setForm(prev => ({ ...prev, [k]: e.target.value }));

  return (
    <div style={{ animation: 'slideUp 0.3s ease' }}>
      <div className="page-header">
        <div>
          <h1>Students</h1>
          <p>{pagination.total} students enrolled</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>
          <UserPlus size={16} /> Add Student
        </button>
      </div>

      {/* Toolbar */}
      <div className="toolbar">
        <div className="search-wrap">
          <Search size={15} className="search-icon" />
          <input className="search-input" placeholder="Search by name, roll no, class..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="form-select" style={{ width: 140 }} value={filterClass} onChange={e => setFilterClass(e.target.value)}>
          <option value="">All Classes</option>
          {CLASSES.map(c => <option key={c}>Class {c}</option>)}
        </select>
        <select className="form-select" style={{ width: 130 }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">All Status</option>
          <option>Active</option>
          <option>Inactive</option>
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="loading-center"><div style={{ width: 24, height: 24, border: '3px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%' }} className="spin" /></div>
      ) : students.length === 0 ? (
        <div className="empty-state">
          <Users size={48} />
          <h3>No students found</h3>
          <p>Add your first student or try adjusting the filters</p>
          <button className="btn btn-primary" onClick={openAdd}><UserPlus size={15} /> Add Student</button>
        </div>
      ) : (
        <>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Roll No.</th>
                  <th>Class</th>
                  <th>Gender</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map(s => (
                  <tr key={s._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div className="avatar" style={{ background: 'var(--accent-dim)', color: 'var(--accent)', fontSize: 12 }}>
                          {s.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600 }}>{s.name}</div>
                          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.email || '—'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="td-muted">{s.rollNumber}</td>
                    <td><span className="badge badge-blue">Class {s.class}{s.section ? `-${s.section}` : ''}</span></td>
                    <td className="td-muted">{s.gender}</td>
                    <td className="td-muted">{s.phone || '—'}</td>
                    <td><StatusBadge status={s.status} /></td>
                    <td className="td-muted">{format(new Date(s.createdAt), 'dd MMM yyyy')}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => openEdit(s)} title="Edit"><Edit2 size={14} /></button>
                        <button className="btn btn-ghost btn-sm" onClick={() => setDeleteId(s._id)} title="Delete" style={{ color: 'var(--danger)' }}><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
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
        title={editing ? 'Edit Student' : 'Add New Student'}
        size="modal-lg"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? <><span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%' }} className="spin" /> Saving...</> : (editing ? 'Update Student' : 'Add Student')}
            </button>
          </>
        }
      >
        <form onSubmit={handleSave}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Full Name <span className="required">*</span></label>
              <input className="form-input" placeholder="e.g. Rahul Sharma" value={form.name} onChange={f('name')} required />
            </div>
            <div className="form-group">
              <label className="form-label">Roll Number <span className="required">*</span></label>
              <input className="form-input" placeholder="e.g. 2024001" value={form.rollNumber} onChange={f('rollNumber')} required />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Class <span className="required">*</span></label>
              <select className="form-select" value={form.class} onChange={f('class')} required>
                <option value="">Select class</option>
                {CLASSES.map(c => <option key={c} value={c}>Class {c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Section</label>
              <select className="form-select" value={form.section} onChange={f('section')}>
                {SECTIONS.map(s => <option key={s}>Section {s}</option>)}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Gender</label>
              <select className="form-select" value={form.gender} onChange={f('gender')}>
                {GENDERS.map(g => <option key={g}>{g}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Date of Birth</label>
              <input type="date" className="form-input" value={form.dateOfBirth} onChange={f('dateOfBirth')} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Email</label>
              <input type="email" className="form-input" placeholder="student@email.com" value={form.email} onChange={f('email')} />
            </div>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input className="form-input" placeholder="+91 98765 43210" value={form.phone} onChange={f('phone')} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Parent / Guardian Name</label>
              <input className="form-input" placeholder="Parent name" value={form.parentName} onChange={f('parentName')} />
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-select" value={form.status} onChange={f('status')}>
                <option>Active</option>
                <option>Inactive</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Address</label>
            <textarea className="form-textarea" placeholder="Full address..." value={form.address} onChange={f('address')} style={{ minHeight: 70 }} />
          </div>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Student?"
        message="This will permanently delete the student and all their assigned tasks. This action cannot be undone."
        confirmText="Yes, Delete"
      />
    </div>
  );
}