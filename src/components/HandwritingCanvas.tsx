import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Eraser, RotateCcw, Trash2, Eye, EyeOff, PenTool } from 'lucide-react';
import { playClick, playEraser } from '../utils/soundEffects';

interface Point {
  x: number;
  y: number;
}

interface Stroke {
  points: Point[];
  color: string;
  width: number;
  isEraser: boolean;
}

interface HandwritingCanvasProps {
  guideText?: string;
  onClearCallback?: () => void;
}

export const HandwritingCanvas: React.FC<HandwritingCanvasProps> = ({
  guideText,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [currentStroke, setCurrentStroke] = useState<Stroke | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>('#38bdf8'); // Sky blue ink
  const [selectedWidth, setSelectedWidth] = useState<number>(4);
  const [isEraser, setIsEraser] = useState<boolean>(false);
  const [showGhostGuide, setShowGhostGuide] = useState<boolean>(true);

  const colors = [
    { name: 'Tinta Cósmica Azul', hex: '#38bdf8' },
    { name: 'Lápiz Grafito', hex: '#e2e8f0' },
    { name: 'Oro Estelar', hex: '#fbbf24' },
    { name: 'Neón Esmeralda', hex: '#34d399' },
    { name: 'Aurora Rosa', hex: '#f472b6' },
  ];

  // Resize canvas according to container
  const handleResize = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    // Set internal resolution
    canvas.width = rect.width * dpr;
    canvas.height = 200 * dpr; // Height of pauta canvas

    // Set display style
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `200px`;

    redrawCanvas();
  }, [strokes, currentStroke]);

  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  // Redraw all strokes on canvas
  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);

    // Draw 4-line school pauta guidelines
    const width = canvas.width / dpr;
    const height = 200;

    const lineTop = 45;       // Ascenders
    const lineMid = 85;       // x-height
    const lineBase = 125;     // Baseline
    const lineBottom = 165;   // Descenders

    ctx.lineWidth = 1;
    // Top line
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(0, lineTop);
    ctx.lineTo(width, lineTop);
    ctx.stroke();

    // Middle line (x-height)
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(0, lineMid);
    ctx.lineTo(width, lineMid);
    ctx.stroke();

    // Baseline (main bold line)
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.65)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, lineBase);
    ctx.lineTo(width, lineBase);
    ctx.stroke();

    // Bottom line (descenders)
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(0, lineBottom);
    ctx.lineTo(width, lineBottom);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw strokes
    const allStrokes = currentStroke ? [...strokes, currentStroke] : strokes;

    allStrokes.forEach(stroke => {
      if (stroke.points.length < 2) return;

      ctx.beginPath();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (stroke.isEraser) {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.lineWidth = stroke.width * 3;
      } else {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = stroke.color;
        ctx.lineWidth = stroke.width;
      }

      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);

      // Smooth curve with quadratic midpoint interpolation
      for (let i = 1; i < stroke.points.length - 1; i++) {
        const midX = (stroke.points[i].x + stroke.points[i + 1].x) / 2;
        const midY = (stroke.points[i].y + stroke.points[i + 1].y) / 2;
        ctx.quadraticCurveTo(stroke.points[i].x, stroke.points[i].y, midX, midY);
      }

      const last = stroke.points[stroke.points.length - 1];
      ctx.lineTo(last.x, last.y);
      ctx.stroke();
    });

    ctx.restore();
  }, [strokes, currentStroke]);

  useEffect(() => {
    redrawCanvas();
  }, [redrawCanvas]);

  // Pointer event handlers (mouse, touch, stylus with smooth pressure)
  const getCanvasCoords = (e: React.PointerEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const point = getCanvasCoords(e);
    const newStroke: Stroke = {
      points: [point],
      color: selectedColor,
      width: selectedWidth,
      isEraser: isEraser,
    };
    setCurrentStroke(newStroke);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!currentStroke) return;
    e.preventDefault();
    const point = getCanvasCoords(e);
    setCurrentStroke(prev => {
      if (!prev) return null;
      return {
        ...prev,
        points: [...prev.points, point],
      };
    });
  };

  const handlePointerUp = () => {
    if (currentStroke) {
      setStrokes(prev => [...prev, currentStroke]);
      setCurrentStroke(null);
    }
  };

  const handleUndo = () => {
    playClick();
    setStrokes(prev => prev.slice(0, -1));
  };

  const handleClear = () => {
    playEraser();
    setStrokes([]);
    setCurrentStroke(null);
  };

  return (
    <div ref={containerRef} className="w-full flex flex-col gap-3">
      {/* Canvas Tool Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
        
        {/* Colors & Pen selection */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={() => {
              playClick();
              setIsEraser(false);
            }}
            className={`p-1.5 rounded-lg flex items-center gap-1 transition-colors ${
              !isEraser ? 'bg-sky-500/20 text-sky-300 font-semibold border border-sky-500/40' : 'text-slate-400 hover:text-white'
            }`}
          >
            <PenTool className="w-4 h-4" />
            <span className="hidden sm:inline">Lápiz</span>
          </button>

          {/* Color swatches */}
          <div className="flex items-center gap-1 pl-1 border-l border-slate-800">
            {colors.map(c => (
              <button
                key={c.hex}
                onClick={() => {
                  playClick();
                  setSelectedColor(c.hex);
                  setIsEraser(false);
                }}
                title={c.name}
                style={{ backgroundColor: c.hex }}
                className={`w-5 h-5 rounded-full transition-transform active:scale-90 ${
                  selectedColor === c.hex && !isEraser
                    ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900 scale-110'
                    : 'opacity-80 hover:opacity-100'
                }`}
              />
            ))}
          </div>

          {/* Stroke thickness */}
          <div className="flex items-center gap-1 pl-2 border-l border-slate-800">
            {[2, 4, 7].map(w => (
              <button
                key={w}
                onClick={() => {
                  playClick();
                  setSelectedWidth(w);
                }}
                className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold ${
                  selectedWidth === w
                    ? 'bg-slate-700 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {w === 2 ? 'F' : w === 4 ? 'M' : 'G'}
              </button>
            ))}
          </div>
        </div>

        {/* Action buttons (Eraser, Undo, Ghost Guide, Clear) */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              playClick();
              setIsEraser(!isEraser);
            }}
            className={`p-1.5 rounded-lg flex items-center gap-1 transition-colors ${
              isEraser ? 'bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/40' : 'text-slate-400 hover:text-white'
            }`}
            title="Modo Borrador"
          >
            <Eraser className="w-4 h-4" />
            <span className="hidden sm:inline">Borrador</span>
          </button>

          {guideText && (
            <button
              onClick={() => {
                playClick();
                setShowGhostGuide(!showGhostGuide);
              }}
              className={`p-1.5 rounded-lg flex items-center gap-1 text-slate-400 hover:text-white transition-colors ${
                showGhostGuide ? 'text-sky-300' : ''
              }`}
              title="Mostrar u ocultar modelo para calcar"
            >
              {showGhostGuide ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              <span className="hidden sm:inline">Guía</span>
            </button>
          )}

          <button
            onClick={handleUndo}
            disabled={strokes.length === 0}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
            title="Deshacer último trazo"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={handleClear}
            disabled={strokes.length === 0}
            className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            title="Borrar toda la pizarra"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* Drawing Canvas Area with Pauta Ruling and Ghost text overlay */}
      <div className="relative w-full rounded-2xl bg-slate-950 border-2 border-slate-800 shadow-inner overflow-hidden cursor-crosshair select-none touch-none">
        
        {/* Ghost Cursive Text to Trace (if enabled) */}
        {showGhostGuide && guideText && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-start px-6 select-none z-0">
            <p className="font-cursive text-5xl sm:text-6xl text-slate-700/50 tracking-wide translate-y-1">
              {guideText}
            </p>
          </div>
        )}

        {/* Interactive Ink Canvas */}
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          className="relative z-10 w-full block"
        />
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-500 font-child px-1">
        <span>✏️ Traza con tu dedo o ratón siguiendo la letra ligada</span>
        <span>{strokes.length} trazos realizados</span>
      </div>
    </div>
  );
};
