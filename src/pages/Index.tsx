import React, { useState, useEffect } from "react";
import { MediaGallery } from "@/components/MediaGallery";
import { ScreenGrid } from "@/components/ScreenGrid";
import { FileUpload } from "@/components/FileUpload";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

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
  const [screens, setScreens] = useState<Screen[]>(() => {
    const savedScreens = localStorage.getItem('screens');
    return savedScreens ? JSON.parse(savedScreens) : [
      { id: "screen1", name: "Tela 1", isActive: true },
      { id: "screen2", name: "Tela 2", isActive: false },
      { id: "screen3", name: "Tela 3", isActive: true },
    ];
  });

  useEffect(() => {
    loadMediaItems();
    subscribeToScreenUpdates();
  }, []);

  useEffect(() => {
    localStorage.setItem('screens', JSON.stringify(screens));
  }, [screens]);

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

        const validatedType = item.type === "video" || item.type === "image" 
          ? item.type as "video" | "image"
          : "image";

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
    const newContent = {
      type: mediaItem.type,
      title: mediaItem.title,
      url: mediaItem.url,
    };

    setScreens(currentScreens =>
      currentScreens.map(screen =>
        screen.id === screenId
          ? { ...screen, currentContent: newContent }
          : screen
      )
    );

    await supabase.channel('screens').send({
      type: 'broadcast',
      event: 'screen_update',
      payload: {
        screenId,
        content: newContent,
      },
    });

    toast.success(`Conteúdo atualizado na ${screens.find(s => s.id === screenId)?.name}`);
  };

  const handleUploadComplete = () => {
    loadMediaItems();
  };

  const addNewScreen = () => {
    const newScreenNumber = screens.length + 1;
    const newScreen: Screen = {
      id: `screen${Date.now()}`,
      name: `Tela ${newScreenNumber}`,
      isActive: true,
    };
    
    setScreens([...screens, newScreen]);
    toast.success(`Tela ${newScreenNumber} adicionada com sucesso!`);
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Central de Controle</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 bg-white rounded-lg shadow-sm p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Telas Ativas</h2>
            <Button 
              onClick={addNewScreen}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Nova Tela
            </Button>
          </div>
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