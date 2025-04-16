import React, { useState } from "react";
import "./TeacherPage.css";

// Custom components to replace the missing ones
const Card = ({ children, className }) => (
  <div className={`card ${className || ''}`}>{children}</div>
);

const CardContent = ({ children, className }) => (
  <div className={className || ''}>{children}</div>
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

const Input = ({ type, value, onChange, placeholder, className }) => (
  <input
    type={type || 'text'}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    className={`input ${className || ''}`}
  />
);

const Textarea = ({ value, onChange, placeholder, className }) => (
  <textarea
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    className={`textarea ${className || ''}`}
  />
);

// Simple icon components
const UploadCloud = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
    <polyline points="17 8 12 3 7 8"></polyline>
    <line x1="12" y1="3" x2="12" y2="15"></line>
  </svg>
);

const Trash2 = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    <line x1="10" y1="11" x2="10" y2="17"></line>
    <line x1="14" y1="11" x2="14" y2="17"></line>
  </svg>
);

export default function TeacherPage() {
  const [numQuestions, setNumQuestions] = useState(1);
  const [questions, setQuestions] = useState([]);
  const [maxTime, setMaxTime] = useState(60);
  const [showPreview, setShowPreview] = useState(false);
  const [settingAnswers, setSettingAnswers] = useState(false);
  const [error, setError] = useState("");

  const handleAddQuestions = () => {
    if (questions.length >= numQuestions) {
      setError("You cannot add more questions than specified.");
      return;
    }
    const remaining = numQuestions - questions.length;
    const newQuestions = Array.from({ length: remaining }, (_, i) => ({
      id: Date.now() + i,
      type: "mcq",
      text: "",
      options: ["", "", "", ""],
      image: null,
      marks: 1,
      answer: "",
      sampleAnswer: "",
    }));
    setQuestions([...questions, ...newQuestions]);
    setError("");
  };

  const updateQuestion = (index, field, value) => {
    const updated = [...questions];
    updated[index][field] = value;
    setQuestions(updated);
  };

  const handleImageUpload = (index, file) => {
    const updated = [...questions];
    updated[index].image = URL.createObjectURL(file);
    setQuestions(updated);
  };

  const handleDeleteQuestion = (index) => {
    const updated = [...questions];
    updated.splice(index, 1);
    setQuestions(updated);
  };

  const renderQuestionInput = (q, index) => (
    <Card key={q.id} className="question-card">
      <CardContent>
        <h3>Question {index + 1}</h3>

        <label>Question Text</label>
        <Textarea
          placeholder={`Question ${index + 1}`}
          value={q.text}
          onChange={(e) => updateQuestion(index, "text", e.target.value)}
        />

        <label>Marks</label>
        <Input
          type="number"
          placeholder="Marks"
          value={q.marks}
          onChange={(e) => updateQuestion(index, "marks", e.target.value)}
        />

        <label>Question Type</label>
        <select
          value={q.type}
          onChange={(e) => updateQuestion(index, "type", e.target.value)}
          className="select"
        >
          <option value="mcq">MCQ</option>
          <option value="descriptive">Descriptive</option>
        </select>

        {q.type === "mcq" && (
          <div className="grid">
            {q.options.map((opt, optIdx) => (
              <div key={optIdx}>
                <label>Option {String.fromCharCode(65 + optIdx)}</label>
                <Input
                  placeholder={`Option ${String.fromCharCode(65 + optIdx)}`}
                  value={opt}
                  onChange={(e) => {
                    const updated = [...questions];
                    updated[index].options[optIdx] = e.target.value;
                    setQuestions(updated);
                  }}
                />
              </div>
            ))}
          </div>
        )}

        <div className="flex">
          <label>Upload Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleImageUpload(index, e.target.files[0])}
          />
          <UploadCloud />
          {q.image && (
            <img src={q.image} alt="Uploaded" className="w-24 h-24 object-cover" />
          )}
        </div>

        <Button variant="destructive" onClick={() => handleDeleteQuestion(index)}>
          <Trash2 /> Delete Question
        </Button>
      </CardContent>
    </Card>
  );

  const renderPreview = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Question Paper Preview</h2>
      <p>
        <strong>Maximum Time:</strong> {maxTime} minutes
      </p>
      {questions.map((q, i) => (
        <Card key={q.id} className="p-4">
          <CardContent className="space-y-2">
            <p>
              <strong>Q{i + 1}:</strong> {q.text} ({q.marks} marks)
            </p>
            {q.image && <img src={q.image} className="w-40" alt="" />}
            {q.type === "mcq" && (
              <ul className="list-disc list-inside">
                {q.options.map((opt, idx) => (
                  <li key={idx}>
                    {String.fromCharCode(65 + idx)}. {opt}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      ))}
      <Button onClick={() => setSettingAnswers(true)}>Set Sample Answers</Button>
    </div>
  );

  const renderAnswerInputs = () => (
    <div className="space-y-6 bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Set Sample Answers</h2>
      {questions.map((q, i) => (
        <div key={q.id} className="space-y-2 border-b pb-4">
          <p className="font-semibold text-gray-700">
            <strong>Q{i + 1}:</strong> {q.text}
          </p>
          {q.type === "mcq" ? (
            <div>
              <label className="block text-sm font-medium text-gray-600">Correct Option</label>
              <Input
                placeholder="Correct Option (A, B, C, D)"
                value={q.answer}
                onChange={(e) => updateQuestion(i, "answer", e.target.value.toUpperCase())}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-600">Sample Answer</label>
              <Textarea
                placeholder="Sample Answer"
                value={q.sampleAnswer}
                onChange={(e) => updateQuestion(i, "sampleAnswer", e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
          )}
        </div>
      ))}
      <div className="pt-4">
        <Button
          onClick={() => {
            setSettingAnswers(false);
            setShowPreview(false);
          }}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded shadow"
        >
          Finish
        </Button>
      </div>
    </div>
  );

  return (
    <div className="teacher-page">
      <h1>Create Question Paper</h1>

      {!showPreview && !settingAnswers && (
        <div className="form-group">
          <div className="form-row">
            <div className="form-col">
              <label>Number of Questions</label>
              <Input
                type="number"
                value={numQuestions}
                onChange={(e) => setNumQuestions(parseInt(e.target.value))}
              />
            </div>
            <div className="form-col">
              <label>Maximum Time (minutes)</label>
              <Input
                type="number"
                value={maxTime}
                onChange={(e) => setMaxTime(parseInt(e.target.value))}
              />
            </div>
          </div>

          {error && <p className="text-red-500">{error}</p>}

          <Button onClick={handleAddQuestions}>
            Add Questions
          </Button>

          <div className="question-list">
            {questions.map((q, index) => renderQuestionInput(q, index))}
          </div>

          {questions.length > 0 && (
            <Button onClick={() => setShowPreview(true)}>
              Preview Paper
            </Button>
          )}
        </div>
      )}

      {showPreview && !settingAnswers && renderPreview()}
      {settingAnswers && renderAnswerInputs()}
    </div>
  );
}
