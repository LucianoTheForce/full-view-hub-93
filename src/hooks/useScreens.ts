import { useState } from "react";

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

export const useScreens = () => {
  const [screens, setScreens] = useState<Screen[]>([]);
  const [selectedScreen, setSelectedScreen] = useState<Screen | null>(null);

  const handleScreenSelect = (screen: Screen) => {
    setSelectedScreen(screen);
  };

  const handleUpdateScreen = (updatedScreen: Screen) => {
    setScreens(prevScreens =>
      prevScreens.map(screen =>
        screen.id === updatedScreen.id ? updatedScreen : screen
      )
    );
    setSelectedScreen(updatedScreen);
  };

  const handleMediaDrop = (mediaItem: any, screenId: string) => {
    setScreens(prevScreens =>
      prevScreens.map(screen =>
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