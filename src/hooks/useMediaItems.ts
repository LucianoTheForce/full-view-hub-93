import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type MediaItem = Database["public"]["Tables"]["media_items"]["Row"] & {
  url: string;
};

export const useMediaItems = () => {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);

  const loadMediaItems = async () => {
    const { data, error } = await supabase
      .from("media_items")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erro ao carregar mídia:", error);
      toast.error("Não foi possível carregar os itens de mídia.");
      return;
    }

    const itemsWithUrls = await Promise.all(
      (data || []).map(async (item) => {
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

  useEffect(() => {
    loadMediaItems();
  }, []);

  return {
    mediaItems,
    loadMediaItems,
  };
};