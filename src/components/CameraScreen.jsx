import React, { useRef, useState, useEffect } from 'react';
import { useCamera } from '../hooks/useCamera';
import { captureImage } from '../utils/capture';
import { FILTERS } from '../utils/filters';
import { useFaceLandmarker } from '../hooks/useFaceLandmarker';
import ARCanvas from './ARCanvas';

const CameraScreen = ({ onCapture, onBack }) => {
    const { videoRef, stream, error } = useCamera();
    const { faceLandmarks } = useFaceLandmarker(videoRef);
    const [countdown, setCountdown] = useState(null);
    const [activeFilter, setActiveFilter] = useState(FILTERS[0]);
    const [arEnabled, setArEnabled] = useState(false);

    // Canvas dimensions state to sync AR overlay
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    useEffect(() => {
        if (videoRef.current) {
            const updateDimensions = () => {
                setDimensions({
                    width: videoRef.current.clientWidth,
                    height: videoRef.current.clientHeight
                });
            };
            window.addEventListener('resize', updateDimensions);
            // Initial check
            const interval = setInterval(() => {
                if (videoRef.current && (videoRef.current.clientWidth !== dimensions.width)) {
                    updateDimensions();
                }
            }, 500);

            return () => {
                window.removeEventListener('resize', updateDimensions);
                clearInterval(interval);
            };
        }
    }, [videoRef]);

    useEffect(() => {
        if (countdown === null) return;

        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
            return () => clearTimeout(timer);
        } else {
            // Countdown finished, capture!
            const img = captureImage(videoRef.current, activeFilter.value, arEnabled, faceLandmarks);
            if (img) onCapture(img);
            setCountdown(null);
        }
    }, [countdown, onCapture, videoRef, activeFilter, arEnabled, faceLandmarks]);

    const startCapture = () => {
        setCountdown(3);
    };

    if (error) {
        return (
            <div className="camera-screen error">
                <p>Error accessing camera: {error.message}</p>
                <button onClick={onBack}>Back</button>
            </div>
        );
    }

    if (!stream) {
        return <div className="camera-screen loading">Loading Camera...</div>;
    }

    return (
        <div className="camera-screen" style={{ position: 'relative', width: '100%', height: '100%' }}>
            {/* Video Container */}
            <div className="video-container" style={{
                position: 'relative',
                width: '100%',
                height: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                background: '#000'
            }}>
                {/* Video Element */}
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transform: 'scaleX(-1)', // Mirror effect
                        filter: activeFilter.value
                    }}
                />

                {/* AR Overlay */}
                <ARCanvas
                    faceLandmarks={faceLandmarks}
                    width={dimensions.width}
                    height={dimensions.height}
                    activeAR={arEnabled}
                />

                {/* Overlay UI */}
                {countdown !== null && (
                    <div className="countdown-overlay" style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        fontSize: '10rem',
                        color: 'white',
                        fontWeight: 'bold',
                        textShadow: '0 0 20px rgba(0,0,0,0.5)',
                        zIndex: 10
                    }}>
                        {countdown > 0 ? countdown : 'SMILE!'}
                    </div>
                )}

                <div className="controls" style={{
                    position: 'absolute',
                    bottom: '30px',
                    left: '0',
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '20px',
                    zIndex: 20
                }}>
                    {/* AR Toggle */}
                    <button onClick={() => setArEnabled(!arEnabled)} style={{
                        position: 'absolute',
                        top: '-150px',
                        right: '20px',
                        background: arEnabled ? 'var(--primary-color)' : 'rgba(255,255,255,0.2)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '50%',
                        width: '50px',
                        height: '50px',
                        fontSize: '1.2rem',
                        boxShadow: arEnabled ? '0 0 10px var(--primary-color)' : 'none'
                    }}>
                        😎
                    </button>


                    {/* Filter Selector */}
                    <div className="filters" style={{
                        position: 'absolute',
                        bottom: '100px',
                        left: '0',
                        width: '100%',
                        display: 'flex',
                        justifyContent: 'center',
                        gap: '10px',
                        overflowX: 'auto',
                        padding: '10px'
                    }}>
                        {FILTERS.map(f => (
                            <button key={f.name} onClick={() => setActiveFilter(f)} style={{
                                background: activeFilter.name === f.name ? 'var(--primary-color)' : 'rgba(255,255,255,0.2)',
                                color: 'white',
                                padding: '5px 15px',
                                borderRadius: '15px',
                                fontSize: '0.8rem',
                                border: '1px solid white'
                            }}>
                                {f.name}
                            </button>
                        ))}
                    </div>

                    <button onClick={onBack} style={{
                        background: 'rgba(255, 255, 255, 0.2)',
                        color: 'white',
                        padding: '10px 20px',
                        borderRadius: '20px',
                        backdropFilter: 'blur(5px)'
                    }}>
                        Back
                    </button>

                    <button onClick={startCapture} disabled={countdown !== null} style={{
                        width: '70px',
                        height: '70px',
                        borderRadius: '50%',
                        background: countdown !== null ? '#ccc' : 'white',
                        border: '5px solid rgba(0,0,0,0.2)',
                        boxShadow: '0 0 0 4px white',
                        cursor: 'pointer',
                        transition: 'transform 0.1s'
                    }}>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CameraScreen;
