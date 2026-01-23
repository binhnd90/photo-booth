import React from 'react';
import '../index.css'; // Ensure base styles

const StartScreen = ({ onStart }) => {
    return (
        <div className="start-screen" style={{ textAlign: 'center', padding: '20px' }}>
            <h1 style={{ marginBottom: '20px', fontSize: '3rem', color: 'var(--primary-color)' }}>Photo Booth</h1>
            <p style={{ marginBottom: '40px', fontSize: '1.2rem', color: '#ccc' }}>
                Capture your moments instantly.
            </p>
            <button
                onClick={onStart}
                style={{
                    padding: '15px 40px',
                    fontSize: '1.5rem',
                    borderRadius: '50px',
                    background: 'var(--primary-color)',
                    color: 'white',
                    fontWeight: 'bold',
                    boxShadow: '0 4px 15px rgba(255, 0, 85, 0.4)',
                    transition: 'transform 0.2s'
                }}
                onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
                onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
            >
                Start Camera
            </button>
        </div>
    );
};

export default StartScreen;
