import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type MediaItem = Database["public"]["Tables"]["media_items"]["Row"] & {
  url: string;
};

export const useMediaItems = () => {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadMediaItems = async () => {
    setIsLoading(true);
    try {
      const { data: items, error } = await supabase
        .from("media_items")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const itemsWithUrls = await Promise.all(
        (items || []).map(async (item) => {
          const { data: { publicUrl } } = supabase.storage
            .from("media")
            .getPublicUrl(item.file_path);

          return {
            ...item,
            url: publicUrl,
          };
        })
      );

      setMediaItems(itemsWithUrls);
    } catch (error) {
      console.error("Error loading media items:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteMediaItem = async (itemId: string) => {
    const item = mediaItems.find((i) => i.id === itemId);
    if (!item) return;

    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from("media")
        .remove([item.file_path]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from("media_items")
        .delete()
        .eq("id", itemId);

      if (dbError) throw dbError;

      // Update local state
      setMediaItems((prev) => prev.filter((i) => i.id !== itemId));
    } catch (error) {
      console.error("Error deleting media item:", error);
      throw error;
    }
  };

  useEffect(() => {
    loadMediaItems();
  }, []);

  return {
    mediaItems,
    isLoading,
    loadMediaItems,
    deleteMediaItem,
  };
};