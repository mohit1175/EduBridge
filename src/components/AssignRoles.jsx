import React, { useState } from 'react';

function AssignRoles() {
  const [formData, setFormData] = useState({ teacherId: '', courseId: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Assigned:', formData);
    alert(`Assigned Teacher ${formData.teacherId} to Course ${formData.courseId}`);
    setFormData({ teacherId: '', courseId: '' });
  };

  return (
    <div>
      <h3>Assign Teacher Role</h3>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Teacher ID"
          value={formData.teacherId}
          onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
          required
        />
        <input
          type="text"
          placeholder="Course ID"
          value={formData.courseId}
          onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
          required
        />
        <button type="submit">Assign</button>
      </form>
    </div>
  );
}

export default AssignRoles;
