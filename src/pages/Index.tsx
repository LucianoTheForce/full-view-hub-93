import React, { useState, useEffect } from "react";
import { MediaGallery } from "@/components/MediaGallery";
import { ScreenGrid } from "@/components/ScreenGrid";
import { FileUpload } from "@/components/FileUpload";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface MediaItem {
  id: string;
  type: "video" | "image";
  url: string;
  title: string;
  file_path: string;
}

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

const Index = () => {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [screens, setScreens] = useState<Screen[]>([
    { id: "screen1", name: "Tela 1", isActive: true },
    { id: "screen2", name: "Tela 2", isActive: false },
    { id: "screen3", name: "Tela 3", isActive: true },
  ]);

  useEffect(() => {
    loadMediaItems();
    subscribeToScreenUpdates();
  }, []);

  const subscribeToScreenUpdates = () => {
    const channel = supabase.channel('screens')
      .on('broadcast', { event: 'screen_update' }, ({ payload }) => {
        setScreens(currentScreens => 
          currentScreens.map(screen => 
            screen.id === payload.screenId 
              ? { ...screen, currentContent: payload.content }
              : screen
          )
        );
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const loadMediaItems = async () => {
    const { data, error } = await supabase
      .from("media_items")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erro ao carregar mídia:", error);
      toast.error("Não foi possível carregar os itens de mídia.");
      return;
    }

    const itemsWithUrls = await Promise.all(
      data.map(async (item) => {
        const { data: publicUrl } = supabase.storage
          .from("media")
          .getPublicUrl(item.file_path);

        // Validate and cast the type to either "video" or "image"
        const validatedType = item.type === "video" || item.type === "image" 
          ? item.type as "video" | "image"
          : "image"; // Default to image if type is invalid

        return {
          id: item.id,
          title: item.title,
          type: validatedType,
          file_path: item.file_path,
          url: publicUrl.publicUrl,
        };
      })
    );

    setMediaItems(itemsWithUrls);
  };

  const handleMediaDrop = async (mediaItem: MediaItem, screenId: string) => {
    setScreens(currentScreens =>
      currentScreens.map(screen =>
        screen.id === screenId
          ? {
              ...screen,
              currentContent: {
                type: mediaItem.type,
                title: mediaItem.title,
                url: mediaItem.url,
              },
            }
          : screen
      )
    );

    await supabase.channel('screens').send({
      type: 'broadcast',
      event: 'screen_update',
      payload: {
        screenId,
        content: {
          type: mediaItem.type,
          title: mediaItem.title,
          url: mediaItem.url,
        },
      },
    });

    toast.success(`Conteúdo atualizado na ${screens.find(s => s.id === screenId)?.name}`);
  };

  const handleUploadComplete = () => {
    loadMediaItems();
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Central de Controle</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 bg-white rounded-lg shadow-sm p-4">
          <h2 className="text-xl font-semibold mb-4">Telas Ativas</h2>
          <ScreenGrid 
            screens={screens} 
            onScreenSelect={() => {}} 
            onDrop={handleMediaDrop}
          />
        </div>

        <div className="lg:col-span-5 bg-white rounded-lg shadow-sm p-4">
          <h2 className="text-xl font-semibold mb-4">Galeria de Mídia</h2>
          <MediaGallery items={mediaItems} onSelect={() => {}} />
        </div>

        <div className="lg:col-span-3 bg-white rounded-lg shadow-sm p-4">
          <h2 className="text-xl font-semibold mb-4">Upload</h2>
          <FileUpload onUploadComplete={handleUploadComplete} />
        </div>
      </div>
    </div>
  );
};

export default Index;