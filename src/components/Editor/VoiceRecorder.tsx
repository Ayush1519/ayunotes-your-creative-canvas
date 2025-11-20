import { useState, useRef } from "react";
import { Mic, Square, Trash2, Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNotesStore } from "@/store/useNotesStore";
import { toast } from "sonner";

interface VoiceRecorderProps {
  noteId: string;
}

export const VoiceRecorder = ({ noteId }: VoiceRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout>();
  const { addVoiceNote, getSelectedNote, deleteVoiceNote } = useNotesStore();
  const selectedNote = getSelectedNote();

  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64data = reader.result as string;
          addVoiceNote(noteId, {
            audioData: base64data,
            duration: recordingTime,
          });
          toast.success("Voice note saved");
        };
        reader.readAsDataURL(blob);

        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      toast.error("Failed to access microphone");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const togglePlayback = (voiceNoteId: string, audioData: string) => {
    if (playingId === voiceNoteId) {
      audioRef.current?.pause();
      setPlayingId(null);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      const audio = new Audio(audioData);
      audio.onended = () => setPlayingId(null);
      audio.play();
      audioRef.current = audio;
      setPlayingId(voiceNoteId);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        {!isRecording ? (
          <Button size="sm" onClick={startRecording} className="bg-accent hover:bg-accent/90">
            <Mic className="mr-2 h-4 w-4" />
            Start Recording
          </Button>
        ) : (
          <>
            <Button size="sm" variant="destructive" onClick={stopRecording}>
              <Square className="mr-2 h-4 w-4" />
              Stop
            </Button>
            <span className="text-sm font-mono text-muted-foreground">
              {formatTime(recordingTime)}
            </span>
          </>
        )}
      </div>

      {selectedNote && selectedNote.voiceNotes.length > 0 && (
        <div className="space-y-2">
          {selectedNote.voiceNotes.map((voiceNote) => (
            <div
              key={voiceNote.id}
              className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg"
            >
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0"
                onClick={() => togglePlayback(voiceNote.id, voiceNote.audioData)}
              >
                {playingId === voiceNote.id ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
              </Button>
              <div className="flex-1">
                <div className="w-full h-1 bg-primary/20 rounded-full">
                  <div className="h-full bg-primary rounded-full w-0" />
                </div>
              </div>
              <span className="text-xs text-muted-foreground">
                {formatTime(voiceNote.duration)}
              </span>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 text-destructive"
                onClick={() => deleteVoiceNote(noteId, voiceNote.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
