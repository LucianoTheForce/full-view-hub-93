import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Wand2 } from "lucide-react";
import { toast } from "sonner";
import { RunwareService, GenerateImageParams } from "@/services/runware";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

interface RunwareImageGeneratorProps {
  onImageGenerated: (imageUrl: string) => void;
}

const schedulers = [
  "FlowMatchEulerDiscreteScheduler",
  "DDIMScheduler",
  "DPMSolverMultistepScheduler",
  "EulerAncestralDiscreteScheduler",
  "EulerDiscreteScheduler",
  "HeunDiscreteScheduler",
  "KDPM2DiscreteScheduler",
  "KDPM2AncestralDiscreteScheduler",
  "PNDMScheduler",
  "UniPCMultistepScheduler"
];

const promptWeightings = ["compel", "sdEmbeds"];

export const RunwareImageGenerator: React.FC<RunwareImageGeneratorProps> = ({
  onImageGenerated,
}) => {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [model, setModel] = useState("runware:100@1");
  const [numberResults, setNumberResults] = useState(1);
  const [outputFormat, setOutputFormat] = useState("WEBP");
  const [cfgScale, setCfgScale] = useState(1);
  const [scheduler, setScheduler] = useState("FlowMatchEulerDiscreteScheduler");
  const [strength, setStrength] = useState(0.8);
  const [promptWeighting, setPromptWeighting] = useState<"compel" | "sdEmbeds">("compel");
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
        promptWeighting,
        seed: seed ? Number(seed) : null,
        lora: [],
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
    <Card className="p-4 space-y-4">
      <h3 className="text-lg font-semibold">Gerar Imagem com IA</h3>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Prompt</Label>
          <Input
            placeholder="Digite um prompt para gerar uma imagem..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={isGenerating}
          />
        </div>

        <div className="space-y-2">
          <Label>Modelo</Label>
          <Input
            value={model}
            onChange={(e) => setModel(e.target.value)}
            disabled={isGenerating}
          />
        </div>

        <div className="space-y-2">
          <Label>Número de Resultados</Label>
          <Input
            type="number"
            min={1}
            max={4}
            value={numberResults}
            onChange={(e) => setNumberResults(Number(e.target.value))}
            disabled={isGenerating}
          />
        </div>

        <div className="space-y-2">
          <Label>Formato de Saída</Label>
          <Select value={outputFormat} onValueChange={setOutputFormat}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="WEBP">WEBP</SelectItem>
              <SelectItem value="PNG">PNG</SelectItem>
              <SelectItem value="JPEG">JPEG</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>CFG Scale ({cfgScale})</Label>
          <Slider
            value={[cfgScale]}
            min={1}
            max={20}
            step={0.1}
            onValueChange={(value) => setCfgScale(value[0])}
            disabled={isGenerating}
          />
        </div>

        <div className="space-y-2">
          <Label>Scheduler</Label>
          <Select value={scheduler} onValueChange={setScheduler}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {schedulers.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Strength ({strength})</Label>
          <Slider
            value={[strength]}
            min={0}
            max={1}
            step={0.1}
            onValueChange={(value) => setStrength(value[0])}
            disabled={isGenerating}
          />
        </div>

        <div className="space-y-2">
          <Label>Prompt Weighting</Label>
          <Select value={promptWeighting} onValueChange={(value: "compel" | "sdEmbeds") => setPromptWeighting(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {promptWeightings.map((pw) => (
                <SelectItem key={pw} value={pw}>
                  {pw}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Seed (opcional)</Label>
          <Input
            type="number"
            value={seed}
            onChange={(e) => setSeed(e.target.value)}
            placeholder="Digite um seed (opcional)"
            disabled={isGenerating}
          />
        </div>

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