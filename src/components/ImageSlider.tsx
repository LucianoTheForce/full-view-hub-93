import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface ImageSliderProps {
  images: string[];
  onSelect: (imageUrl: string) => void;
}

export const ImageSlider: React.FC<ImageSliderProps> = ({ images, onSelect }) => {
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  
  if (images.length === 0) return null;

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, imageUrl: string) => {
    const mediaItem = {
      type: "image",
      title: "Imagem Gerada por IA",
      url: imageUrl
    };
    e.dataTransfer.setData("application/json", JSON.stringify(mediaItem));
    
    // Create a drag preview image
    const img = new Image();
    img.src = imageUrl;
    e.dataTransfer.setDragImage(img, 10, 10);
  };

  const handleImageClick = (imageUrl: string) => {
    setFullscreenImage(imageUrl);
  };

  const handleFullscreenSelect = () => {
    if (fullscreenImage) {
      onSelect(fullscreenImage);
      setFullscreenImage(null);
    }
  };

  return (
    <>
      <Card className="p-4 space-y-4">
        <h3 className="text-lg font-semibold">Imagens Geradas ({images.length})</h3>
        <Carousel className="w-full">
          <CarouselContent>
            {images.map((imageUrl, index) => (
              <CarouselItem key={index} className="md:basis-1/2">
                <div 
                  className="relative aspect-[4/3] group cursor-move"
                  draggable
                  onDragStart={(e) => handleDragStart(e, imageUrl)}
                >
                  <img
                    src={imageUrl}
                    alt={`Imagem gerada ${index + 1}`}
                    className="w-full h-full object-cover rounded-lg transition-all duration-200 group-hover:brightness-90"
                    onClick={() => handleImageClick(imageUrl)}
                  />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="bg-black/50 text-white px-2 py-1 rounded text-sm">
                      Arraste para uma tela ou clique para ampliar
                    </span>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          {images.length > 1 && (
            <>
              <CarouselPrevious />
              <CarouselNext />
            </>
          )}
        </Carousel>
      </Card>

      <Dialog open={!!fullscreenImage} onOpenChange={() => setFullscreenImage(null)}>
        <DialogContent className="max-w-[90vw] max-h-[90vh] w-full h-full p-0">
          <div className="relative w-full h-full min-h-[80vh] flex flex-col">
            <div className="absolute top-2 right-2 z-10 flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleFullscreenSelect}
                className="bg-white/90 hover:bg-white"
              >
                Selecionar Imagem
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setFullscreenImage(null)}
                className="bg-white/90 hover:bg-white"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            {fullscreenImage && (
              <img
                src={fullscreenImage}
                alt="Imagem em tela cheia"
                className="w-full h-full object-contain p-4"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};