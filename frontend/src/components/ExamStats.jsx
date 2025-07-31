import React from 'react';

function ExamStats() {
  const data = [
    { subject: 'Math', marks: 78, total: 100 },
    { subject: 'Science', marks: 88, total: 100 },
    { subject: 'CS', marks: 94, total: 100 }
  ];

  return (
    <div>
      <h3>Exam Statistics</h3>
      <ul>
        {data.map((item, idx) => (
          <li key={idx}>
            {item.subject}: {item.marks}/{item.total}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ExamStats;
