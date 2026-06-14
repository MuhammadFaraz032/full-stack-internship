import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "../api/axios";
import Navbar from "../components/Navbar";
import NoteCard from "../components/NoteCard";
import NoteModal from "../components/NoteModal";
import NoteDetailModal from "../components/NoteDetailModal";
import BackgroundPicker from "../components/BackgroundPicker";
import ConfirmModal from "../components/ConfirmModal";

export default function Dashboard() {
  const { user } = useAuth();
  const [notes, setNotes] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editNote, setEditNote] = useState(null);
  const [detailNote, setDetailNote] = useState(null);
  const [bgPickerOpen, setBgPickerOpen] = useState(false);
  const [background, setBackground] = useState(user?.background || "default");
  const [confirmId, setConfirmId] = useState(null);

  useEffect(() => {
    fetchNotes();
  }, []);

  useEffect(() => {
    applyBackground(background);
  }, [background]);

  const fetchNotes = async () => {
    try {
      const { data } = await axios.get("/notes");
      setNotes(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const applyBackground = (bg) => {
    const body = document.body;
    if (bg === "default" || !bg) {
      body.style.backgroundImage = "";
      body.style.background = "";
      body.setAttribute("data-bg", "default");
    } else if (bg.startsWith("gradient:")) {
      body.style.backgroundImage = bg.replace("gradient:", "");
      body.style.backgroundSize = "cover";
      body.setAttribute("data-bg", "gradient");
    } else {
      body.style.backgroundImage = `url(${bg})`;
      body.style.backgroundSize = "cover";
      body.style.backgroundPosition = "center";
      body.style.backgroundAttachment = "fixed";
      body.setAttribute("data-bg", "image");
    }
  };

  const handleBackgroundChange = (bg) => {
    setBackground(bg);
  };

  const handleSaveNote = async (noteData) => {
    try {
      if (editNote) {
        const { data } = await axios.put(`/notes/${editNote._id}`, noteData);
        setNotes(notes.map((n) => (n._id === editNote._id ? data : n)));
      } else {
        const { data } = await axios.post("/notes", noteData);
        setNotes([data, ...notes]);
      }
      setModalOpen(false);
      setEditNote(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    setConfirmId(id);
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`/notes/${confirmId}`);
      setNotes(notes.filter((n) => n._id !== confirmId));
      setDetailNote(null);
    } catch (err) {
      console.error(err);
    } finally {
      setConfirmId(null);
    }
  };

  const handlePin = async (id) => {
    try {
      const { data } = await axios.patch(`/notes/${id}/pin`);
      setNotes(notes.map((n) => (n._id === id ? data : n)));
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (note) => {
    setEditNote(note);
    setModalOpen(true);
  };

  const filteredNotes = notes.filter(
    (n) =>
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.content.toLowerCase().includes(search.toLowerCase())
  );

  const pinnedNotes = filteredNotes.filter((n) => n.pinned);
  const unpinnedNotes = filteredNotes.filter((n) => !n.pinned);

  return (
    <div className="dashboard">
      <Navbar
        search={search}
        setSearch={setSearch}
        onNewNote={() => {
          setEditNote(null);
          setModalOpen(true);
        }}
        onBgPicker={() => setBgPickerOpen(true)}
      />

      <div className="dashboard-content">
        {loading ? (
          <div className="loading-notes">Loading your notes...</div>
        ) : notes.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📝</div>
            <h2>No notes yet</h2>
            <p>Click the + button to create your first note</p>
          </div>
        ) : (
          <>
            {pinnedNotes.length > 0 && (
              <div className="notes-section">
                <h3 className="section-label">📌 Pinned</h3>
                <div className="notes-grid">
                  {pinnedNotes.map((note) => (
                    <NoteCard
                      key={note._id}
                      note={note}
                      onPin={handlePin}
                      onClick={() => setDetailNote(note)}
                    />
                  ))}
                </div>
              </div>
            )}

            {unpinnedNotes.length > 0 && (
              <div className="notes-section">
                {pinnedNotes.length > 0 && (
                  <h3 className="section-label">🗒️ Others</h3>
                )}
                <div className="notes-grid">
                  {unpinnedNotes.map((note) => (
                    <NoteCard
                      key={note._id}
                      note={note}
                      onPin={handlePin}
                      onClick={() => setDetailNote(note)}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
        {confirmId && (
          <ConfirmModal
            onConfirm={confirmDelete}
            onCancel={() => setConfirmId(null)}
          />
        )}
      </div>

      {modalOpen && (
        <NoteModal
          note={editNote}
          onSave={handleSaveNote}
          onClose={() => {
            setModalOpen(false);
            setEditNote(null);
          }}
        />
      )}

      {detailNote && (
        <NoteDetailModal
          note={detailNote}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onClose={() => setDetailNote(null)}
        />
      )}

      {bgPickerOpen && (
        <BackgroundPicker
          currentBg={background}
          onSelect={handleBackgroundChange}
          onClose={() => setBgPickerOpen(false)}
        />
      )}
    </div>
  );
}
