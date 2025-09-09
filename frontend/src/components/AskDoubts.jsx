import React, { useState } from 'react';

function AskDoubt() {
  const [question, setQuestion] = useState('');
  const [course, setCourse] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Doubt submitted for ${course}: ${question}`);
    // Save to database
  };

  return (
    <div>
      <h3>Ask a Doubt</h3>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Course"
          value={course}
          onChange={(e) => setCourse(e.target.value)}
          required
        />
        <textarea
          placeholder="Your doubt..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          required
        />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

export default AskDoubt;
