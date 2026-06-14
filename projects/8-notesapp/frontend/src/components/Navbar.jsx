import { Search, Palette, Plus, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ search, setSearch, onNewNote, onBgPicker }) {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <span className="brand-name">NoteVault</span>
      </div>

      <div className="navbar-search">
        <Search size={15} color="var(--text-secondary)" />
        <input
          type="text"
          placeholder="Search notes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="navbar-actions">
        <button className="btn-icon" onClick={onBgPicker} title="Change Background">
          <Palette size={18} />
        </button>
        <button className="btn-add" onClick={onNewNote} title="New Note">
          <Plus size={22} />
        </button>
        <div className="user-info">
          <span className="user-avatar">{user?.name?.charAt(0).toUpperCase()}</span>
          <span className="user-name">{user?.name}</span>
        </div>
        <button className="btn-logout" onClick={logout}>
          <LogOut size={14} /> Logout
        </button>
      </div>
    </nav>
  );
}