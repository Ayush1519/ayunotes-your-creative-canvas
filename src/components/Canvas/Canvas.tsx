import { useRef, useEffect, useState } from "react";
import { useNotesStore } from "@/store/useNotesStore";
import { DrawingToolbar } from "./DrawingToolbar";
import { DrawingTool } from "@/types/note";
import { toast } from "sonner";

export const Canvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<DrawingTool>({
    type: "pen",
    color: "#000000",
    size: 2,
  });

  const { getSelectedNote, updateNote } = useNotesStore();
  const selectedNote = getSelectedNote();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    // Load existing drawing
    if (selectedNote?.drawing) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, rect.width, rect.height);
      };
      img.src = selectedNote.drawing;
    } else {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, rect.width, rect.height);
    }
  }, [selectedNote?.id]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    saveDrawing();
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing && e.type !== "mousedown") return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = tool.size;

    if (tool.type === "pen") {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = tool.color;
    } else {
      ctx.globalCompositeOperation = "destination-out";
    }

    if (e.type === "mousedown") {
      ctx.beginPath();
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const saveDrawing = () => {
    const canvas = canvasRef.current;
    if (!canvas || !selectedNote) return;

    const dataUrl = canvas.toDataURL("image/png");
    updateNote(selectedNote.id, { drawing: dataUrl });
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, rect.width, rect.height);
    saveDrawing();
    toast.success("Canvas cleared");
  };

  const exportDrawing = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = `${selectedNote?.title || "drawing"}.png`;
    link.href = dataUrl;
    link.click();
    toast.success("Drawing exported");
  };

  const insertIntoNote = () => {
    if (!selectedNote) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL("image/png");
    const imgTag = `<img src="${dataUrl}" alt="Drawing" style="max-width: 100%; border-radius: 8px; margin: 16px 0;" />`;
    updateNote(selectedNote.id, {
      content: selectedNote.content + imgTag,
    });
    toast.success("Drawing inserted into note");
  };

  return (
    <div className="flex flex-col h-full bg-card rounded-xl shadow-medium border border-border overflow-hidden">
      <DrawingToolbar
        tool={tool}
        onToolChange={setTool}
        onClear={clearCanvas}
        onExport={exportDrawing}
        onInsert={insertIntoNote}
      />
      <div className="flex-1 p-4 bg-white">
        <canvas
          ref={canvasRef}
          className="w-full h-full rounded-lg border border-border cursor-crosshair"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
        />
      </div>
    </div>
  );
};
