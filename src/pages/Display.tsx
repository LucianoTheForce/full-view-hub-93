import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const Display = () => {
  const { screenId } = useParams();
  const [content, setContent] = useState<{
    type: "video" | "image";
    url: string;
  } | null>(null);

  useEffect(() => {
    // Aqui você implementaria a lógica para buscar o conteúdo atual da tela
    // Por enquanto, vamos usar um conteúdo de exemplo
    setContent({
      type: "image",
      url: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d",
    });
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
        />
      ) : (
        <img src={content.url} alt="" className="w-full h-full object-contain" />
      )}
    </div>
  );
};

export default Display;