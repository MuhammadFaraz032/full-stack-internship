import { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from '../api/axios';

const PRESET_BACKGROUNDS = [
  { id: 'default', label: 'Default', preview: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)' },
  { id: 'gradient:linear-gradient(135deg, #667eea 0%, #764ba2 100%)', label: 'Purple Dream', preview: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  { id: 'gradient:linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', label: 'Pink Sunset', preview: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
  { id: 'gradient:linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', label: 'Ocean Blue', preview: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
  { id: 'gradient:linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', label: 'Mint Fresh', preview: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' },
  { id: 'gradient:linear-gradient(135deg, #fa709a 0%, #fee140 100%)', label: 'Warm Sunset', preview: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' },
  { id: 'gradient:linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)', label: 'Soft Lavender', preview: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)' },
  { id: 'gradient:linear-gradient(135deg, #0f2027, #203a43, #2c5364)', label: 'Dark Ocean', preview: 'linear-gradient(135deg, #0f2027, #203a43, #2c5364)' },
];

export default function BackgroundPicker({ currentBg, onSelect, onClose }) {
  const { user, updateUser } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [customBgs, setCustomBgs] = useState(user?.customBackgrounds || []);
  const fileRef = useRef();

  const handleSelect = async (bgId) => {
    onSelect(bgId);
    try {
      await axios.put('/user/background', { background: bgId });
      updateUser({ background: bgId });
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return alert('Image must be under 5MB');

    setUploading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result;
      try {
        const { data } = await axios.post('/user/background/custom', { imageBase64: base64 });
        setCustomBgs(data.customBackgrounds);
        updateUser({ customBackgrounds: data.customBackgrounds, background: base64 });
        onSelect(base64);
      } catch (err) {
        alert(err.response?.data?.message || 'Upload failed');
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteCustom = async (index) => {
    try {
      const { data } = await axios.delete(`/user/background/custom/${index}`);
      setCustomBgs(data.customBackgrounds);
      updateUser({ customBackgrounds: data.customBackgrounds });
      if (currentBg === customBgs[index]) onSelect('default');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal bg-picker-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>🎨 Choose Background</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <label className="section-label">Presets</label>
          <div className="bg-grid">
            {PRESET_BACKGROUNDS.map(bg => (
              <div
                key={bg.id}
                className={`bg-option ${currentBg === bg.id ? 'active' : ''}`}
                style={{ background: bg.preview }}
                onClick={() => handleSelect(bg.id)}
              >
                <span className="bg-label">{bg.label}</span>
                {currentBg === bg.id && <span className="bg-check">✓</span>}
              </div>
            ))}
          </div>

          <label className="section-label" style={{ marginTop: '1.5rem' }}>Your Backgrounds</label>
          <div className="bg-grid">
            {customBgs.map((bg, i) => (
              <div
                key={i}
                className={`bg-option ${currentBg === bg ? 'active' : ''}`}
                style={{ backgroundImage: `url(${bg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                onClick={() => handleSelect(bg)}
              >
                {currentBg === bg && <span className="bg-check">✓</span>}
                <button
                  className="bg-delete"
                  onClick={(e) => { e.stopPropagation(); handleDeleteCustom(i); }}
                >✕</button>
              </div>
            ))}

            {customBgs.length < 5 && (
              <div className="bg-upload" onClick={() => fileRef.current.click()}>
                {uploading ? '⏳' : '+ Add Image'}
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleUpload}
                />
              </div>
            )}
          </div>
          <p className="bg-hint">Max 5 custom backgrounds · Max 5MB per image</p>
        </div>
      </div>
    </div>
  );
}