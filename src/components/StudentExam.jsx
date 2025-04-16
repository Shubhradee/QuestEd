import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Webcam from 'react-webcam';
import './StudentExam.css';

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

const Timer = ({ duration, onTimeUp }) => {
  const [timeLeft, setTimeLeft] = useState(duration * 60); // Convert to seconds

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [duration, onTimeUp]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="timer">
      {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
    </div>
  );
};

export default function StudentExam() {
  const navigate = useNavigate();
  const { examId } = useParams();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hasWebcamPermission, setHasWebcamPermission] = useState(false);
  const [examStarted, setExamStarted] = useState(false);
  const [answers, setAnswers] = useState({});
  const [warningCount, setWarningCount] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const webcamRef = useRef(null);
  const fullscreenRef = useRef(null);

  // Mock exam data (replace with actual API call)
  const examData = {
    id: examId,
    title: "Sample Mathematics Test",
    duration: 60,
    questions: [
      {
        id: 1,
        type: "mcq",
        text: "What is 2 + 2?",
        options: ["3", "4", "5", "6"],
        marks: 1
      },
      {
        id: 2,
        type: "descriptive",
        text: "Explain the Pythagorean theorem.",
        marks: 5
      }
    ]
  };

  useEffect(() => {
    // Handle fullscreen changes
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = document.fullscreenElement !== null;
      setIsFullscreen(isCurrentlyFullscreen);

      if (examStarted && !isCurrentlyFullscreen) {
        handleFullscreenExit();
      }
    };

    // Handle tab visibility changes
    const handleVisibilityChange = () => {
      if (examStarted && document.hidden) {
        handleTabSwitch();
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [examStarted]);

  const handleFullscreenExit = () => {
    setWarningCount(prev => {
      const newCount = prev + 1;
      setShowWarning(true);
      
      // Auto-submit after 2 warnings
      if (newCount >= 2) {
        handleSubmit(true);
        return newCount;
      }

      // Try to re-enter fullscreen
      requestFullscreen();
      return newCount;
    });
  };

  const handleTabSwitch = () => {
    setWarningCount(prev => {
      const newCount = prev + 1;
      setShowWarning(true);
      
      // Auto-submit after 2 warnings
      if (newCount >= 2) {
        handleSubmit(true);
      }
      return newCount;
    });
  };

  const requestFullscreen = async () => {
    try {
      await fullscreenRef.current.requestFullscreen();
      setIsFullscreen(true);
    } catch (error) {
      console.error('Failed to enter fullscreen:', error);
    }
  };

  const handleStartExam = async () => {
    try {
      // Request webcam permission
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setHasWebcamPermission(true);

      // Enter fullscreen
      await requestFullscreen();

      // Start exam
      setExamStarted(true);
      setWarningCount(0);
      setShowWarning(false);

      // Initialize answers
      const initialAnswers = {};
      examData.questions.forEach(q => {
        initialAnswers[q.id] = q.type === 'mcq' ? '' : '';
      });
      setAnswers(initialAnswers);
    } catch (error) {
      console.error('Failed to start exam:', error);
      alert('Please enable webcam access to start the exam');
    }
  };

  const handleSubmit = (isAutoSubmit = false) => {
    // Exit fullscreen
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }

    // Save answers and navigate to results
    const submissionData = {
      examId,
      answers,
      autoSubmitted: isAutoSubmit,
      warningCount,
    };
    console.log('Submitting exam:', submissionData);
    
    // Navigate to results page
    navigate('/results', { state: { submissionData } });
  };

  const handleAnswerChange = (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  if (!examStarted) {
    return (
      <div className="exam-start">
        <h1>{examData.title}</h1>
        <div className="exam-instructions">
          <h2>Before You Begin</h2>
          <ul>
            <li>The exam will be conducted in fullscreen mode</li>
            <li>Webcam access is required throughout the exam</li>
            <li>Switching tabs or exiting fullscreen will result in warnings</li>
            <li>Two warnings will lead to automatic submission</li>
            <li>Duration: {examData.duration} minutes</li>
          </ul>
          <Button onClick={handleStartExam}>Start Exam</Button>
        </div>
      </div>
    );
  }

  return (
    <div ref={fullscreenRef} className="exam-container">
      {showWarning && (
        <div className="warning-modal">
          <h2>Warning!</h2>
          <p>You have received {warningCount} out of 2 warnings.</p>
          <p>The exam will be automatically submitted after 2 warnings.</p>
          <Button onClick={() => setShowWarning(false)}>Acknowledge</Button>
        </div>
      )}

      <div className="exam-header">
        <h1>{examData.title}</h1>
        <Timer 
          duration={examData.duration} 
          onTimeUp={() => handleSubmit(true)} 
        />
        <div className="warning-count">
          Warnings: {warningCount}/2
        </div>
      </div>

      <div className="exam-content">
        <div className="webcam-container">
          {hasWebcamPermission && (
            <Webcam
              ref={webcamRef}
              audio={false}
              className="webcam"
            />
          )}
        </div>

        <div className="questions-container">
          {examData.questions.map((question, index) => (
            <div key={question.id} className="question-card">
              <h3>Question {index + 1} ({question.marks} marks)</h3>
              <p>{question.text}</p>
              
              {question.type === 'mcq' ? (
                <div className="options">
                  {question.options.map((option, optIndex) => (
                    <label key={optIndex} className="option-label">
                      <input
                        type="radio"
                        name={`question-${question.id}`}
                        value={option}
                        checked={answers[question.id] === option}
                        onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                      />
                      {option}
                    </label>
                  ))}
                </div>
              ) : (
                <textarea
                  value={answers[question.id] || ''}
                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                  placeholder="Type your answer here..."
                  className="answer-textarea"
                />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="exam-footer">
        <Button onClick={() => handleSubmit(false)}>Submit Exam</Button>
      </div>
    </div>
  );
} 