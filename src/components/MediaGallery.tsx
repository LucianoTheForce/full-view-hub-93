import React, { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type MediaItem = Database["public"]["Tables"]["media_items"]["Row"] & {
  url: string;
};

interface MediaGalleryProps {
  items: MediaItem[];
  onSelect: (item: MediaItem) => void;
  onDelete?: (item: MediaItem) => void;
}

export const MediaGallery: React.FC<MediaGalleryProps> = ({ 
  items, 
  onSelect,
  onDelete 
}) => {
  const [gridSize, setGridSize] = useState(4);
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement }>({});
  const { toast } = useToast();

  const handleDragStart = (e: React.DragEvent, item: MediaItem) => {
    e.dataTransfer.setData("application/json", JSON.stringify(item));
  };

  const handleMouseEnter = (itemId: string) => {
    if (videoRefs.current[itemId]) {
      videoRefs.current[itemId].play().catch(() => {
        // Silently handle autoplay errors
      });
    }
  };

  const handleMouseLeave = (itemId: string) => {
    if (videoRefs.current[itemId]) {
      videoRefs.current[itemId].pause();
      videoRefs.current[itemId].currentTime = 0;
    }
  };

  const handleDelete = async (item: MediaItem) => {
    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from("media")
        .remove([item.file_path]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from("media_items")
        .delete()
        .eq("id", item.id);

      if (dbError) throw dbError;

      onDelete?.(item);
      toast({
        title: "Mídia excluída",
        description: "O arquivo foi excluído com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao excluir mídia:", error);
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir o arquivo. Tente novamente.",
        variant: "destructive",
      });
    }
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
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          Tamanho do Grid:
        </span>
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
            onMouseEnter={() => handleMouseEnter(item.id)}
            onMouseLeave={() => handleMouseLeave(item.id)}
          >
            {item.type === "video" ? (
              <video
                ref={(el) => {
                  if (el) videoRefs.current[item.id] = el;
                }}
                src={item.url}
                className="w-full h-full object-cover"
                muted
                loop
                playsInline
              />
            ) : (
              <img
                src={item.url}
                alt={item.title}
                className="w-full h-full object-cover"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-200">
              <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                <p className="text-sm font-medium truncate">{item.title}</p>
                <p className="text-xs opacity-75">
                  {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                </p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 text-white hover:text-red-500"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Excluir mídia</AlertDialogTitle>
                    <AlertDialogDescription>
                      Tem certeza que deseja excluir esta mídia? Esta ação não pode ser desfeita.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(item);
                      }}
                      className="bg-red-500 hover:bg-red-600"
                    >
                      Excluir
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};