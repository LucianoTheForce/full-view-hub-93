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
    if (gridSize <= 2) return "grid-cols-1 sm:grid-cols-2";
    if (gridSize === 3) return "grid-cols-2 sm:grid-cols-3";
    if (gridSize === 4) return "grid-cols-2 sm:grid-cols-4";
    if (gridSize === 5) return "grid-cols-3 sm:grid-cols-5";
    return "grid-cols-3 sm:grid-cols-6";
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-4 px-4 py-3 border-b">
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
      
      <div className={`grid ${getGridColumns()} gap-4 p-4 overflow-y-auto flex-1`}>
        {items.map((item) => (
          <Card
            key={item.id}
            className="group relative overflow-hidden cursor-move hover:ring-2 hover:ring-media-hover transition-all duration-200 aspect-square"
            onClick={() => onSelect(item)}
            draggable
            onDragStart={(e) => handleDragStart(e, item)}
          >
            <img
              src={item.type === "video" ? `${item.url}#t=0.1` : item.url}
              alt={item.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-200">
              <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                <p className="text-sm font-medium truncate">{item.title}</p>
                <p className="text-xs opacity-75">
                  {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};