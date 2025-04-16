import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './StudentDashboard.css';

const Card = ({ children, className }) => (
  <div className={`card ${className || ''}`}>{children}</div>
);

const Button = ({ children, onClick, className, variant }) => {
  const variantClass = variant === 'destructive' ? 'button-danger' : 
                      variant === 'success' ? 'button-success' : 'button-primary';
  return (
    <button 
      className={`button ${variantClass} ${className || ''}`} 
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock API call to fetch available exams
    const fetchExams = async () => {
      try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Mock exam data
        const mockExams = [
          {
            id: "exam123",
            title: "Sample Mathematics Test",
            duration: 60,
            totalQuestions: 10,
            totalMarks: 20,
            status: "available"
          },
          {
            id: "exam124",
            title: "React Fundamentals Quiz",
            duration: 45,
            totalQuestions: 8,
            totalMarks: 16,
            status: "upcoming"
          }
        ];

        setExams(mockExams);
      } catch (error) {
        console.error("Error fetching exams:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchExams();
  }, []);

  const handleStartExam = (examId) => {
    navigate(`/exam/${examId}`);
  };

  if (loading) {
    return <div className="loading">Loading available exams...</div>;
  }

  return (
    <div className="student-dashboard">
      <h1>Available Exams</h1>
      
      <div className="exams-grid">
        {exams.map(exam => (
          <Card key={exam.id} className="exam-card">
            <h2>{exam.title}</h2>
            <div className="exam-details">
              <p>
                <strong>Duration:</strong> {exam.duration} minutes
              </p>
              <p>
                <strong>Questions:</strong> {exam.totalQuestions}
              </p>
              <p>
                <strong>Total Marks:</strong> {exam.totalMarks}
              </p>
              <p className={`status status-${exam.status}`}>
                {exam.status.charAt(0).toUpperCase() + exam.status.slice(1)}
              </p>
            </div>
            {exam.status === "available" && (
              <Button 
                onClick={() => handleStartExam(exam.id)}
                className="start-button"
              >
                Start Exam
              </Button>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
} 