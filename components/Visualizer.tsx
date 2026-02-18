"use client";

import { useEffect, useRef } from "react";
import { Howler } from "howler";

interface AudioVisualizerProps {
  isPlaying: boolean;
  width?: number;
  height?: number;
}

const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  isPlaying,
  width = 400, 
  height = 50, 
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const audioCtx = Howler.ctx;
    if (!audioCtx) return;

    // Create analyser once
    if (!analyserRef.current) {
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 128; // smaller FFT for smoother bars

      Howler.masterGain.connect(analyser);
      analyser.connect(audioCtx.destination);

      analyserRef.current = analyser;
    }

    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const draw = () => {
      rafRef.current = requestAnimationFrame(draw);

      if (!isPlaying) {
        ctx.clearRect(0, 0, width, height);
        return;
      }

      analyser.getByteFrequencyData(dataArray);
      ctx.clearRect(0, 0, width, height); // transparent background

      const barWidth = (width / bufferLength) * 1.2; // thinner bars
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = dataArray[i] / 3; // shorter bars

        ctx.fillStyle = "#a855f7"; // purple
        ctx.fillRect(x, height - barHeight, barWidth, barHeight);

        x += barWidth + 1;
      }
    };

    draw();

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isPlaying, width, height]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="rounded-xl" 
    />
  );
};

export default AudioVisualizer;
