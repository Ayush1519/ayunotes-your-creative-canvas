import { useState } from "react";
import { useNotesStore } from "@/store/useNotesStore";
import { Canvas } from "../Canvas/Canvas";
import { Canvas3D } from "../Canvas3D/Canvas3D";
import { Editor } from "../Editor/Editor";
import { EmptyState } from "./EmptyState";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export const MainContent = () => {
  const { getSelectedNote } = useNotesStore();
  const selectedNote = getSelectedNote();

  if (!selectedNote) {
    return <EmptyState />;
  }

  return (
    <div className="flex flex-1 overflow-hidden">
      <div className="flex-1 flex flex-col p-6 overflow-auto gap-4">
        <Tabs defaultValue="2d" className="w-full h-full flex flex-col">
          <TabsList className="w-fit">
            <TabsTrigger value="2d">2D Canvas</TabsTrigger>
            <TabsTrigger value="3d">3D Paint Studio</TabsTrigger>
            <TabsTrigger value="editor">Editor</TabsTrigger>
          </TabsList>
          
          <TabsContent value="2d" className="flex-1 min-h-0 mt-4">
            <div className="h-full">
              <Canvas />
            </div>
          </TabsContent>
          
          <TabsContent value="3d" className="flex-1 min-h-0 mt-4">
            <div className="h-full">
              <Canvas3D />
            </div>
          </TabsContent>
          
          <TabsContent value="editor" className="flex-1 min-h-0 mt-4">
            <div className="h-full">
              <Editor />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
