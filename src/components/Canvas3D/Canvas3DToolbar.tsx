import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Undo2, Redo2, Trash2, Save, Sparkles, Paintbrush, Box, Sparkle, Upload, Glasses } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Canvas3DToolbarProps {
  brushColor: string;
  setBrushColor: (color: string) => void;
  brushThickness: number;
  setBrushThickness: (size: number) => void;
  glowMode: boolean;
  setGlowMode: (glow: boolean) => void;
  onUndo: () => void;
  onRedo: () => void;
  onClear: () => void;
  onSave: () => void;
  canUndo: boolean;
  canRedo: boolean;
  toolMode: "draw" | "shape" | "particle";
  setToolMode: (mode: "draw" | "shape" | "particle") => void;
  selectedShape: "sphere" | "cube" | "cylinder" | "cone" | "torus";
  setSelectedShape: (shape: "sphere" | "cube" | "cylinder" | "cone" | "torus") => void;
  onImportModel: () => void;
  onToggleVR: () => void;
  isVRMode: boolean;
}

const PRESET_COLORS = [
  "#ff6b9d", // pink
  "#c084fc", // purple
  "#60a5fa", // blue
  "#34d399", // green
  "#fbbf24", // yellow
  "#f87171", // red
  "#fb923c", // orange
  "#e879f9", // magenta
];

export const Canvas3DToolbar = ({
  brushColor,
  setBrushColor,
  brushThickness,
  setBrushThickness,
  glowMode,
  setGlowMode,
  onUndo,
  onRedo,
  onClear,
  onSave,
  canUndo,
  canRedo,
  toolMode,
  setToolMode,
  selectedShape,
  setSelectedShape,
  onImportModel,
  onToggleVR,
  isVRMode,
}: Canvas3DToolbarProps) => {
  return (
    <div className="flex flex-col gap-3 p-4 rounded-lg bg-card/95 backdrop-blur-sm shadow-elegant border border-border max-w-xs">
      {/* Tool Mode Selector */}
      <div className="space-y-2">
        <Label className="text-xs font-medium">Tool Mode</Label>
        <Tabs value={toolMode} onValueChange={(v) => setToolMode(v as any)}>
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="draw" className="text-xs">
              <Paintbrush className="h-3 w-3 mr-1" />
              Draw
            </TabsTrigger>
            <TabsTrigger value="shape" className="text-xs">
              <Box className="h-3 w-3 mr-1" />
              Shape
            </TabsTrigger>
            <TabsTrigger value="particle" className="text-xs">
              <Sparkle className="h-3 w-3 mr-1" />
              Particle
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Shape Selector (only visible when shape mode is active) */}
      {toolMode === "shape" && (
        <div className="space-y-2">
          <Label className="text-xs font-medium">Select Shape</Label>
          <div className="grid grid-cols-5 gap-2">
            {(["sphere", "cube", "cylinder", "cone", "torus"] as const).map((shape) => (
              <Button
                key={shape}
                onClick={() => setSelectedShape(shape)}
                variant={selectedShape === shape ? "default" : "outline"}
                size="sm"
                className="text-xs capitalize"
              >
                {shape[0]}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Import & VR Buttons */}
      <div className="flex gap-2">
        <Button
          onClick={onImportModel}
          variant="outline"
          size="sm"
          className="flex-1"
        >
          <Upload className="h-4 w-4 mr-1" />
          Import 3D
        </Button>
        <Button
          onClick={onToggleVR}
          variant={isVRMode ? "default" : "outline"}
          size="sm"
          className="flex-1"
        >
          <Glasses className="h-4 w-4 mr-1" />
          VR
        </Button>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 flex-wrap">
        <Button
          onClick={onUndo}
          disabled={!canUndo}
          variant="outline"
          size="sm"
          className="flex-1"
        >
          <Undo2 className="h-4 w-4 mr-1" />
          Undo
        </Button>
        <Button
          onClick={onRedo}
          disabled={!canRedo}
          variant="outline"
          size="sm"
          className="flex-1"
        >
          <Redo2 className="h-4 w-4 mr-1" />
          Redo
        </Button>
      </div>

      <div className="flex gap-2">
        <Button
          onClick={onClear}
          variant="outline"
          size="sm"
          className="flex-1"
        >
          <Trash2 className="h-4 w-4 mr-1" />
          Clear
        </Button>
        <Button
          onClick={onSave}
          variant="default"
          size="sm"
          className="flex-1"
        >
          <Save className="h-4 w-4 mr-1" />
          Save
        </Button>
      </div>

      {/* Color Picker */}
      <div className="space-y-2">
        <Label className="text-xs font-medium">Brush Color</Label>
        <div className="grid grid-cols-4 gap-2">
          {PRESET_COLORS.map((color) => (
            <button
              key={color}
              onClick={() => setBrushColor(color)}
              className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 ${
                brushColor === color ? "border-primary ring-2 ring-primary/50" : "border-border"
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
        <input
          type="color"
          value={brushColor}
          onChange={(e) => setBrushColor(e.target.value)}
          className="w-full h-8 rounded cursor-pointer"
        />
      </div>

      {/* Brush Thickness */}
      <div className="space-y-2">
        <Label className="text-xs font-medium">
          Brush Size: {brushThickness.toFixed(2)}
        </Label>
        <Slider
          value={[brushThickness]}
          onValueChange={([value]) => setBrushThickness(value)}
          min={0.05}
          max={0.5}
          step={0.05}
          className="w-full"
        />
      </div>

      {/* Glow Mode Toggle */}
      <Button
        onClick={() => setGlowMode(!glowMode)}
        variant={glowMode ? "default" : "outline"}
        size="sm"
        className="w-full"
      >
        <Sparkles className="h-4 w-4 mr-2" />
        {glowMode ? "Glow On" : "Glow Off"}
      </Button>
    </div>
  );
};
