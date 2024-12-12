import React from "react";
import { Card } from "@/components/ui/card";
import { Monitor } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Screen {
  id: string;
  name: string;
  isActive: boolean;
  currentContent?: {
    type: "video" | "image";
    title: string;
  };
}

interface ScreenGridProps {
  screens: Screen[];
  onScreenSelect: (screen: Screen) => void;
}

export const ScreenGrid: React.FC<ScreenGridProps> = ({ screens, onScreenSelect }) => {
  const handleScreenClick = (screen: Screen) => {
    // Chama o callback original
    onScreenSelect(screen);
    
    // Abre a tela em uma nova janela
    const displayUrl = `/display/${screen.id}`;
    window.open(displayUrl, `screen_${screen.id}`, 'width=1024,height=768');
    
    toast({
      title: "Tela aberta",
      description: `A tela ${screen.name} foi aberta em uma nova janela.`
    });
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
      {screens.map((screen) => (
        <Card
          key={screen.id}
          className={`cursor-pointer transition-all duration-200 ${
            screen.isActive ? "ring-2 ring-media-active" : ""
          } hover:shadow-lg`}
          onClick={() => handleScreenClick(screen)}
        >
          <div className="p-4">
            <div className="flex items-center justify-center mb-3">
              <Monitor
                className={`w-8 h-8 ${
                  screen.isActive ? "text-media-active" : "text-media-inactive"
                }`}
              />
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