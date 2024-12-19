import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

interface RunwareModelSettingsProps {
  model: string;
  setModel: (value: string) => void;
  numberResults: number;
  setNumberResults: (value: number) => void;
  outputFormat: "WEBP" | "PNG" | "JPEG";
  setOutputFormat: (value: "WEBP" | "PNG" | "JPEG") => void;
  cfgScale: number;
  setCfgScale: (value: number) => void;
  guidance: number;
  setGuidance: (value: number) => void;
  scheduler: string;
  setScheduler: (value: string) => void;
  strength: number;
  setStrength: (value: number) => void;
  promptWeighting: "compel" | "sdEmbeds" | null;
  setPromptWeighting: (value: "compel" | "sdEmbeds" | null) => void;
  seed: string;
  setSeed: (value: string) => void;
  isGenerating: boolean;
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

export const RunwareModelSettings: React.FC<RunwareModelSettingsProps> = ({
  model,
  setModel,
  numberResults,
  setNumberResults,
  outputFormat,
  setOutputFormat,
  cfgScale,
  setCfgScale,
  guidance,
  setGuidance,
  scheduler,
  setScheduler,
  strength,
  setStrength,
  promptWeighting,
  setPromptWeighting,
  seed,
  setSeed,
  isGenerating,
}) => {
  const showPromptWeighting = model !== "runware:100@1";

  return (
    <div className="space-y-4">
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
        <Label>Guidance ({guidance})</Label>
        <Slider
          value={[guidance]}
          min={0}
          max={20}
          step={0.1}
          onValueChange={(value) => setGuidance(value[0])}
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

      {showPromptWeighting && (
        <div className="space-y-2">
          <Label>Prompt Weighting</Label>
          <Select 
            value={promptWeighting || ""} 
            onValueChange={(value: "compel" | "sdEmbeds") => setPromptWeighting(value)}
          >
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
      )}

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
    </div>
  );
};