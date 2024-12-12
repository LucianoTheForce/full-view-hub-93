import React, { useState } from "react";
import { Upload } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface FileUploadProps {
  onUploadComplete: (fileInfo: {
    title: string;
    type: "video" | "image";
    file_path: string;
    file_size: number;
  }) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onUploadComplete }) => {
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const fileType = file.type.startsWith("image/") ? "image" : "video";
    if (!["image", "video"].includes(fileType)) {
      toast({
        title: "Tipo de arquivo inválido",
        description: "Por favor, selecione uma imagem ou vídeo.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    setProgress(0);

    try {
      const fileName = `${crypto.randomUUID()}-${file.name}`;
      const filePath = `${fileType}s/${fileName}`;

      // Simulate upload progress since Supabase doesn't provide progress events
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 100);

      const { error: uploadError } = await supabase.storage
        .from("media")
        .upload(filePath, file);

      clearInterval(progressInterval);
      setProgress(100);

      if (uploadError) throw uploadError;

      const { error: dbError } = await supabase.from("media_items").insert({
        title: file.name,
        type: fileType,
        file_path: filePath,
        file_size: file.size,
      });

      if (dbError) throw dbError;

      const { data: publicUrl } = supabase.storage
        .from("media")
        .getPublicUrl(filePath);

      onUploadComplete({
        title: file.name,
        type: fileType,
        file_path: filePath,
        file_size: file.size,
      });

      toast({
        title: "Upload concluído",
        description: "Seu arquivo foi enviado com sucesso!",
      });
    } catch (error) {
      console.error("Erro no upload:", error);
      toast({
        title: "Erro no upload",
        description: "Não foi possível enviar o arquivo. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setProgress(0);
    }
  };

  return (
    <div className="w-full p-4">
      <label
        className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer ${
          isUploading
            ? "border-primary/50 bg-primary/5"
            : "border-gray-300 hover:border-primary/50 hover:bg-primary/5"
        }`}
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          <Upload className="w-8 h-8 mb-2 text-gray-500" />
          <p className="mb-2 text-sm text-gray-500">
            {isUploading ? (
              <span>Enviando arquivo...</span>
            ) : (
              <span>Clique para enviar um arquivo</span>
            )}
          </p>
        </div>
        <input
          type="file"
          className="hidden"
          accept="image/*,video/*"
          onChange={handleFileSelect}
          disabled={isUploading}
        />
      </label>
      {isUploading && (
        <div className="mt-4">
          <Progress value={progress} className="w-full" />
          <p className="text-sm text-center mt-2 text-gray-500">
            {Math.round(progress)}%
          </p>
        </div>
      )}
    </div>
  );
};