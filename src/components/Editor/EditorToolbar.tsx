import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Code,
  Heading1,
  Heading2,
  Save,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNotesStore } from "@/store/useNotesStore";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { toast } from "sonner";

interface EditorToolbarProps {
  onFormat: (command: string, value?: string) => void;
  onSave: () => void;
}

export const EditorToolbar = ({ onFormat, onSave }: EditorToolbarProps) => {
  const { getSelectedNote } = useNotesStore();
  const selectedNote = getSelectedNote();

  const exportAsPDF = async () => {
    if (!selectedNote) return;

    try {
      const element = document.createElement("div");
      element.innerHTML = `
        <div style="padding: 40px; font-family: Arial, sans-serif;">
          <h1 style="font-size: 24px; margin-bottom: 20px;">${selectedNote.title}</h1>
          ${selectedNote.content}
        </div>
      `;
      document.body.appendChild(element);

      const canvas = await html2canvas(element);
      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "px",
        format: "a4",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${selectedNote.title}.pdf`);

      document.body.removeChild(element);
      toast.success("Exported as PDF");
    } catch (error) {
      toast.error("Failed to export PDF");
    }
  };

  const exportAsText = () => {
    if (!selectedNote) return;

    const text = selectedNote.content.replace(/<[^>]*>/g, "");
    const blob = new Blob([`${selectedNote.title}\n\n${text}`], {
      type: "text/plain",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${selectedNote.title}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Exported as TXT");
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <div className="flex items-center gap-1">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onFormat("bold")}
          className="h-8 w-8 p-0"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onFormat("italic")}
          className="h-8 w-8 p-0"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onFormat("underline")}
          className="h-8 w-8 p-0"
        >
          <Underline className="h-4 w-4" />
        </Button>
      </div>

      <div className="w-px h-6 bg-border" />

      <div className="flex items-center gap-1">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onFormat("formatBlock", "<h1>")}
          className="h-8 w-8 p-0"
        >
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onFormat("formatBlock", "<h2>")}
          className="h-8 w-8 p-0"
        >
          <Heading2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="w-px h-6 bg-border" />

      <div className="flex items-center gap-1">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onFormat("insertUnorderedList")}
          className="h-8 w-8 p-0"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onFormat("insertOrderedList")}
          className="h-8 w-8 p-0"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onFormat("formatBlock", "<pre>")}
          className="h-8 w-8 p-0"
        >
          <Code className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-2">
        <Button size="sm" variant="outline" onClick={onSave}>
          <Save className="mr-2 h-4 w-4" />
          Save
        </Button>
        <Button size="sm" variant="outline" onClick={exportAsPDF}>
          <Download className="mr-2 h-4 w-4" />
          PDF
        </Button>
        <Button size="sm" variant="outline" onClick={exportAsText}>
          <Download className="mr-2 h-4 w-4" />
          TXT
        </Button>
      </div>
    </div>
  );
};
