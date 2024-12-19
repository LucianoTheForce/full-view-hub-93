import { useState, useEffect } from "react";
import type { Database } from "@/integrations/supabase/types";
import { supabase } from "@/integrations/supabase/client";

type MediaItem = Database["public"]["Tables"]["media_items"]["Row"] & {
  url: string;
};

interface Screen {
  id: string;
  name: string;
  isActive: boolean;
  currentContent?: {
    type: "video" | "image";
    title: string;
    url: string;
    rotation: number;
    scale: number;
    backgroundColor: string;
  };
}

export const useScreens = () => {
  // Carrega o estado inicial do localStorage, convertendo IDs para números simples
  const initialScreens = () => {
    const saved = localStorage.getItem('screens');
    if (!saved) return [];
    const parsedScreens = JSON.parse(saved);
    // Converte os IDs existentes para números sequenciais
    return parsedScreens.map((screen: Screen, index: number) => ({
      ...screen,
      id: String(index + 1)
    }));
  };

  const [screens, setScreens] = useState<Screen[]>(initialScreens);
  const [selectedScreen, setSelectedScreen] = useState<Screen | null>(null);

  // Persiste as mudanças no localStorage sempre que screens mudar
  useEffect(() => {
    localStorage.setItem('screens', JSON.stringify(screens));
  }, [screens]);

  const handleScreenSelect = (screen: Screen) => {
    setSelectedScreen(screen);
  };

  const handleUpdateScreen = (screenId: string, updates: Partial<Screen['currentContent']>) => {
    const updatedScreens = screens.map(screen =>
      screen.id === screenId
        ? {
            ...screen,
            currentContent: screen.currentContent ? {
              ...screen.currentContent,
              ...updates
            } : {
              type: "image" as const,
              title: "",
              url: "",
              rotation: 0,
              scale: 1,
              backgroundColor: "#000000",
              ...updates
            }
          }
        : screen
    );

    setScreens(updatedScreens);

    // Update selected screen if it's the one being modified
    if (selectedScreen?.id === screenId) {
      setSelectedScreen(prev => {
        if (!prev) return null;
        return {
          ...prev,
          currentContent: prev.currentContent ? {
            ...prev.currentContent,
            ...updates
          } : {
            type: "image" as const,
            title: "",
            url: "",
            rotation: 0,
            scale: 1,
            backgroundColor: "#000000",
            ...updates
          }
        };
      });
    }

    // Broadcast the update to the display page
    const channel = supabase.channel(`screen_${screenId}`);
    channel.subscribe().send({
      type: "broadcast",
      event: 'content_update',
      payload: {
        screenId,
        content: updatedScreens.find(s => s.id === screenId)?.currentContent
      }
    });
  };

  const handleMediaDrop = (mediaItem: MediaItem, screenId: string) => {
    const newContent = {
      type: mediaItem.type as "video" | "image",
      title: mediaItem.title,
      url: mediaItem.url,
      rotation: 0,
      scale: 1,
      backgroundColor: "#000000"
    };

    const updatedScreens = screens.map(screen =>
      screen.id === screenId
        ? {
            ...screen,
            currentContent: newContent,
          }
        : screen
    );

    setScreens(updatedScreens);

    // Update selected screen if it's the one receiving media
    if (selectedScreen?.id === screenId) {
      setSelectedScreen(prev => prev ? {
        ...prev,
        currentContent: newContent
      } : null);
    }

    // Broadcast the update to the display page
    const channel = supabase.channel(`screen_${screenId}`);
    channel.subscribe().send({
      type: "broadcast",
      event: 'content_update',
      payload: {
        screenId,
        content: newContent
      }
    });
  };

  const handleRemoveScreen = (screenId: string) => {
    const updatedScreens = screens
      .filter(screen => screen.id !== screenId)
      .map((screen, index) => ({
        ...screen,
        id: String(index + 1),
        name: `Tela ${index + 1}`
      }));
    
    setScreens(updatedScreens);
    
    if (selectedScreen?.id === screenId) {
      setSelectedScreen(null);
    }
  };

  const addNewScreen = () => {
    const newScreen: Screen = {
      id: String(screens.length + 1),
      name: `Tela ${screens.length + 1}`,
      isActive: true,
    };
    const updatedScreens = [...screens, newScreen];
    setScreens(updatedScreens);
  };

  const resetScreens = (newScreens: Screen[] = []) => {
    const screensWithSimpleIds = newScreens.map((screen, index) => ({
      ...screen,
      id: String(index + 1),
      name: `Tela ${index + 1}`
    }));
    setScreens(screensWithSimpleIds);
    setSelectedScreen(null);
  };

  return {
    screens,
    selectedScreen,
    handleScreenSelect,
    handleUpdateScreen,
    handleMediaDrop,
    handleRemoveScreen,
    addNewScreen,
    resetScreens,
  };
};