import React from "react";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { GeneratedImage } from "@/services/runware";

interface RunwareGeneratedImagesProps {
  images: GeneratedImage[];
}

export const RunwareGeneratedImages: React.FC<RunwareGeneratedImagesProps> = ({ images }) => {
  const handleSaveToGallery = async (image: GeneratedImage) => {
    try {
      // Download the image
      const response = await fetch(image.imageURL);
      const blob = await response.blob();
      const file = new File([blob], `ai-image-${Date.now()}.webp`, { type: 'image/webp' });
      
      // Upload to Supabase Storage
      const filePath = `ai-generated/${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Create media item record
      const { error: insertError } = await supabase
        .from('media_items')
        .insert({
          title: "Imagem Gerada por IA",
          type: "image",
          file_path: filePath,
          file_size: file.size,
        });

      if (insertError) throw insertError;

      toast.success("Imagem salva na galeria com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar imagem na galeria:", error);
      toast.error("Erro ao salvar imagem na galeria. Tente novamente.");
    }
  };

  if (images.length === 0) return null;

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium">Imagens Geradas</h4>
      <div className="grid grid-cols-2 gap-2">
        {images.map((image, index) => (
          <div key={index} className="relative group">
            <img
              src={image.imageURL}
              alt={`Imagem gerada ${index + 1}`}
              className="w-full aspect-square object-cover rounded-lg"
            />
            <Button
              variant="secondary"
              size="sm"
              className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => handleSaveToGallery(image)}
            >
              <Save className="w-4 h-4 mr-1" />
              Salvar na Galeria
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};