export interface Note {
  id: string;
  title: string;
  content: string;
  emoji: string;
  folderId: string | null;
  createdAt: Date;
  updatedAt: Date;
  voiceNotes: VoiceNote[];
  drawing?: string; // base64 data URL
}

export interface VoiceNote {
  id: string;
  audioData: string; // base64 data URL
  duration: number;
  createdAt: Date;
}

export interface Folder {
  id: string;
  name: string;
  emoji: string;
  createdAt: Date;
}

export interface DrawingTool {
  type: "pen" | "eraser";
  color: string;
  size: number;
}
