import React, { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import { Camera } from "@mediapipe/camera_utils";
import {
  FACEMESH_TESSELATION,
  HAND_CONNECTIONS,
  Holistic,
} from "@mediapipe/holistic";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";

export default function Video() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [phrase, setPhrase] = useState(""); // State variable to store classification output
  const [detections, setDetections] = useState([]); // Buffer to store detection results

  const onResults = (results) => {
    if (!webcamRef.current?.video || !canvasRef.current) return;
    const videoWidth = webcamRef.current.video.videoWidth;
    const videoHeight = webcamRef.current.video.videoHeight;
    canvasRef.current.width = videoWidth;
    canvasRef.current.height = videoHeight;

    const canvasElement = canvasRef.current;
    const canvasCtx = canvasElement.getContext("2d");
    if (canvasCtx == null) throw new Error("Could not get context");
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

    canvasCtx.globalCompositeOperation = "source-in";
    canvasCtx.fillRect(0, 0, canvasElement.width, canvasElement.height);

    canvasCtx.globalCompositeOperation = "destination-atop";
    canvasCtx.drawImage(
      results.image,
      0,
      0,
      canvasElement.width,
      canvasElement.height
    );

    canvasCtx.globalCompositeOperation = "source-over";
    drawConnectors(canvasCtx, results.faceLandmarks, FACEMESH_TESSELATION, {
      color: "#C0C0C070",
      lineWidth: 1,
    });
    drawConnectors(canvasCtx, results.leftHandLandmarks, HAND_CONNECTIONS, {
      color: "#CC0000",
      lineWidth: 5,
    });
    drawLandmarks(canvasCtx, results.leftHandLandmarks, {
      color: "#00FF00",
      lineWidth: 2,
    });
    drawConnectors(canvasCtx, results.rightHandLandmarks, HAND_CONNECTIONS, {
      color: "#00CC00",
      lineWidth: 5,
    });
    drawLandmarks(canvasCtx, results.rightHandLandmarks, {
      color: "#FF0000",
      lineWidth: 2,
    });

    canvasCtx.restore();

    setDetections((prevDetections) => {
      const collapsedResults = [];
      const bodyParts = [
        "faceLandmarks",
        "leftHandLandmarks",
        "poseLandmarks",
        "rightHandLandmarks",
      ];
      const arrayLens = {
        faceLandmarks: 468,
        poseLandmarks: 33,
        leftHandLandmarks: 21,
        rightHandLandmarks: 21,
      };

      for (const curLetter of ["x", "y", "z"]) {
        for (const partName of bodyParts) {
          if (partName in results) {
            const partArray = results[partName];

            for (let i = 0; i < arrayLens[partName]; i++) {
              collapsedResults.push(partArray[i][curLetter]);
            }
          } else {
            for (let i = 0; i < arrayLens[partName]; i++) {
              collapsedResults.push(0);
            }
          }
        }
      }

      const updatedDetections = [...prevDetections, collapsedResults];
      if (updatedDetections.length >= 150) {
        sendDetections(updatedDetections);
        return updatedDetections.slice(
          updatedDetections.length - 75,
          updatedDetections.length
        );
      }
      return updatedDetections;
    });
  };

  useEffect(() => {
    const holistic = new Holistic({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/holistic/${file}`,
    });

    holistic.setOptions({
      selfieMode: true,
      modelComplexity: 1,
      smoothLandmarks: true,
      enableSegmentation: true,
      smoothSegmentation: true,
      refineFaceLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    holistic.onResults(onResults);

    if (webcamRef.current?.video) {
      const camera = new Camera(webcamRef.current.video, {
        onFrame: async () => {
          await holistic.send({ image: webcamRef.current.video });
        },
        width: 640,
        height: 480,
      });
      camera.start();
    }

    return () => {
      holistic.close(); // Ensure to cleanup resources
    };
  }, []);

  const sendDetections = async (data) => {
    const jsonData = { frames: data };
    try {
      const response = await fetch("/api/feed/send-frames", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(jsonData),
      });
      const output = await response.json();
      // setPhrase(patternMatch(output.prediction));
      setPhrase(output.prediction);
    } catch (err) {
      console.error("Failed to send data: ", err);
    }
  };

  const patternMatch = (newPhrase) => {
    if (newPhrase.length == 0) {
      return phrase;
    }
    var pattern = newPhrase.slice(1);
    var table = buildFailureTable(newPhrase);
    var bestFindIndex = 0,
      bestFindLength = 0;
    var i = 0,
      j = 0;

    while (i <= phrase.length - pattern.length) {
      while (j < pattern.length && pattern[j] == phrase[i + j]) {
        j++;
      }
      if (j >= bestFindLength) {
        bestFindIndex = i;
        bestFindLength = j;
      }
      if (j == 0) {
        i++;
      } else {
        var shiftTo = table[j - 1];
        i += j = shiftTo;
        j = shiftTo;
      }
    }

    return phrase.slice(bestFindIndex) + pattern;
  };

  const buildFailureTable = (pattern) => {
    var table = Array(pattern.length);
    var i = 0,
      j = 1;
    table[0] = 0;
    while (j < pattern.length) {
      if (pattern[i] == pattern[j]) {
        table[j++] = i++ + 1;
      } else {
        if (i != 0) {
          i = table[i - 1];
        } else {
          table[j++] = i;
        }
      }
    }

    return table;
  };

  return (
    <div className="flex flex-col justify-center items-center h-screen">
      <div className="mb-4 p-4 bg-white shadow rounded-lg">
        <p className="text-lg font-semibold">
          {phrase || "Gesture will appear here"}
        </p>
      </div>
      <div className="relative mb-20">
        <Webcam
          ref={webcamRef}
          className="rounded-lg shadow-xl"
          videoConstraints={{
            width: 1280,
            height: 720,
            facingMode: "user",
          }}
          style={{
            width: "640px",
            height: "360px",
          }}
        />
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 right-0 bottom-0 m-auto rounded-lg shadow-xl"
          style={{
            width: "640px",
            height: "360px",
          }}
        />
      </div>
    </div>
  );
}
