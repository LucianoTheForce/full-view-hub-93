import { useState } from "react";
import type { Database } from "@/integrations/supabase/types";

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
    rotation?: number;
    scale?: number;
    backgroundColor?: string;
  };
}

export const useScreens = () => {
  const [screens, setScreens] = useState<Screen[]>([]);
  const [selectedScreen, setSelectedScreen] = useState<Screen | null>(null);

  const handleScreenSelect = (screen: Screen) => {
    setSelectedScreen(screen);
  };

  const handleUpdateScreen = (screenId: string, updates: Partial<Screen['currentContent']>) => {
    setScreens(prevScreens =>
      prevScreens.map(screen =>
        screen.id === screenId
          ? {
              ...screen,
              currentContent: {
                ...(screen.currentContent || {}),
                ...updates
              },
            }
          : screen
      )
    );

    // Update selected screen if it's the one being modified
    if (selectedScreen?.id === screenId) {
      setSelectedScreen(prev => prev ? {
        ...prev,
        currentContent: {
          ...(prev.currentContent || {}),
          ...updates
        }
      } : null);
    }
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

    setScreens(prevScreens =>
      prevScreens.map(screen =>
        screen.id === screenId
          ? {
              ...screen,
              currentContent: newContent,
            }
          : screen
      )
    );

    // Update selected screen if it's the one receiving media
    if (selectedScreen?.id === screenId) {
      setSelectedScreen(prev => prev ? {
        ...prev,
        currentContent: newContent
      } : null);
    }
  };

  const handleRemoveScreen = (screenId: string) => {
    setScreens(prevScreens => prevScreens.filter(screen => screen.id !== screenId));
    if (selectedScreen?.id === screenId) {
      setSelectedScreen(null);
    }
  };

  const addNewScreen = () => {
    const newScreen: Screen = {
      id: crypto.randomUUID(),
      name: `Tela ${screens.length + 1}`,
      isActive: true,
    };
    setScreens(prevScreens => [...prevScreens, newScreen]);
  };

  const resetScreens = (newScreens: Screen[] = []) => {
    setScreens(newScreens);
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