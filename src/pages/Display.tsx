import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const Display = () => {
  const { screenId } = useParams();
  const [content, setContent] = useState<{
    type: "video" | "image";
    url: string;
    title: string;
  } | null>(null);

  useEffect(() => {
    const loadScreenContent = async () => {
      // Aqui você pode implementar a lógica para carregar o conteúdo atual da tela do Supabase
      // Por enquanto, vamos usar um conteúdo de exemplo
      setContent({
        type: "image",
        url: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d",
        title: "Conteúdo de exemplo"
      });
    };

    loadScreenContent();

    // Atualiza o título da janela
    document.title = `Tela ${screenId}`;
  }, [screenId]);

  if (!content) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-black">
        <div className="animate-pulse text-white">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen bg-black">
      {content.type === "video" ? (
        <video
          src={content.url}
          className="w-full h-full object-contain"
          autoPlay
          loop
          muted
          playsInline
          controls
        />
      ) : (
        <img 
          src={content.url} 
          alt={content.title} 
          className="w-full h-full object-contain" 
        />
      )}
    </div>
  );
};

export default Display;