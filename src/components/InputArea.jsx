import React, { useState, useEffect, useRef } from 'react';

const InputArea = ({ onCheckWord, message, correctWordLength }) => {
  const [inputValue, setInputValue] = useState('');
  const [inputClass, setInputClass] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    // Clear input and reset class when a new word is loaded
    setInputValue('');
    setInputClass('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [correctWordLength]); // Trigger when correctWordLength changes (new word)

  useEffect(() => {
    if (message.includes("Please enter a word!")) {
      setInputClass('flash');
      const timer = setTimeout(() => setInputClass(''), 2000);
      return () => clearTimeout(timer);
    } else if (message.includes("Oops!")) {
      setInputClass('incorrect');
      const timer = setTimeout(() => setInputClass(''), 500);
      return () => clearTimeout(timer);
    } else if (message.includes("is correct!")) {
      setInputClass('correct');
      const timer = setTimeout(() => setInputClass(''), 2000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    // Live input validation (partial-correct)
    if (value.length > 0 && correctWordLength && correctWordLength >= value.length) {
      // This would require passing the correct word or a startsWith check from parent
      // For simplicity, we'll just apply it if length matches, or you can remove this
      // as the assignment doesn't explicitly require live validation beyond basic styling.
      // If you want true partial-correct, you'd need `correctWord` passed down.
      // For now, let's keep it simple and remove the partial-correct class.
      // setInputClass(prev => prev.includes('incorrect') || prev.includes('correct') ? prev : 'partial-correct');
    } else {
      // setInputClass(prev => prev.replace('partial-correct', '').trim());
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onCheckWord(inputValue);
    }
  };

  return (
    <>
      <input
        ref={inputRef}
        type="text"
        spellCheck="false"
        placeholder="Enter a valid word"
        autoComplete="off"
        onPaste={(e) => { e.preventDefault(); return false; }}
        value={inputValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        maxLength={correctWordLength || 20} // Set max length based on current word
        className={inputClass}
      />
      <p id="message" style={{ color: message.includes("correct") ? '#39A7FF' : 'inherit' }}>{message}</p>
    </>
  );
};

export default InputArea;
