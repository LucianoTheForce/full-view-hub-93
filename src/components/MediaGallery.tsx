import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import type { Database } from "@/integrations/supabase/types";

type MediaItem = Database["public"]["Tables"]["media_items"]["Row"] & {
  url: string;
};

interface MediaGalleryProps {
  items: MediaItem[];
  onSelect: (item: MediaItem) => void;
}

export const MediaGallery: React.FC<MediaGalleryProps> = ({ items, onSelect }) => {
  const [gridSize, setGridSize] = useState(4);

  const handleDragStart = (e: React.DragEvent, item: MediaItem) => {
    e.dataTransfer.setData("application/json", JSON.stringify(item));
  };

  const getGridColumns = () => {
    if (gridSize <= 2) return "grid-cols-2 md:grid-cols-2 lg:grid-cols-2";
    if (gridSize === 3) return "grid-cols-2 md:grid-cols-2 lg:grid-cols-3";
    if (gridSize === 4) return "grid-cols-2 md:grid-cols-3 lg:grid-cols-4";
    if (gridSize === 5) return "grid-cols-2 md:grid-cols-3 lg:grid-cols-5";
    return "grid-cols-2 md:grid-cols-4 lg:grid-cols-6";
  };

  return (
    <div className="flex flex-col gap-4 p-4 h-[calc(100vh-200px)]">
      <div className="flex items-center gap-4 px-2">
        <span className="text-sm text-muted-foreground whitespace-nowrap">Tamanho do Grid:</span>
        <Slider
          value={[gridSize]}
          onValueChange={(value) => setGridSize(value[0])}
          min={2}
          max={6}
          step={1}
          className="w-48"
        />
        <span className="text-sm text-muted-foreground">{gridSize} colunas</span>
      </div>
      
      <div className={`grid ${getGridColumns()} gap-3 overflow-y-auto flex-grow`}>
        {items.map((item) => (
          <Card
            key={item.id}
            className="group relative overflow-hidden cursor-move hover:ring-2 hover:ring-media-hover transition-all duration-200"
            onClick={() => onSelect(item)}
            draggable
            onDragStart={(e) => handleDragStart(e, item)}
          >
            <div className="aspect-square relative">
              <img
                src={item.type === "video" ? `${item.url}#t=0.1` : item.url}
                alt={item.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <div className="flex flex-col items-center justify-center h-full text-white p-2">
                  <p className="text-sm font-medium text-center">{item.title}</p>
                  <p className="text-xs mt-1">
                    {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};