"use client";

import type React from "react";
import { useRef, useState } from "react";

export default function CanvasPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  const [tool, setTool] = useState<"pen" | "eraser">("pen");
  const [color, setColor] = useState("#111827");

  const getPoint = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY,
    };
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const point = getPoint(event);
    if (!point) return;

    isDrawingRef.current = true;
    lastPointRef.current = point;
    canvas.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    const point = getPoint(event);
    const lastPoint = lastPointRef.current;
    if (!context || !point || !lastPoint) return;

    context.beginPath();
    context.moveTo(lastPoint.x, lastPoint.y);
    context.lineTo(point.x, point.y);
    const isEraser = tool === "eraser";
    context.globalCompositeOperation = isEraser ? "destination-out" : "source-over";
    context.lineWidth = isEraser ? 20 : 3;
    context.lineCap = "round";
    context.lineJoin = "round";
    context.strokeStyle = isEraser ? "#000000" : color;
    context.stroke();

    lastPointRef.current = point;
  };

  const handlePointerUp = () => {
    isDrawingRef.current = false;
    lastPointRef.current = null;
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    context.clearRect(0, 0, canvas.width, canvas.height);
  };

  return (
    <section className="space-y-4 p-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">Canvas Demo</h1>
        <div className="flex items-center gap-2">
          <button
            className={`rounded px-3 py-2 text-sm ${tool === "pen" ? "bg-black text-white" : "bg-gray-100 text-gray-900"}`}
            onClick={() => setTool("pen")}
            type="button"
          >
            Pen
          </button>
          <button
            className={`rounded px-3 py-2 text-sm ${tool === "eraser" ? "bg-black text-white" : "bg-gray-100 text-gray-900"}`}
            onClick={() => setTool("eraser")}
            type="button"
          >
            Eraser
          </button>
          <label className="flex items-center gap-2 rounded bg-gray-100 px-3 py-2 text-sm text-gray-900">
            Color
            <input
              className="h-6 w-10 cursor-pointer border-0 bg-transparent p-0"
              onChange={(event) => setColor(event.target.value)}
              type="color"
              value={color}
            />
          </label>
          <button
            className="rounded bg-black px-3 py-2 text-sm text-white"
            onClick={handleClear}
            type="button"
          >
            Clear
          </button>
        </div>
      </div>
      <div className="overflow-auto [scrollbar-width:thin] [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-400">
        <canvas
          className="rounded border bg-white touch-none"
          height={420}
          onPointerDown={handlePointerDown}
          onPointerLeave={handlePointerUp}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          ref={canvasRef}
          width={960}
        />
      </div>
    </section>
  );
}
