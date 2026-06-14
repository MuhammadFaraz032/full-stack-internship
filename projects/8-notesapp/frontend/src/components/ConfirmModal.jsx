import { Trash2, X } from 'lucide-react';

export default function ConfirmModal({ onConfirm, onCancel }) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal confirm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Delete Note</h2>
          <button className="modal-close" onClick={onCancel}><X size={16} /></button>
        </div>

        <div className="modal-body">
          <div className="confirm-icon">
            <Trash2 size={40} color="#fca5a5" />
          </div>
          <p className="confirm-text">Are you sure you want to delete this note?</p>
          <p className="confirm-subtext">This action cannot be undone.</p>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onCancel}>Cancel</button>
          <button className="btn-delete-modal" onClick={onConfirm}>
            <Trash2 size={15} /> Delete
          </button>
        </div>
      </div>
    </div>
  );
}