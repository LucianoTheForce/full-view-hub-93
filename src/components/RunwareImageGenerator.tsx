import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Wand2 } from "lucide-react";
import { toast } from "sonner";
import { RunwareService, GenerateImageParams } from "@/services/runware";
import { supabase } from "@/integrations/supabase/client";

interface RunwareImageGeneratorProps {
  onImageGenerated: (imageUrl: string) => void;
}

export const RunwareImageGenerator: React.FC<RunwareImageGeneratorProps> = ({
  onImageGenerated,
}) => {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Por favor, digite um prompt para gerar a imagem");
      return;
    }

    setIsGenerating(true);

    try {
      const { data: { RUNWARE_API_KEY }, error } = await supabase.functions.invoke('get-runware-key');
      
      if (error || !RUNWARE_API_KEY) {
        throw new Error("Não foi possível obter a chave da API do Runware");
      }

      const runwareService = new RunwareService(RUNWARE_API_KEY);
      
      const params: GenerateImageParams = {
        positivePrompt: prompt,
        numberResults: 1,
      };

      const result = await runwareService.generateImage(params);
      onImageGenerated(result.imageURL);
      toast.success("Imagem gerada com sucesso!");
    } catch (error) {
      console.error("Erro ao gerar imagem:", error);
      toast.error("Erro ao gerar imagem. Tente novamente.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="p-4">
      <h3 className="text-lg font-semibold mb-4">Gerar Imagem com IA</h3>
      <div className="flex gap-2">
        <Input
          placeholder="Digite um prompt para gerar uma imagem..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          disabled={isGenerating}
        />
        <Button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="flex items-center gap-2"
        >
          <Wand2 className="w-4 h-4" />
          {isGenerating ? "Gerando..." : "Gerar"}
        </Button>
      </div>
    </Card>
  );
};