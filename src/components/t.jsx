import React from 'react';

function Timetable() {
  const lectures = [
    { day: 'Monday', subject: 'Math', time: '10:00 - 11:00' },
    { day: 'Tuesday', subject: 'CS', time: '11:00 - 12:00' }
  ];

  return (
    <div>
      <h3>Timetable</h3>
      <ul>
        {lectures.map((lecture, index) => (
          <li key={index}>{lecture.day}: {lecture.subject} at {lecture.time}</li>
        ))}
      </ul>
    </div>
  );
}

export default Timetable;
