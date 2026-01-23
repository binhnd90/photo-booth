import React from 'react';

const ReviewScreen = ({ image, onRetake, onDownload }) => {
    return (
        <div className="review-screen" style={{
            textAlign: 'center',
            padding: '20px',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            background: 'var(--bg-color)'
        }}>
            <h2 style={{ marginBottom: '20px', color: 'var(--secondary-color)' }}>Great Shot!</h2>

            <div className="image-container" style={{
                maxWidth: '100%',
                maxHeight: '70vh',
                border: '5px solid white',
                boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                marginBottom: '30px',
                overflow: 'hidden',
                borderRadius: '10px'
            }}>
                <img src={image} alt="Captured" style={{ width: '100%', height: 'auto', display: 'block' }} />
            </div>

            <div className="actions" style={{ display: 'flex', gap: '20px' }}>
                <button onClick={onRetake} style={{
                    padding: '12px 30px',
                    fontSize: '1.2rem',
                    borderRadius: '30px',
                    background: '#333',
                    color: 'white',
                    border: '1px solid #555'
                }}>
                    Retake
                </button>

                <button onClick={onDownload} style={{
                    padding: '12px 30px',
                    fontSize: '1.2rem',
                    borderRadius: '30px',
                    background: 'var(--secondary-color)',
                    color: '#000',
                    fontWeight: 'bold',
                    boxShadow: '0 4px 15px rgba(0, 238, 255, 0.4)'
                }}>
                    Download
                </button>
            </div>
        </div>
    );
};

export default ReviewScreen;
