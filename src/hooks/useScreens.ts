import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

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

export const useScreens = () => {
  const [screens, setScreens] = useState<Screen[]>(() => {
    const savedScreens = localStorage.getItem('screens');
    return savedScreens ? JSON.parse(savedScreens) : [
      { id: "screen1", name: "Tela 1", isActive: true },
      { id: "screen2", name: "Tela 2", isActive: true },
      { id: "screen3", name: "Tela 3", isActive: true },
    ];
  });
  const [selectedScreen, setSelectedScreen] = useState<Screen | null>(null);

  useEffect(() => {
    localStorage.setItem('screens', JSON.stringify(screens));
  }, [screens]);

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

  const handleMediaDrop = async (mediaItem: any, screenId: string) => {
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
      const response = await channel.send({
        type: 'broadcast',
        event: 'content_update',
        payload: {
          screenId,
          content: newContent,
        },
      });

      if (response === 'ok') {
        toast.success(`Conteúdo atualizado na ${screens.find(s => s.id === screenId)?.name}`);
      }

      await channel.unsubscribe();
    } catch (error) {
      console.error('Error broadcasting update:', error);
      toast.error('Erro ao atualizar o conteúdo. Tente novamente.');
    }
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

  return {
    screens,
    selectedScreen,
    handleScreenSelect,
    handleUpdateScreen,
    handleMediaDrop,
    handleRemoveScreen,
    addNewScreen,
  };
};