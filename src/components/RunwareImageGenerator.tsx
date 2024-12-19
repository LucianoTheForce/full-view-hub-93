import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wand2 } from "lucide-react";
import { toast } from "sonner";
import { RunwareService, GenerateImageParams } from "@/services/runware";
import { supabase } from "@/integrations/supabase/client";
import { RunwarePromptInput } from "./runware/RunwarePromptInput";
import { RunwareModelSettings } from "./runware/RunwareModelSettings";

interface RunwareImageGeneratorProps {
  onImageGenerated: (imageUrl: string) => void;
}

export const RunwareImageGenerator: React.FC<RunwareImageGeneratorProps> = ({
  onImageGenerated,
}) => {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [model, setModel] = useState("runware:100@1");
  const [numberResults, setNumberResults] = useState(1);
  const [outputFormat, setOutputFormat] = useState<"WEBP" | "PNG" | "JPEG">("WEBP");
  // Increased CFG Scale for better prompt adherence
  const [cfgScale, setCfgScale] = useState(13);
  const [scheduler, setScheduler] = useState("FlowMatchEulerDiscreteScheduler");
  // Increased strength for more stable results
  const [strength, setStrength] = useState(1);
  const [promptWeighting, setPromptWeighting] = useState<"compel" | "sdEmbeds" | null>(null);
  const [seed, setSeed] = useState<string>("");

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
        model,
        numberResults,
        outputFormat,
        CFGScale: cfgScale,
        scheduler,
        strength,
        seed: seed ? Number(seed) : null,
        lora: [],
      };

      // Only include promptWeighting if it's supported by the model
      if (model !== "runware:100@1" && promptWeighting) {
        params.promptWeighting = promptWeighting;
      }

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
    <Card className="p-4 space-y-4">
      <h3 className="text-lg font-semibold">Gerar Imagem com IA</h3>
      
      <div className="space-y-4">
        <RunwarePromptInput
          prompt={prompt}
          setPrompt={setPrompt}
          isGenerating={isGenerating}
        />

        <RunwareModelSettings
          model={model}
          setModel={setModel}
          numberResults={numberResults}
          setNumberResults={setNumberResults}
          outputFormat={outputFormat}
          setOutputFormat={setOutputFormat}
          cfgScale={cfgScale}
          setCfgScale={setCfgScale}
          scheduler={scheduler}
          setScheduler={setScheduler}
          strength={strength}
          setStrength={setStrength}
          promptWeighting={promptWeighting}
          setPromptWeighting={setPromptWeighting}
          seed={seed}
          setSeed={setSeed}
          isGenerating={isGenerating}
        />

        <Button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full flex items-center gap-2"
        >
          <Wand2 className="w-4 h-4" />
          {isGenerating ? "Gerando..." : "Gerar"}
        </Button>
      </div>
    </Card>
  );
};