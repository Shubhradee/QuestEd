import React, { useState, useEffect } from 'react';
import './ExamResults.css';

const calculateMCQScore = (answer, correctAnswer) => {
  return answer === correctAnswer ? 1 : 0;
};

const calculateDescriptiveScore = async (answer, sampleAnswer) => {
  // This is where you would integrate with your ML model
  // For now, we'll use a simple similarity score
  if (!answer || !sampleAnswer) return 0;
  
  // Simple word matching similarity (replace with ML model)
  const answerWords = new Set(answer.toLowerCase().split(' '));
  const sampleWords = new Set(sampleAnswer.toLowerCase().split(' '));
  const intersection = new Set([...answerWords].filter(x => sampleWords.has(x)));
  const similarity = intersection.size / Math.max(answerWords.size, sampleWords.size);
  
  return similarity;
};

export default function ExamResults() {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAndCalculateResults = async () => {
      try {
        // Mock API call to fetch exam data and answers
        const mockData = {
          exam: {
            id: "exam123",
            title: "Sample Exam",
            totalMarks: 20,
            questions: [
              {
                id: 1,
                type: "mcq",
                text: "What is 2 + 2?",
                options: ["3", "4", "5", "6"],
                marks: 1,
                correctAnswer: "4"
              },
              {
                id: 2,
                type: "descriptive",
                text: "Explain the concept of React hooks.",
                marks: 5,
                sampleAnswer: "React Hooks are functions that allow you to use state and other React features in functional components. They help in managing component lifecycle and state without writing class components."
              }
            ]
          },
          answers: {
            1: "4",
            2: "React hooks are functions that let us use state in functional components. They make it easier to reuse stateful logic between components."
          }
        };

        // Calculate scores
        const questionResults = await Promise.all(
          mockData.exam.questions.map(async (question) => {
            const answer = mockData.answers[question.id];
            let score = 0;

            if (question.type === "mcq") {
              score = calculateMCQScore(answer, question.correctAnswer) * question.marks;
            } else {
              const accuracy = await calculateDescriptiveScore(answer, question.sampleAnswer);
              score = accuracy * question.marks;
            }

            return {
              ...question,
              answer,
              score,
              accuracy: score / question.marks * 100
            };
          })
        );

        const totalScore = questionResults.reduce((sum, q) => sum + q.score, 0);
        const totalPossible = questionResults.reduce((sum, q) => sum + q.marks, 0);
        const percentage = (totalScore / totalPossible) * 100;

        // Calculate grade
        let grade;
        if (percentage >= 90) grade = 'A';
        else if (percentage >= 80) grade = 'B';
        else if (percentage >= 70) grade = 'C';
        else if (percentage >= 60) grade = 'D';
        else grade = 'F';

        setResults({
          examTitle: mockData.exam.title,
          questions: questionResults,
          totalScore,
          totalPossible,
          percentage,
          grade
        });
      } catch (error) {
        console.error("Error calculating results:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAndCalculateResults();
  }, []);

  if (loading) {
    return <div className="loading">Calculating results...</div>;
  }

  if (!results) {
    return <div className="error">Failed to load results</div>;
  }

  return (
    <div className="results-container">
      <div className="results-header">
        <h1>{results.examTitle} - Results</h1>
        <div className="grade-card">
          <div className="grade">{results.grade}</div>
          <div className="score">
            {results.totalScore.toFixed(1)} / {results.totalPossible}
            <div className="percentage">
              {results.percentage.toFixed(1)}%
            </div>
          </div>
        </div>
      </div>

      <div className="questions-review">
        <h2>Detailed Review</h2>
        {results.questions.map((question) => (
          <div key={question.id} className="question-review">
            <div className="question-header">
              <h3>Question {question.id}</h3>
              <div className="question-score">
                Score: {question.score.toFixed(1)} / {question.marks}
                <span className="accuracy">
                  ({question.accuracy.toFixed(1)}%)
                </span>
              </div>
            </div>
            
            <p className="question-text">{question.text}</p>
            
            <div className="answer-review">
              <div className="your-answer">
                <h4>Your Answer:</h4>
                <p>{question.answer}</p>
              </div>
              
              {question.type === "mcq" ? (
                <div className="correct-answer">
                  <h4>Correct Answer:</h4>
                  <p>{question.correctAnswer}</p>
                </div>
              ) : (
                <div className="sample-answer">
                  <h4>Sample Answer:</h4>
                  <p>{question.sampleAnswer}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 