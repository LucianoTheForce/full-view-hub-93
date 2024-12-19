import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface RunwarePromptInputProps {
  prompt: string;
  setPrompt: (value: string) => void;
  isGenerating: boolean;
}

export const RunwarePromptInput: React.FC<RunwarePromptInputProps> = ({
  prompt,
  setPrompt,
  isGenerating,
}) => {
  return (
    <div className="space-y-2">
      <Label>Prompt</Label>
      <Input
        placeholder="Digite um prompt para gerar uma imagem..."
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        disabled={isGenerating}
      />
    </div>
  );
};