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
      // Initial content load
      const screens = JSON.parse(localStorage.getItem('screens') || '[]');
      const currentScreen = screens.find((s: any) => s.id === screenId);
      if (currentScreen?.currentContent) {
        setContent(currentScreen.currentContent);
      }

      // Subscribe to screen updates with a more specific channel name
      const channel = supabase.channel(`screen_${screenId}`)
        .on('broadcast', { event: 'content_update' }, ({ payload }) => {
          console.log('Received update:', payload);
          setContent(payload.content);
        })
        .subscribe();

      return () => {
        channel.unsubscribe();
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