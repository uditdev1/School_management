// ConfirmDialog - delete confirmation modal component
import { AlertTriangle } from 'lucide-react';
import Modal from './Modal';

export default function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, confirmText = 'Delete', loading = false }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" size="confirm-modal"
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose} disabled={loading}>Cancel</button>
          <button className="btn btn-danger" onClick={onConfirm} disabled={loading}>
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%' }} className="spin" />
                Deleting...
              </span>
            ) : confirmText}
          </button>
        </>
      }
    >
      <div className="confirm-icon" style={{ background: 'var(--danger-dim)' }}>
        <AlertTriangle size={24} color="var(--danger)" />
      </div>
      <div className="confirm-title">{title}</div>
      <div className="confirm-text">{message}</div>
    </Modal>
  );
}