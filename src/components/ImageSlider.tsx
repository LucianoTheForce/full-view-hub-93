import React from "react";
import { Card } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface ImageSliderProps {
  images: string[];
  onSelect: (imageUrl: string) => void;
}

export const ImageSlider: React.FC<ImageSliderProps> = ({ images, onSelect }) => {
  if (images.length === 0) return null;

  const handleDragStart = (e: React.DragEvent, imageUrl: string) => {
    e.dataTransfer.setData("application/json", JSON.stringify({
      type: "image",
      title: "Imagem Gerada por IA",
      url: imageUrl
    }));
  };

  return (
    <Card className="p-4 space-y-4">
      <h3 className="text-lg font-semibold">Imagens Geradas ({images.length})</h3>
      <Carousel className="w-full">
        <CarouselContent>
          {images.map((imageUrl, index) => (
            <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
              <div className="relative aspect-video group">
                <img
                  src={imageUrl}
                  alt={`Imagem gerada ${index + 1}`}
                  className="w-full h-full object-cover rounded-lg cursor-move transition-all duration-200 group-hover:brightness-90"
                  draggable
                  onDragStart={(e) => handleDragStart(e, imageUrl)}
                  onClick={() => onSelect(imageUrl)}
                />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="bg-black/50 text-white px-2 py-1 rounded text-sm">
                    Clique para usar
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
  );
};