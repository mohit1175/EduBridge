import React, { useState } from 'react';
import '../styles/Doubts.css'; // Create this if you want to style it

function Doubts() {
  const [doubts, setDoubts] = useState([
    { course: 'Math', question: 'What is integration by parts?', id: 1 },
    { course: 'CS', question: 'What is the difference between == and ===?', id: 2 }
  ]);
  const [question, setQuestion] = useState('');
  const [course, setCourse] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    const newDoubt = {
      id: Date.now(),
      course,
      question
    };

    setDoubts([newDoubt, ...doubts]); // prepend to the list
    setCourse('');
    setQuestion('');
  };

  return (
    <div className="doubts-page">
      <h2>💬 Ask a Doubt</h2>

      {/* Ask Doubt Form */}
      <form className="ask-doubt-form" onSubmit={handleSubmit}>
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

      {/* Doubt List */}
      <div className="submitted-doubts">
        <h3>📚 Submitted Doubts</h3>
        <ul>
          {doubts.map((doubt) => (
            <li key={doubt.id}>
              <strong>{doubt.course}</strong>: {doubt.question}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Doubts;
