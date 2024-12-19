import React from "react";
import { Card } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImageSliderProps {
  images: string[];
  onSelect: (imageUrl: string) => void;
}

export const ImageSlider: React.FC<ImageSliderProps> = ({ images, onSelect }) => {
  const [currentIndex, setCurrentIndex] = React.useState(0);

  if (images.length === 0) return null;

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleDragStart = (e: React.DragEvent, imageUrl: string) => {
    e.dataTransfer.setData("application/json", JSON.stringify({
      type: "image",
      title: "Imagem Gerada por IA",
      url: imageUrl
    }));
  };

  return (
    <Card className="p-4 space-y-4">
      <h3 className="text-lg font-semibold">Imagens Geradas</h3>
      <div className="relative aspect-video">
        <img
          src={images[currentIndex]}
          alt={`Imagem gerada ${currentIndex + 1}`}
          className="w-full h-full object-contain cursor-move"
          draggable
          onDragStart={(e) => handleDragStart(e, images[currentIndex])}
          onClick={() => onSelect(images[currentIndex])}
        />
        {images.length > 1 && (
          <>
            <Button
              variant="outline"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2"
              onClick={handlePrevious}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2"
              onClick={handleNext}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>
      <div className="text-center text-sm text-muted-foreground">
        {currentIndex + 1} de {images.length}
      </div>
    </Card>
  );
};