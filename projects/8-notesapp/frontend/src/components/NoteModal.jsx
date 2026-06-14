import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const COLORS = ['#ffffff', '#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff', '#c77dff', '#ff9a3c', '#00c9b1'];

export default function NoteModal({ note, onSave, onClose }) {
  const [form, setForm] = useState({
    title: '',
    content: '',
    color: '#ffffff',
    tags: ''
  });

  useEffect(() => {
    if (note) {
      setForm({
        title: note.title,
        content: note.content,
        color: note.color,
        tags: note.tags?.join(', ') || ''
      });
    }
  }, [note]);

  const handleSubmit = () => {
    if (!form.title.trim()) return alert('Title is required');
    const tags = form.tags
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);
    onSave({ ...form, tags });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{note ? 'Edit Note' : 'New Note'}</h2>
          <button className="modal-close" onClick={onClose}><X size={16} /></button>
        </div>

        <div className="modal-body">
          <div className="form-group">
            <label>Title</label>
            <input
              type="text"
              placeholder="Note title..."
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Content</label>
            <textarea
              placeholder="Write your note here..."
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              rows={6}
            />
          </div>

          <div className="form-group">
            <label>Tags (comma separated)</label>
            <input
              type="text"
              placeholder="work, ideas, personal..."
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Note Color</label>
            <div className="color-picker">
              {COLORS.map(color => (
                <button
                  key={color}
                  className={`color-dot ${form.color === color ? 'active' : ''}`}
                  style={{ background: color }}
                  onClick={() => setForm({ ...form, color })}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={handleSubmit}>
            {note ? 'Save Changes' : 'Create Note'}
          </button>
        </div>
      </div>
    </div>
  );
}