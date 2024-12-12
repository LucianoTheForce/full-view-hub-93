import React from "react";
import { Card } from "@/components/ui/card";
import { Play, Image as ImageIcon } from "lucide-react";

interface MediaItem {
  id: string;
  type: "video" | "image";
  url: string;
  title: string;
}

interface MediaGalleryProps {
  items: MediaItem[];
  onSelect: (item: MediaItem) => void;
}

export const MediaGallery: React.FC<MediaGalleryProps> = ({ items, onSelect }) => {
  const handleDragStart = (e: React.DragEvent, item: MediaItem) => {
    e.dataTransfer.setData("application/json", JSON.stringify(item));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 p-4">
      {items.map((item) => (
        <Card
          key={item.id}
          className="group relative overflow-hidden cursor-move hover:ring-2 hover:ring-media-hover transition-all duration-200"
          onClick={() => onSelect(item)}
          draggable
          onDragStart={(e) => handleDragStart(e, item)}
        >
          <div className="aspect-video relative">
            {item.type === "video" ? (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 group-hover:bg-black/60 transition-colors">
                <Play className="w-12 h-12 text-white opacity-75 group-hover:opacity-100 transition-opacity" />
              </div>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 group-hover:bg-black/60 transition-colors">
                <ImageIcon className="w-12 h-12 text-white opacity-75 group-hover:opacity-100 transition-opacity" />
              </div>
            )}
            <img
              src={item.type === "video" ? `${item.url}#t=0.1` : item.url}
              alt={item.title}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="p-3">
            <h3 className="font-medium text-sm truncate">{item.title}</h3>
            <p className="text-xs text-muted-foreground">
              {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
            </p>
          </div>
        </Card>
      ))}
    </div>
  );
};