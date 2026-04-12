import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, LogIn, GraduationCap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: 'admin@school.com', password: 'Admin@123' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back!');
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-bg-glow" />
      <div className="login-bg-glow-2" />

      <div className="login-card">
        <div className="login-logo">
          <div className="logo-icon">🎓</div>
          <div>
            <div className="logo-text">EduAdmin</div>
            <div className="logo-sub">SCHOOL MANAGEMENT</div>
          </div>
        </div>

        <div className="login-title">Welcome back</div>
        <div className="login-subtitle">Sign in to access the admin dashboard</div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-input"
              placeholder="admin@school.com"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPass ? 'text' : 'password'}
                className="form-input"
                placeholder="Enter your password"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                required
                style={{ paddingRight: 44 }}
              />
              <button
                type="button"
                onClick={() => setShowPass(s => !s)}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', display: 'flex' }}
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <div style={{ background: 'var(--danger-dim)', border: '1px solid var(--danger)', borderRadius: 'var(--radius)', padding: '10px 14px', fontSize: 13, color: 'var(--danger)', marginBottom: 16 }}>
              {error}
            </div>
          )}

          <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
            {loading ? (
              <>
                <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%' }} className="spin" />
                Signing in...
              </>
            ) : (
              <><LogIn size={16} /> Sign In</>
            )}
          </button>
        </form>

        <hr className="login-divider" />
        <div className="login-hint">
          Default credentials: <strong style={{ color: 'var(--text-muted)' }}>admin@school.com</strong><br />
          Password: <strong style={{ color: 'var(--text-muted)' }}>Admin@123</strong>
        </div>
      </div>
    </div>
  );
}