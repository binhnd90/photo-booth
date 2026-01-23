import { useRef, useEffect, useState } from 'react';

export const useCamera = () => {
    const videoRef = useRef(null);
    const [stream, setStream] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const startCamera = async () => {
            try {
                const mediaStream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        width: { ideal: 1280 },
                        height: { ideal: 720 },
                        facingMode: 'user'
                    },
                    audio: false
                });
                setStream(mediaStream);
                if (videoRef.current) {
                    videoRef.current.srcObject = mediaStream;
                }
            } catch (err) {
                console.error("Error accessing camera:", err);
                // Mock fallback for testing/no-camera environments
                console.log("Using fallback mock stream");

                const canvas = document.createElement('canvas');
                canvas.width = 640;
                canvas.height = 480;
                const ctx = canvas.getContext('2d');

                const drawMock = () => {
                    ctx.fillStyle = '#333';
                    ctx.fillRect(0, 0, 640, 480);
                    ctx.fillStyle = '#ff0055';
                    ctx.font = '40px Arial';
                    ctx.fillText('Mock Camera', 50, 50);
                    const time = new Date().toLocaleTimeString();
                    ctx.fillText(time, 50, 100);

                    // Draw a moving circle to test updates
                    const x = (Date.now() / 10) % 640;
                    ctx.fillStyle = '#00eeff';
                    ctx.beginPath();
                    ctx.arc(x, 240, 20, 0, Math.PI * 2);
                    ctx.fill();

                    requestAnimationFrame(drawMock);
                };
                drawMock();

                const mockStream = canvas.captureStream(30);
                setStream(mockStream);
                if (videoRef.current) {
                    videoRef.current.srcObject = mockStream;
                }
            }
        };

        startCamera();

        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, []); // Run once on mount

    return { videoRef, stream, error };
};
