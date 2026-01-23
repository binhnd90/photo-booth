import React, { useRef, useEffect } from 'react';

const ARCanvas = ({ faceLandmarks, width, height, activeAR }) => {
    const canvasRef = useRef(null);
    const glassesImg = useRef(new Image());

    useEffect(() => {
        glassesImg.current.src = '/sunglasses.png';
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !faceLandmarks || faceLandmarks.length === 0 || !activeAR) {
            if (canvas) {
                const ctx = canvas.getContext('2d');
                ctx.clearRect(0, 0, width, height);
            }
            return;
        }

        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, width, height); // Clear previous frame

        // Mirror the canvas context to match the video mirror
        ctx.save();
        ctx.translate(width, 0);
        ctx.scale(-1, 1);

        const landmarks = faceLandmarks[0]; // Assuming 1 face

        // Landmarks for eyes: Left Eye (33), Right Eye (263) - Approximation
        // Better indices for iris: Left 468, Right 473 (if using face mesh w/ iris, but standard 468 point mesh uses different indices)
        // Standard Face Mesh: Left Eye Outer 33, Right Eye Outer 263.

        const leftEye = landmarks[33];
        const rightEye = landmarks[263];

        if (leftEye && rightEye) {
            const eyeCenterX = (leftEye.x + rightEye.x) / 2 * width;
            const eyeCenterY = (leftEye.y + rightEye.y) / 2 * height;

            // Calculate width of glasses based on eye distance
            const eyeDistance = Math.sqrt(
                Math.pow((rightEye.x - leftEye.x) * width, 2) +
                Math.pow((rightEye.y - leftEye.y) * height, 2)
            );

            const glassesWidth = eyeDistance * 2.5; // Scale up
            const glassesHeight = glassesWidth * 0.5; // Aspect ratio of image roughly

            // Calculate Rotation
            const angle = Math.atan2(
                (rightEye.y - leftEye.y) * height,
                (rightEye.x - leftEye.x) * width
            );

            ctx.translate(eyeCenterX, eyeCenterY);
            ctx.rotate(angle);
            ctx.drawImage(
                glassesImg.current,
                -glassesWidth / 2,
                -glassesHeight / 2,
                glassesWidth,
                glassesHeight
            );
            ctx.restore();
        } else {
            ctx.restore();
        }

    }, [faceLandmarks, width, height, activeAR]);

    return (
        <canvas
            ref={canvasRef}
            width={width}
            height={height}
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none'
            }}
        />
    );
};

export default ARCanvas;
