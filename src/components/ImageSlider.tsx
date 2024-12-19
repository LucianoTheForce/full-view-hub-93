import React from "react";
import { Card } from "@/components/ui/card";
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
  if (!images.length) {
    return (
      <Card className="p-4">
        <p className="text-center text-muted-foreground">
          Nenhuma imagem gerada ainda
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <h3 className="text-lg font-semibold mb-4">Imagens Geradas</h3>
      <Carousel className="w-full">
        <CarouselContent>
          {images.map((imageUrl, index) => (
            <CarouselItem key={index} className="basis-1/2 md:basis-1/3">
              <div
                className="aspect-square relative cursor-pointer group"
                onClick={() => onSelect(imageUrl)}
              >
                <img
                  src={imageUrl}
                  alt={`Imagem gerada ${index + 1}`}
                  className="w-full h-full object-cover rounded-lg"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <p className="text-white text-sm">Clique para usar</p>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </Card>
  );
};