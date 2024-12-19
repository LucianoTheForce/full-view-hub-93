import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wand2, Save } from "lucide-react";
import { toast } from "sonner";
import { RunwareService, GenerateImageParams, GeneratedImage } from "@/services/runware";
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
  const [cfgScale, setCfgScale] = useState(1); // Default CFG value for Flux
  const [guidance, setGuidance] = useState(3.5); // Default Guidance value for Flux
  const [scheduler, setScheduler] = useState("FlowMatchEulerDiscreteScheduler");
  const [strength, setStrength] = useState(1);
  const [promptWeighting, setPromptWeighting] = useState<"compel" | "sdEmbeds" | null>(null);
  const [seed, setSeed] = useState<string>("");
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);

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
        guidance,
        scheduler,
        strength,
        seed: seed ? Number(seed) : null,
        lora: [],
      };

      if (model !== "runware:100@1" && promptWeighting) {
        params.promptWeighting = promptWeighting;
      }

      console.log("Generating images with params:", params);
      const result = await runwareService.generateImage(params);
      console.log("Generated images result:", result);
      
      setGeneratedImages(result);
      result.forEach((image: GeneratedImage) => {
        if (image.imageURL) {
          onImageGenerated(image.imageURL);
        }
      });
      
      toast.success(`${result.length} ${result.length === 1 ? 'imagem gerada' : 'imagens geradas'} com sucesso!`);
    } catch (error) {
      console.error("Erro ao gerar imagem:", error);
      toast.error("Erro ao gerar imagem. Tente novamente.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveToGallery = async (image: GeneratedImage) => {
    try {
      // Download the image
      const response = await fetch(image.imageURL);
      const blob = await response.blob();
      const file = new File([blob], `ai-image-${Date.now()}.${outputFormat.toLowerCase()}`, { type: `image/${outputFormat.toLowerCase()}` });
      
      // Upload to Supabase Storage
      const filePath = `ai-generated/${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Create media item record
      const { error: insertError } = await supabase
        .from('media_items')
        .insert({
          title: "Imagem Gerada por IA",
          type: "image",
          file_path: filePath,
          file_size: file.size,
        });

      if (insertError) throw insertError;

      toast.success("Imagem salva na galeria com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar imagem na galeria:", error);
      toast.error("Erro ao salvar imagem na galeria. Tente novamente.");
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
          guidance={guidance}
          setGuidance={setGuidance}
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

        {generatedImages.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Imagens Geradas</h4>
            <div className="grid grid-cols-2 gap-2">
              {generatedImages.map((image, index) => (
                <div key={index} className="relative group">
                  <img
                    src={image.imageURL}
                    alt={`Imagem gerada ${index + 1}`}
                    className="w-full aspect-square object-cover rounded-lg"
                  />
                  <Button
                    variant="secondary"
                    size="sm"
                    className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleSaveToGallery(image)}
                  >
                    <Save className="w-4 h-4 mr-1" />
                    Salvar na Galeria
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};