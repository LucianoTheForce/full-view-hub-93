import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const Display = () => {
  const { screenId } = useParams();
  const navigate = useNavigate();
  const [content, setContent] = useState<{
    type: "video" | "image";
    url: string;
    title: string;
  } | null>(null);

  useEffect(() => {
    const loadScreenContent = async () => {
      // Subscribe to screen updates
      const channel = supabase.channel('screens')
        .on('broadcast', { event: 'screen_update' }, ({ payload }) => {
          if (payload.screenId === screenId) {
            setContent(payload.content);
          }
        })
        .subscribe();

      // Initial content load
      const screens = JSON.parse(localStorage.getItem('screens') || '[]');
      const currentScreen = screens.find((s: any) => s.id === screenId);
      if (currentScreen?.currentContent) {
        setContent(currentScreen.currentContent);
      }

      return () => {
        supabase.removeChannel(channel);
      };
    };

    loadScreenContent();
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
    <div className="relative w-screen h-screen bg-black">
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 left-4 text-white hover:bg-white/10"
        onClick={() => navigate('/')}
      >
        <ArrowLeft className="h-6 w-6" />
      </Button>
      
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