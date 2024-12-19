import React, { useState } from "react";
import { MediaGallery } from "@/components/MediaGallery";
import { ScreenGrid } from "@/components/ScreenGrid";
import { ScreenControls } from "@/components/ScreenControls";
import { FileUpload } from "@/components/FileUpload";
import { RunwareImageGenerator } from "@/components/RunwareImageGenerator";
import { ImageSlider } from "@/components/ImageSlider";
import { useScreens } from "@/hooks/useScreens";
import { useMediaItems } from "@/hooks/useMediaItems";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type MediaItem = Database["public"]["Tables"]["media_items"]["Row"] & {
  url: string;
};

const Index = () => {
  const { screens, selectedScreen, handleScreenSelect, handleUpdateScreen, handleMediaDrop, handleRemoveScreen, addNewScreen } = useScreens();
  const { mediaItems, loadMediaItems } = useMediaItems();
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);

  const handleImageGenerated = (imageUrl: string) => {
    setGeneratedImages((prev) => [...prev, imageUrl]);
  };

  const handleGeneratedImageSelect = (imageUrl: string) => {
    if (selectedScreen) {
      handleUpdateScreen(selectedScreen.id, {
        type: "image",
        title: "Imagem Gerada",
        url: imageUrl,
      });
    }
  };

  const handleMediaSelect = (item: MediaItem) => {
    if (selectedScreen) {
      handleUpdateScreen(selectedScreen.id, {
        type: item.type as "video" | "image",
        title: item.title,
        url: item.url,
      });
    }
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Central de Controle</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 space-y-4">
          <RunwareImageGenerator onImageGenerated={handleImageGenerated} />
          <ImageSlider images={generatedImages} onSelect={handleGeneratedImageSelect} />
          <ScreenControls 
            selectedScreen={selectedScreen}
            onUpdateScreen={handleUpdateScreen}
          />
        </div>

        <div className="lg:col-span-5">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Telas Ativas</h2>
              <Button 
                onClick={addNewScreen}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Nova Tela
              </Button>
            </div>
            <ScreenGrid 
              screens={screens} 
              onScreenSelect={handleScreenSelect} 
              onDrop={handleMediaDrop}
              onRemoveScreen={handleRemoveScreen}
            />
          </div>
        </div>

        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold p-4">Galeria de Mídia</h2>
            <MediaGallery items={mediaItems} onSelect={handleMediaSelect} />
          </div>
          <div className="bg-white rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold p-4">Upload</h2>
            <FileUpload onUploadComplete={loadMediaItems} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;