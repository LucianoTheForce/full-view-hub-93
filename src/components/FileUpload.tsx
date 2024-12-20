import React, { useState } from "react";
import { Upload } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type MediaItem = Database["public"]["Tables"]["media_items"]["Row"];

interface FileUploadProps {
  onUploadComplete: (fileInfo: MediaItem) => void;
}

// Maximum file sizes in bytes (50MB for images, 100MB for videos)
const MAX_FILE_SIZES = {
  image: 50 * 1024 * 1024,
  video: 100 * 1024 * 1024,
};

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

    // Check file size
    if (file.size > MAX_FILE_SIZES[fileType]) {
      const maxSizeMB = MAX_FILE_SIZES[fileType] / (1024 * 1024);
      toast({
        title: "Arquivo muito grande",
        description: `O tamanho máximo permitido para ${fileType === 'image' ? 'imagens' : 'vídeos'} é ${maxSizeMB}MB.`,
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    setProgress(0);

    try {
      const fileName = `${crypto.randomUUID()}-${file.name}`;
      const filePath = `${fileType}s/${fileName}`;

      // Simulate upload progress
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

      const { data, error: dbError } = await supabase
        .from("media_items")
        .insert({
          title: file.name,
          type: fileType as "video" | "image",
          file_path: filePath,
          file_size: file.size,
        })
        .select()
        .single();

      if (dbError) throw dbError;

      if (data) {
        onUploadComplete(data);
      }

      toast({
        title: "Upload concluído",
        description: "Seu arquivo foi enviado com sucesso!",
      });
    } catch (error) {
      console.error("Erro no upload:", error);
      toast({
        title: "Erro no upload",
        description: error.message === "Payload too large" 
          ? "O arquivo é muito grande para ser enviado. Por favor, tente um arquivo menor."
          : "Não foi possível enviar o arquivo. Tente novamente.",
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
          <p className="text-xs text-gray-500">
            Máx: {MAX_FILE_SIZES.image / (1024 * 1024)}MB para imagens, {MAX_FILE_SIZES.video / (1024 * 1024)}MB para vídeos
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