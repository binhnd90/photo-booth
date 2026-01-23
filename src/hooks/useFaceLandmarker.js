import { useEffect, useRef, useState } from "react";
import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";

export const useFaceLandmarker = (videoRef) => {
    const [landmarker, setLandmarker] = useState(null);
    const [faceLandmarks, setFaceLandmarks] = useState(null);

    useEffect(() => {
        if (window.IS_TEST_ENV) return;
        const createLandmarker = async () => {
            const vision = await FilesetResolver.forVisionTasks(
                "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
            );
            const newLandmarker = await FaceLandmarker.createFromOptions(vision, {
                baseOptions: {
                    modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
                    delegate: "GPU"
                },
                outputFaceBlendshapes: false,
                runningMode: "VIDEO",
                numFaces: 1
            });
            setLandmarker(newLandmarker);
        };

        createLandmarker();
    }, []);

    useEffect(() => {
        if (!landmarker || !videoRef.current) return;

        let animationFrameId;

        const detect = () => {
            if (videoRef.current && videoRef.current.currentTime > 0) {
                const results = landmarker.detectForVideo(videoRef.current, Date.now());
                if (results.faceLandmarks) {
                    setFaceLandmarks(results.faceLandmarks);
                }
            }
            animationFrameId = requestAnimationFrame(detect);
        };

        detect();

        return () => cancelAnimationFrame(animationFrameId);
    }, [landmarker, videoRef]);

    return { faceLandmarks };
};
