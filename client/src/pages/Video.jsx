import React, { useEffect, useRef, useState } from 'react';
import Webcam from 'react-webcam';
import { Camera } from '@mediapipe/camera_utils';
import { FACEMESH_TESSELATION, HAND_CONNECTIONS, Holistic } from '@mediapipe/holistic';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';

export default function Video() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [phrase, setPhrase] = useState(''); // State variable to store the classification result

  const onResults = (results) => {
    if (!webcamRef.current?.video || !canvasRef.current) return;
    const videoWidth = webcamRef.current.video.videoWidth;
    const videoHeight = webcamRef.current.video.videoHeight;
    canvasRef.current.width = videoWidth;
    canvasRef.current.height = videoHeight;

    const canvasElement = canvasRef.current;
    const canvasCtx = canvasElement.getContext('2d');
    if (canvasCtx == null) throw new Error('Could not get context');
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

    canvasCtx.globalCompositeOperation = 'source-in';
    canvasCtx.fillRect(0, 0, canvasElement.width, canvasElement.height);

    canvasCtx.globalCompositeOperation = 'destination-atop';
    canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

    canvasCtx.globalCompositeOperation = 'source-over';
    drawConnectors(canvasCtx, results.faceLandmarks, FACEMESH_TESSELATION, {color: '#C0C0C070', lineWidth: 1});
    drawConnectors(canvasCtx, results.leftHandLandmarks, HAND_CONNECTIONS, {color: '#CC0000', lineWidth: 5});
    drawLandmarks(canvasCtx, results.leftHandLandmarks, {color: '#00FF00', lineWidth: 2});
    drawConnectors(canvasCtx, results.rightHandLandmarks, HAND_CONNECTIONS, {color: '#00CC00', lineWidth: 5});
    drawLandmarks(canvasCtx, results.rightHandLandmarks, {color: '#FF0000', lineWidth: 2});
    canvasCtx.restore();

    // Example: Update phrase state with a dummy value or model result
    const receivedPhrase = "Hello"; // Replace this with your model's output
    setPhrase(receivedPhrase);
  };

  useEffect(() => {
    const holistic = new Holistic({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/holistic/${file}`,
    });
    holistic.setOptions({
      selfieMode: true,
      modelComplexity: 1,
      smoothLandmarks: true,
      enableSegmentation: true,
      smoothSegmentation: true,
      refineFaceLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5
    });
    holistic.onResults(onResults);

    if (webcamRef.current && webcamRef.current.video) {
      const camera = new Camera(webcamRef.current.video, {
        onFrame: async () => {
          await holistic.send({image: webcamRef.current.video});
        },
        width: 640,
        height: 480,
      });
      camera.start();
    }
  }, []);

  return (
    <div className="flex flex-col justify-center items-center h-screen">
      <div className="mb-4 p-4 bg-white shadow rounded-lg">
        <p className="text-lg font-semibold">{phrase || "Gesture will appear here"}</p>
      </div>
      <div className="relative mb-20">
        <Webcam
          ref={webcamRef}
          className="rounded-lg shadow-xl"
          videoConstraints={{
            width: 1280,
            height: 720,
            facingMode: "user"
          }}
          style={{
            width: '640px',
            height: '360px',
          }}
        />
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 right-0 bottom-0 m-auto rounded-lg shadow-xl"
          style={{
            width: '640px',
            height: '360px',
          }}
        />
      </div>
    </div>
  );
}