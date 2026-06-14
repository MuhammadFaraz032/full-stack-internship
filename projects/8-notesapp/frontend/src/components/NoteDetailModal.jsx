export default function NoteDetailModal({ note, onEdit, onDelete, onClose }) {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'long', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header" style={{ borderTop: `4px solid ${note.color}`, borderRadius: '16px 16px 0 0' }}>
          <h2>{note.title}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <p className="detail-content">{note.content || 'No content.'}</p>

          {note.tags?.length > 0 && (
            <div className="note-tags" style={{ marginTop: '1rem' }}>
              {note.tags.map((tag, i) => (
                <span key={i} className="tag">#{tag}</span>
              ))}
            </div>
          )}

          <p className="detail-date">Last updated: {formatDate(note.updatedAt)}</p>
        </div>

        <div className="modal-footer">
          <button className="btn-delete-modal" onClick={() => { onDelete(note._id); onClose(); }}>
            🗑️ Delete
          </button>
          <button className="btn-edit-modal" onClick={() => { onEdit(note); onClose(); }}>
            ✏️ Edit
          </button>
        </div>
      </div>
    </div>
  );
}