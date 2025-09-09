import React, { useState } from 'react';

function ViewDoubts() {
  const [doubts, setDoubts] = useState([
    { id: 1, student: 'S101', course: 'Math', question: 'What is matrix rank?', resolved: false },
    { id: 2, student: 'S102', course: 'CS', question: 'Explain recursion.', resolved: false }
  ]);

  const resolveDoubt = (id) => {
    setDoubts(prev =>
      prev.map(doubt =>
        doubt.id === id ? { ...doubt, resolved: true } : doubt
      )
    );
  };

  return (
    <div>
      <h3>View Doubts</h3>
      <ul>
        {doubts.map(doubt => (
          <li key={doubt.id}>
            <strong>{doubt.course}</strong> - {doubt.question} (by {doubt.student})
            {!doubt.resolved ? (
              <button onClick={() => resolveDoubt(doubt.id)}>Resolve</button>
            ) : (
              <span style={{ color: 'green' }}> ✔ Resolved</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ViewDoubts;
