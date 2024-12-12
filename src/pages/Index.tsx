import React, { useState } from "react";
import { MediaGallery } from "@/components/MediaGallery";
import { ScreenGrid } from "@/components/ScreenGrid";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";

// Dados de exemplo
const MOCK_MEDIA = [
  {
    id: "1",
    type: "image" as const,
    url: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d",
    title: "Workspace Setup",
  },
  {
    id: "2",
    type: "image" as const,
    url: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b",
    title: "Tech Display",
  },
  {
    id: "3",
    type: "image" as const,
    url: "https://images.unsplash.com/photo-1518770660439-4636190af475",
    title: "Circuit Board",
  },
];

const MOCK_SCREENS = [
  { id: "screen1", name: "Tela 1", isActive: true },
  { id: "screen2", name: "Tela 2", isActive: false },
  { id: "screen3", name: "Tela 3", isActive: true },
];

const Index = () => {
  const [selectedScreen, setSelectedScreen] = useState<string | null>(null);

  const handleMediaSelect = (media: { id: string; title: string }) => {
    if (!selectedScreen) {
      toast({
        title: "Selecione uma tela",
        description: "Por favor, selecione uma tela antes de escolher o conteúdo.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Conteúdo atribuído",
      description: `${media.title} foi atribuído à tela selecionada.`,
    });
  };

  const handleScreenSelect = (screen: { id: string }) => {
    setSelectedScreen(screen.id);
    toast({
      title: "Tela selecionada",
      description: "Agora selecione o conteúdo que deseja exibir.",
    });
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Central de Controle</h1>
      
      <Tabs defaultValue="screens" className="space-y-4">
        <TabsList>
          <TabsTrigger value="screens">Telas Ativas</TabsTrigger>
          <TabsTrigger value="media">Galeria de Mídia</TabsTrigger>
        </TabsList>
        
        <TabsContent value="screens" className="space-y-4">
          <h2 className="text-xl font-semibold mb-4">Telas Disponíveis</h2>
          <ScreenGrid screens={MOCK_SCREENS} onScreenSelect={handleScreenSelect} />
        </TabsContent>
        
        <TabsContent value="media" className="space-y-4">
          <h2 className="text-xl font-semibold mb-4">Conteúdo Disponível</h2>
          <MediaGallery items={MOCK_MEDIA} onSelect={handleMediaSelect} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Index;