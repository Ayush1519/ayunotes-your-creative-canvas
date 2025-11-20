import { useRef, useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { Button } from "@/components/ui/button";
import { useNotesStore } from "@/store/useNotesStore";
import { Canvas3DToolbar } from "./Canvas3DToolbar";
import { Download, Maximize2, Minimize2 } from "lucide-react";
import { toast } from "sonner";
import * as THREE from "three";

interface Stroke {
  points: THREE.Vector3[];
  color: string;
  thickness: number;
  glow: boolean;
}

const Scene = ({
  strokes,
  currentStroke,
  isDrawing,
  brushColor,
  brushThickness,
  glowMode,
}: {
  strokes: Stroke[];
  currentStroke: THREE.Vector3[];
  isDrawing: boolean;
  brushColor: string;
  brushThickness: number;
  glowMode: boolean;
}) => {
  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <pointLight position={[-10, -10, -10]} intensity={0.3} />
      
      {/* Render all completed strokes */}
      {strokes.map((stroke, strokeIndex) => (
        <group key={strokeIndex}>
          {stroke.points.map((point, i) => {
            if (i === 0) return null;
            const prevPoint = stroke.points[i - 1];
            const direction = new THREE.Vector3().subVectors(point, prevPoint);
            const distance = direction.length();
            const midpoint = new THREE.Vector3().addVectors(prevPoint, point).multiplyScalar(0.5);
            
            return (
              <mesh key={i} position={midpoint}>
                <sphereGeometry args={[stroke.thickness, 8, 8]} />
                <meshStandardMaterial
                  color={stroke.color}
                  emissive={stroke.glow ? stroke.color : undefined}
                  emissiveIntensity={stroke.glow ? 0.5 : 0}
                />
              </mesh>
            );
          })}
        </group>
      ))}
      
      {/* Render current stroke being drawn */}
      {isDrawing && currentStroke.map((point, i) => {
        if (i === 0) return null;
        const prevPoint = currentStroke[i - 1];
        const midpoint = new THREE.Vector3().addVectors(prevPoint, point).multiplyScalar(0.5);
        
        return (
          <mesh key={`current-${i}`} position={midpoint}>
            <sphereGeometry args={[brushThickness, 8, 8]} />
            <meshStandardMaterial
              color={brushColor}
              emissive={glowMode ? brushColor : undefined}
              emissiveIntensity={glowMode ? 0.5 : 0}
            />
          </mesh>
        );
      })}
      
      {/* Grid helper */}
      <gridHelper args={[20, 20, "#888888", "#444444"]} />
    </>
  );
};

export const Canvas3D = () => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [currentStroke, setCurrentStroke] = useState<THREE.Vector3[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushColor, setBrushColor] = useState("#ff6b9d");
  const [brushThickness, setBrushThickness] = useState(0.1);
  const [glowMode, setGlowMode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [history, setHistory] = useState<Stroke[][]>([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);
  
  const { getSelectedNote, updateNote } = useNotesStore();
  const selectedNote = getSelectedNote();

  useEffect(() => {
    if (selectedNote?.drawing3D) {
      try {
        const savedStrokes = JSON.parse(selectedNote.drawing3D);
        setStrokes(savedStrokes.map((s: any) => ({
          ...s,
          points: s.points.map((p: any) => new THREE.Vector3(p.x, p.y, p.z))
        })));
        setHistory([savedStrokes]);
        setHistoryIndex(0);
      } catch (e) {
        console.error("Failed to load 3D drawing", e);
      }
    }
  }, [selectedNote?.id]);

  const saveToNote = () => {
    if (!selectedNote) return;
    
    const serializedStrokes = strokes.map(s => ({
      points: s.points.map(p => ({ x: p.x, y: p.y, z: p.z })),
      color: s.color,
      thickness: s.thickness,
      glow: s.glow
    }));
    
    updateNote(selectedNote.id, {
      drawing3D: JSON.stringify(serializedStrokes)
    });
    toast.success("3D drawing saved");
  };

  const handlePointerDown = (e: any) => {
    if (e.button !== 0) return; // Only left click
    setIsDrawing(true);
    setCurrentStroke([]);
  };

  const handlePointerMove = (e: any) => {
    if (!isDrawing) return;
    
    const point = e.point;
    setCurrentStroke(prev => [...prev, point.clone()]);
  };

  const handlePointerUp = () => {
    if (!isDrawing || currentStroke.length === 0) {
      setIsDrawing(false);
      return;
    }
    
    const newStroke: Stroke = {
      points: currentStroke,
      color: brushColor,
      thickness: brushThickness,
      glow: glowMode
    };
    
    const newStrokes = [...strokes, newStroke];
    setStrokes(newStrokes);
    setCurrentStroke([]);
    setIsDrawing(false);
    
    // Add to history
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newStrokes);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setStrokes(history[historyIndex - 1]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setStrokes(history[historyIndex + 1]);
    }
  };

  const handleClear = () => {
    setStrokes([]);
    setHistory([[]]);
    setHistoryIndex(0);
    if (selectedNote) {
      updateNote(selectedNote.id, { drawing3D: undefined });
    }
    toast.success("3D canvas cleared");
  };

  const handleExportScreenshot = async () => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current.querySelector("canvas");
    if (!canvas) return;
    
    try {
      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `3d-drawing-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
      toast.success("Screenshot exported");
    } catch (error) {
      toast.error("Failed to export screenshot");
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div className={`relative ${isFullscreen ? 'fixed inset-0 z-50 bg-background' : 'h-full'}`}>
      <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-start">
        <Canvas3DToolbar
          brushColor={brushColor}
          setBrushColor={setBrushColor}
          brushThickness={brushThickness}
          setBrushThickness={setBrushThickness}
          glowMode={glowMode}
          setGlowMode={setGlowMode}
          onUndo={handleUndo}
          onRedo={handleRedo}
          onClear={handleClear}
          onSave={saveToNote}
          canUndo={historyIndex > 0}
          canRedo={historyIndex < history.length - 1}
        />
        
        <div className="flex gap-2">
          <Button
            onClick={handleExportScreenshot}
            variant="secondary"
            size="icon"
            className="shadow-medium"
          >
            <Download className="h-4 w-4" />
          </Button>
          <Button
            onClick={toggleFullscreen}
            variant="secondary"
            size="icon"
            className="shadow-medium"
          >
            {isFullscreen ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      <div ref={canvasRef} className="w-full h-full rounded-lg overflow-hidden bg-gradient-to-br from-background to-secondary/10">
        <Canvas>
          <PerspectiveCamera makeDefault position={[5, 5, 5]} />
          <OrbitControls enableDamping dampingFactor={0.05} />
          
          <mesh
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            visible={false}
          >
            <planeGeometry args={[100, 100]} />
          </mesh>
          
          <Scene
            strokes={strokes}
            currentStroke={currentStroke}
            isDrawing={isDrawing}
            brushColor={brushColor}
            brushThickness={brushThickness}
            glowMode={glowMode}
          />
        </Canvas>
      </div>
    </div>
  );
};
