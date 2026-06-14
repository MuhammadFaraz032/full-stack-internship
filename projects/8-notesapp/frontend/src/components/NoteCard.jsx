export default function NoteCard({ note, onEdit, onDelete, onPin, onClick }) {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    });
  };

  return (
    <div className="note-card" style={{ borderTop: `4px solid ${note.color}` }} onClick={onClick}>
      <div className="note-card-header">
        <h3 className="note-title">{note.title}</h3>
        <button
          className={`btn-pin ${note.pinned ? 'pinned' : ''}`}
          onClick={(e) => { e.stopPropagation(); onPin(note._id); }}
          title={note.pinned ? 'Unpin' : 'Pin'}
        >
          📌
        </button>
      </div>

      <p className="note-content">{note.content}</p>

      {note.tags?.length > 0 && (
        <div className="note-tags">
          {note.tags.map((tag, i) => (
            <span key={i} className="tag">#{tag}</span>
          ))}
        </div>
      )}

      <div className="note-footer">
        <span className="note-date">{formatDate(note.updatedAt)}</span>
      </div>
    </div>
  );
}