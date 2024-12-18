import React, { useState, useEffect } from "react";
import { MediaGallery } from "@/components/MediaGallery";
import { ScreenGrid } from "@/components/ScreenGrid";
import { ScreenControls } from "@/components/ScreenControls";
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
    rotation?: number;
    scale?: number;
    backgroundColor?: string;
  };
}

const Index = () => {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [selectedScreen, setSelectedScreen] = useState<Screen | null>(null);
  const [screens, setScreens] = useState<Screen[]>(() => {
    const savedScreens = localStorage.getItem('screens');
    return savedScreens ? JSON.parse(savedScreens) : [
      { id: "screen1", name: "Tela 1", isActive: true },
      { id: "screen2", name: "Tela 2", isActive: true },
      { id: "screen3", name: "Tela 3", isActive: true },
    ];
  });

  useEffect(() => {
    loadMediaItems();
  }, []);

  useEffect(() => {
    localStorage.setItem('screens', JSON.stringify(screens));
  }, [screens]);

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

        return {
          id: item.id,
          title: item.title,
          type: item.type as "video" | "image",
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
      rotation: 0,
      scale: 1,
      backgroundColor: "black",
    };

    setScreens(currentScreens =>
      currentScreens.map(screen =>
        screen.id === screenId
          ? { ...screen, currentContent: newContent }
          : screen
      )
    );

    try {
      const channel = supabase.channel(`screen_${screenId}`);
      
      const subscriptionStatus = await channel.subscribe();
      console.log(`Channel subscription status for ${screenId}:`, subscriptionStatus);
      
      const response = await channel.send({
        type: 'broadcast',
        event: 'content_update',
        payload: {
          screenId,
          content: newContent,
        },
      });

      console.log('Broadcast response:', response);
      
      if (response === 'ok') {
        toast.success(`Conteúdo atualizado na ${screens.find(s => s.id === screenId)?.name}`);
      } else {
        toast.error('Erro ao atualizar o conteúdo. Tente novamente.');
      }

      await channel.unsubscribe();
    } catch (error) {
      console.error('Error broadcasting update:', error);
      toast.error('Erro ao atualizar o conteúdo. Tente novamente.');
    }
  };

  const handleScreenSelect = (screen: Screen) => {
    setSelectedScreen(screen);
  };

  const handleUpdateScreen = async (screenId: string, updates: any) => {
    const updatedScreens = screens.map(screen => {
      if (screen.id === screenId && screen.currentContent) {
        return {
          ...screen,
          currentContent: {
            ...screen.currentContent,
            ...updates,
          },
        };
      }
      return screen;
    });

    setScreens(updatedScreens);
    setSelectedScreen(updatedScreens.find(s => s.id === screenId) || null);

    try {
      const channel = supabase.channel(`screen_${screenId}`);
      const screen = updatedScreens.find(s => s.id === screenId);
      
      if (screen?.currentContent) {
        const response = await channel.send({
          type: 'broadcast',
          event: 'content_update',
          payload: {
            screenId,
            content: screen.currentContent,
          },
        });

        if (response === 'ok') {
          toast.success(`Ajustes atualizados na ${screen.name}`);
        }
      }

      await channel.unsubscribe();
    } catch (error) {
      console.error('Error updating screen:', error);
      toast.error('Erro ao atualizar os ajustes. Tente novamente.');
    }
  };

  const handleUploadComplete = () => {
    loadMediaItems();
  };

  const addNewScreen = () => {
    const newScreenNumber = screens.length + 1;
    const newScreenId = `screen${newScreenNumber}`;
    
    const screenExists = screens.some(screen => screen.id === newScreenId);
    if (screenExists) {
      toast.error('Esta tela já existe. Tente novamente.');
      return;
    }
    
    const newScreen: Screen = {
      id: newScreenId,
      name: `Tela ${newScreenNumber}`,
      isActive: true,
    };
    
    setScreens(prevScreens => [...prevScreens, newScreen]);
    toast.success(`Tela ${newScreenNumber} adicionada com sucesso!`);
  };

  const handleRemoveScreen = (screenId: string) => {
    const screenToRemove = screens.find(screen => screen.id === screenId);
    if (!screenToRemove) return;

    setScreens(prevScreens => prevScreens.filter(screen => screen.id !== screenId));
    if (selectedScreen?.id === screenId) {
      setSelectedScreen(null);
    }
    toast.success(`${screenToRemove.name} removida com sucesso!`);
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Central de Controle</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-lg shadow-sm p-4">
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
              onScreenSelect={handleScreenSelect} 
              onDrop={handleMediaDrop}
              onRemoveScreen={handleRemoveScreen}
            />
          </div>
          
          <div className="bg-white rounded-lg shadow-sm">
            <ScreenControls 
              selectedScreen={selectedScreen}
              onUpdateScreen={handleUpdateScreen}
            />
          </div>
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