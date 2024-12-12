import React, { useState, useEffect } from "react";
import { MediaGallery } from "@/components/MediaGallery";
import { ScreenGrid } from "@/components/ScreenGrid";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { FileUpload } from "@/components/FileUpload";
import { supabase } from "@/integrations/supabase/client";

const MOCK_SCREENS = [
  { id: "screen1", name: "Tela 1", isActive: true },
  { id: "screen2", name: "Tela 2", isActive: false },
  { id: "screen3", name: "Tela 3", isActive: true },
];

const Index = () => {
  const [selectedScreen, setSelectedScreen] = useState<string | null>(null);
  const [mediaItems, setMediaItems] = useState<any[]>([]);

  useEffect(() => {
    loadMediaItems();
  }, []);

  const loadMediaItems = async () => {
    const { data, error } = await supabase
      .from("media_items")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erro ao carregar mídia:", error);
      toast({
        title: "Erro ao carregar mídia",
        description: "Não foi possível carregar os itens de mídia.",
        variant: "destructive",
      });
      return;
    }

    const itemsWithUrls = await Promise.all(
      data.map(async (item) => {
        const { data: publicUrl } = supabase.storage
          .from("media")
          .getPublicUrl(item.file_path);
        return {
          ...item,
          url: publicUrl.publicUrl,
        };
      })
    );

    setMediaItems(itemsWithUrls);
  };

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

  const handleUploadComplete = () => {
    loadMediaItems();
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Central de Controle</h1>
      
      <Tabs defaultValue="screens" className="space-y-4">
        <TabsList>
          <TabsTrigger value="screens">Telas Ativas</TabsTrigger>
          <TabsTrigger value="media">Galeria de Mídia</TabsTrigger>
          <TabsTrigger value="upload">Upload</TabsTrigger>
        </TabsList>
        
        <TabsContent value="screens" className="space-y-4">
          <h2 className="text-xl font-semibold mb-4">Telas Disponíveis</h2>
          <ScreenGrid screens={MOCK_SCREENS} onScreenSelect={handleScreenSelect} />
        </TabsContent>
        
        <TabsContent value="media" className="space-y-4">
          <h2 className="text-xl font-semibold mb-4">Conteúdo Disponível</h2>
          <MediaGallery items={mediaItems} onSelect={handleMediaSelect} />
        </TabsContent>

        <TabsContent value="upload" className="space-y-4">
          <h2 className="text-xl font-semibold mb-4">Upload de Arquivos</h2>
          <FileUpload onUploadComplete={handleUploadComplete} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Index;
