import React, { useState, useEffect, useRef } from 'react';
import './GamesList.css'; // Re-use existing styles

const TerminalPopup = ({ isOpen, onClose, onSubmit, title, placeholder }) => {
    const [inputValue, setInputValue] = useState('');
    const inputRef = useRef(null);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
        if (!isOpen) {
            setInputValue('');
        }
    }, [isOpen]);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        } else if (e.key === 'Escape') {
            onClose();
        }
    };

    const handleSubmit = () => {
        if (inputValue.trim()) {
            onSubmit(inputValue);
            setInputValue('');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="terminal-popup-overlay" onClick={onClose}>
            <div className="terminal-popup-box" onClick={(e) => e.stopPropagation()}>
                <div className="btop-header">
                    {title}
                    <button className="terminal-popup-close" onClick={onClose}>x</button>
                </div>
                <div className="terminal-popup-content">
                    <textarea
                        ref={inputRef}
                        className="terminal-popup-input"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={placeholder}
                        rows={4}
                    />
                    <div className="terminal-popup-footer">
                        <button className="terminal-popup-button cancel" onClick={onClose}>Cancel</button>
                        <button className="terminal-popup-button submit" onClick={handleSubmit}>Submit</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TerminalPopup;
