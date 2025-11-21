import { useRef, useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, useGLTF } from "@react-three/drei";
import { Button } from "@/components/ui/button";
import { useNotesStore } from "@/store/useNotesStore";
import { Canvas3DToolbar } from "./Canvas3DToolbar";
import { Download, Maximize2, Minimize2 } from "lucide-react";
import { toast } from "sonner";
import * as THREE from "three";
import { VRButton, XR, createXRStore } from "@react-three/xr";

interface Stroke {
  points: THREE.Vector3[];
  color: string;
  thickness: number;
  glow: boolean;
  isParticle?: boolean;
}

interface Shape3D {
  id: string;
  type: "sphere" | "cube" | "cylinder" | "cone" | "torus";
  position: THREE.Vector3;
  color: string;
  scale: number;
  glow: boolean;
}

interface Model3D {
  id: string;
  url: string;
  position: THREE.Vector3;
  scale: number;
  rotation: THREE.Euler;
}

interface ParticlePoint {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  life: number;
  color: string;
}

const ShapeComponent = ({ shape }: { shape: Shape3D }) => {
  const getGeometry = () => {
    switch (shape.type) {
      case "sphere":
        return <sphereGeometry args={[1, 32, 32]} />;
      case "cube":
        return <boxGeometry args={[1, 1, 1]} />;
      case "cylinder":
        return <cylinderGeometry args={[1, 1, 2, 32]} />;
      case "cone":
        return <coneGeometry args={[1, 2, 32]} />;
      case "torus":
        return <torusGeometry args={[1, 0.4, 16, 100]} />;
    }
  };

  return (
    <mesh position={shape.position} scale={shape.scale}>
      {getGeometry()}
      <meshStandardMaterial
        color={shape.color}
        emissive={shape.glow ? shape.color : undefined}
        emissiveIntensity={shape.glow ? 0.5 : 0}
      />
    </mesh>
  );
};

const ModelComponent = ({ model }: { model: Model3D }) => {
  const { scene } = useGLTF(model.url);
  return (
    <primitive
      object={scene.clone()}
      position={model.position}
      scale={model.scale}
      rotation={model.rotation}
    />
  );
};

const ParticleSystem = ({ particles }: { particles: ParticlePoint[] }) => {
  return (
    <>
      {particles.map((particle, i) => (
        <mesh key={i} position={particle.position}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshStandardMaterial
            color={particle.color}
            emissive={particle.color}
            emissiveIntensity={0.8}
            transparent
            opacity={particle.life}
          />
        </mesh>
      ))}
    </>
  );
};

const Scene = ({
  strokes,
  currentStroke,
  isDrawing,
  brushColor,
  brushThickness,
  glowMode,
  shapes,
  models,
  particles,
}: {
  strokes: Stroke[];
  currentStroke: THREE.Vector3[];
  isDrawing: boolean;
  brushColor: string;
  brushThickness: number;
  glowMode: boolean;
  shapes: Shape3D[];
  models: Model3D[];
  particles: ParticlePoint[];
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
      
      {/* Render 3D shapes */}
      {shapes.map((shape) => (
        <ShapeComponent key={shape.id} shape={shape} />
      ))}
      
      {/* Render imported models */}
      {models.map((model) => (
        <ModelComponent key={model.id} model={model} />
      ))}
      
      {/* Render particles */}
      <ParticleSystem particles={particles} />
      
      {/* Grid helper */}
      <gridHelper args={[20, 20, "#888888", "#444444"]} />
    </>
  );
};

export const Canvas3D = () => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [currentStroke, setCurrentStroke] = useState<THREE.Vector3[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushColor, setBrushColor] = useState("#ff6b9d");
  const [brushThickness, setBrushThickness] = useState(0.1);
  const [glowMode, setGlowMode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [history, setHistory] = useState<Stroke[][]>([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [toolMode, setToolMode] = useState<"draw" | "shape" | "particle">("draw");
  const [selectedShape, setSelectedShape] = useState<"sphere" | "cube" | "cylinder" | "cone" | "torus">("sphere");
  const [shapes, setShapes] = useState<Shape3D[]>([]);
  const [models, setModels] = useState<Model3D[]>([]);
  const [particles, setParticles] = useState<ParticlePoint[]>([]);
  const [isVRMode, setIsVRMode] = useState(false);
  const vrStore = createXRStore();
  
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
    
    if (toolMode === "shape") {
      // Place a shape at the clicked point
      const newShape: Shape3D = {
        id: `shape-${Date.now()}`,
        type: selectedShape,
        position: e.point.clone(),
        color: brushColor,
        scale: brushThickness * 3,
        glow: glowMode,
      };
      setShapes([...shapes, newShape]);
      toast.success(`${selectedShape} placed`);
    } else if (toolMode === "particle") {
      // Create particle burst at clicked point
      const particleCount = 20;
      const newParticles: ParticlePoint[] = [];
      for (let i = 0; i < particleCount; i++) {
        newParticles.push({
          position: e.point.clone(),
          velocity: new THREE.Vector3(
            (Math.random() - 0.5) * 0.2,
            Math.random() * 0.3,
            (Math.random() - 0.5) * 0.2
          ),
          life: 1,
          color: brushColor,
        });
      }
      setParticles([...particles, ...newParticles]);
    } else {
      setIsDrawing(true);
      setCurrentStroke([]);
    }
  };

  const handlePointerMove = (e: any) => {
    if (!isDrawing || toolMode === "shape") return;
    
    const point = e.point;
    
    if (toolMode === "particle") {
      // Continuous particle trail while drawing
      const newParticles: ParticlePoint[] = [];
      for (let i = 0; i < 5; i++) {
        newParticles.push({
          position: point.clone(),
          velocity: new THREE.Vector3(
            (Math.random() - 0.5) * 0.1,
            Math.random() * 0.15,
            (Math.random() - 0.5) * 0.1
          ),
          life: 1,
          color: brushColor,
        });
      }
      setParticles([...particles, ...newParticles]);
    } else {
      setCurrentStroke(prev => [...prev, point.clone()]);
    }
  };

  const handlePointerUp = () => {
    if (!isDrawing || toolMode === "shape" || (currentStroke.length === 0 && toolMode === "draw")) {
      setIsDrawing(false);
      return;
    }
    
    if (toolMode === "draw") {
      const newStroke: Stroke = {
        points: currentStroke,
        color: brushColor,
        thickness: brushThickness,
        glow: glowMode,
        isParticle: false
      };
      
      const newStrokes = [...strokes, newStroke];
      setStrokes(newStrokes);
      setCurrentStroke([]);
      
      // Add to history
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(newStrokes);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }
    
    setIsDrawing(false);
  };

  // Particle animation loop
  useEffect(() => {
    if (particles.length === 0) return;
    
    const interval = setInterval(() => {
      setParticles(prevParticles => {
        return prevParticles
          .map(p => ({
            ...p,
            position: new THREE.Vector3(
              p.position.x + p.velocity.x,
              p.position.y + p.velocity.y,
              p.position.z + p.velocity.z
            ),
            velocity: new THREE.Vector3(
              p.velocity.x,
              p.velocity.y - 0.01, // gravity
              p.velocity.z
            ),
            life: p.life - 0.02,
          }))
          .filter(p => p.life > 0);
      });
    }, 50);
    
    return () => clearInterval(interval);
  }, [particles.length]);

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
    setShapes([]);
    setModels([]);
    setParticles([]);
    setHistory([[]]);
    setHistoryIndex(0);
    if (selectedNote) {
      updateNote(selectedNote.id, { drawing3D: undefined });
    }
    toast.success("3D canvas cleared");
  };

  const handleImportModel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.name.endsWith('.glb') && !file.name.endsWith('.gltf')) {
      toast.error("Please upload a .glb or .gltf file");
      return;
    }
    
    const url = URL.createObjectURL(file);
    const newModel: Model3D = {
      id: `model-${Date.now()}`,
      url,
      position: new THREE.Vector3(0, 0, 0),
      scale: 1,
      rotation: new THREE.Euler(0, 0, 0),
    };
    
    setModels([...models, newModel]);
    toast.success("3D model imported");
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
      <input
        ref={fileInputRef}
        type="file"
        accept=".glb,.gltf"
        onChange={handleImportModel}
        className="hidden"
      />
      
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
          toolMode={toolMode}
          setToolMode={setToolMode}
          selectedShape={selectedShape}
          setSelectedShape={setSelectedShape}
          onImportModel={() => fileInputRef.current?.click()}
          onToggleVR={() => setIsVRMode(!isVRMode)}
          isVRMode={isVRMode}
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
        {isVRMode && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-auto">
            <VRButton store={vrStore} />
          </div>
        )}
        <Canvas>
          <XR store={vrStore}>
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
              shapes={shapes}
              models={models}
              particles={particles}
            />
          </XR>
        </Canvas>
      </div>
    </div>
  );
};
