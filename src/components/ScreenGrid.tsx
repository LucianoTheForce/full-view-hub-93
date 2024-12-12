import React from "react";
import { Card } from "@/components/ui/card";
import { Monitor, Play, Image as ImageIcon } from "lucide-react";

interface Screen {
  id: string;
  name: string;
  isActive: boolean;
  currentContent?: {
    type: "video" | "image";
    title: string;
    url: string;
  };
}

interface ScreenGridProps {
  screens: Screen[];
  onScreenSelect: (screen: Screen) => void;
  onDrop: (mediaItem: any, screenId: string) => void;
}

export const ScreenGrid: React.FC<ScreenGridProps> = ({ screens, onScreenSelect, onDrop }) => {
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, screenId: string) => {
    e.preventDefault();
    const mediaItem = JSON.parse(e.dataTransfer.getData("application/json"));
    onDrop(mediaItem, screenId);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
      {screens.map((screen) => (
        <Card
          key={screen.id}
          className={`cursor-pointer transition-all duration-200 ${
            screen.isActive ? "ring-2 ring-media-active" : ""
          } hover:shadow-lg`}
          onClick={() => onScreenSelect(screen)}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, screen.id)}
        >
          <div className="p-4">
            <div className="flex items-center justify-center mb-3">
              {screen.currentContent ? (
                <div className="relative w-full aspect-video">
                  <img
                    src={screen.currentContent.url}
                    alt={screen.currentContent.title}
                    className="w-full h-full object-cover rounded"
                  />
                  {screen.currentContent.type === "video" && (
                    <Play className="absolute top-2 right-2 w-6 h-6 text-white bg-black/50 rounded-full p-1" />
                  )}
                </div>
              ) : (
                <Monitor
                  className={`w-16 h-16 ${
                    screen.isActive ? "text-media-active" : "text-media-inactive"
                  }`}
                />
              )}
            </div>
            <h3 className="text-center font-medium text-sm mb-1">{screen.name}</h3>
            {screen.currentContent && (
              <p className="text-xs text-center text-muted-foreground">
                {screen.currentContent.title}
              </p>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
};