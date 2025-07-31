import React, { useState } from 'react';
import '../styles/Exams.css';

function StudyMaterials() {
  const role = localStorage.getItem('userRole');
  const username = localStorage.getItem('username');

  // Study materials state
  const [studyMaterials, setStudyMaterials] = useState(() => {
    const stored = localStorage.getItem('studyMaterials');
    return stored ? JSON.parse(stored) : [];
  });
  const [materialTitle, setMaterialTitle] = useState('');
  const [materialDesc, setMaterialDesc] = useState('');
  const [materialFile, setMaterialFile] = useState(null);
  const [materialMsg, setMaterialMsg] = useState('');

  // Handle study material upload
  const handleMaterialUpload = (e) => {
    e.preventDefault();
    if (!materialTitle || !materialFile) {
      setMaterialMsg('Please provide a title and select a file.');
      return;
    }
    const reader = new FileReader();
    reader.onload = function(ev) {
      const fileData = ev.target.result;
      const newMaterial = {
        title: materialTitle,
        description: materialDesc,
        fileName: materialFile.name,
        fileData,
        uploadedBy: username,
        uploadedAt: new Date().toISOString()
      };
      const updated = [newMaterial, ...studyMaterials];
      setStudyMaterials(updated);
      localStorage.setItem('studyMaterials', JSON.stringify(updated));
      setMaterialTitle('');
      setMaterialDesc('');
      setMaterialFile(null);
      setMaterialMsg('Material uploaded successfully!');
      setTimeout(() => setMaterialMsg(''), 3000);
    };
    reader.readAsDataURL(materialFile);
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 24 }}>
      <h2 style={{ textAlign: 'center', marginBottom: 32 }}>Study Materials</h2>
      {(role === 'teacher_level2' || role === 'teacher_level1') && (
        <div className="study-materials-upload" style={{ margin: '32px 0', background: '#f8fafc', borderRadius: 12, padding: 24, border: '1px solid #e2e8f0' }}>
          <h3>Upload Study Material</h3>
          <form onSubmit={handleMaterialUpload} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <input
              type="text"
              placeholder="Title"
              value={materialTitle}
              onChange={e => setMaterialTitle(e.target.value)}
              style={{ padding: 10, borderRadius: 8, border: '1px solid #d1d5db', fontSize: 16 }}
              required
            />
            <textarea
              placeholder="Description (optional)"
              value={materialDesc}
              onChange={e => setMaterialDesc(e.target.value)}
              style={{ padding: 10, borderRadius: 8, border: '1px solid #d1d5db', fontSize: 16, minHeight: 60 }}
            />
            <input
              type="file"
              accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.xls,.xlsx,.zip,.rar,.png,.jpg,.jpeg"
              onChange={e => setMaterialFile(e.target.files[0])}
              required
            />
            <button type="submit" className="download-btn-modern">Upload</button>
            {materialMsg && <div style={{ color: materialMsg.includes('success') ? '#059669' : '#ef4444', fontWeight: 500 }}>{materialMsg}</div>}
          </form>
        </div>
      )}
      {studyMaterials.length > 0 ? (
        <div className="study-materials-list" style={{ margin: '32px 0', background: '#f8fafc', borderRadius: 12, padding: 24, border: '1px solid #e2e8f0' }}>
          <h3>Available Study Materials</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {studyMaterials.map((mat, idx) => (
              <div key={idx} style={{ background: '#fff', borderRadius: 10, boxShadow: '0 2px 8px rgba(60,60,120,0.07)', padding: 18, border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ fontWeight: 700, fontSize: '1.08rem', color: '#3730a3' }}>{mat.title}</div>
                {mat.description && <div style={{ color: '#64748b', fontSize: '0.97rem' }}>{mat.description}</div>}
                <div style={{ fontSize: '0.95rem', color: '#059669' }}>File: <a href={mat.fileData} download={mat.fileName} style={{ color: '#2563eb', textDecoration: 'underline', fontWeight: 600 }}>{mat.fileName}</a></div>
                <div style={{ fontSize: '0.92rem', color: '#64748b' }}>Uploaded by: <b>{mat.uploadedBy}</b> on {new Date(mat.uploadedAt).toLocaleDateString()}</div>
                <a href={mat.fileData} download={mat.fileName} className="download-btn-modern" style={{ width: 'fit-content', marginTop: 8 }}>Download</a>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ color: '#64748b', textAlign: 'center', marginTop: 40, fontSize: 18 }}>No study materials uploaded yet.</div>
      )}
    </div>
  );
}

export default StudyMaterials; 