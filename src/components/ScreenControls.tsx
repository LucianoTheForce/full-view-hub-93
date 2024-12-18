import React from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { RotateCw, Maximize2, Palette } from "lucide-react";

interface ScreenControlsProps {
  selectedScreen: {
    id: string;
    name: string;
    isActive: boolean;
    currentContent?: {
      type: "video" | "image";
      title: string;
      url: string;
      rotation?: number;
      scale?: number;
      backgroundColor?: string;
    };
  } | null;
  onUpdateScreen: (screenId: string, updates: any) => void;
}

export const ScreenControls: React.FC<ScreenControlsProps> = ({
  selectedScreen,
  onUpdateScreen,
}) => {
  if (!selectedScreen) {
    return (
      <Card className="p-4">
        <p className="text-center text-muted-foreground">
          Selecione uma tela para ajustar seu conteúdo
        </p>
      </Card>
    );
  }

  const handleRotationChange = (value: number[]) => {
    onUpdateScreen(selectedScreen.id, {
      rotation: value[0],
    });
  };

  const handleScaleChange = (value: number[]) => {
    onUpdateScreen(selectedScreen.id, {
      scale: value[0],
    });
  };

  const handleBackgroundChange = (value: string) => {
    onUpdateScreen(selectedScreen.id, {
      backgroundColor: value,
    });
  };

  return (
    <Card className="p-4 space-y-6">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <RotateCw className="w-4 h-4" />
          <Label>Rotação</Label>
        </div>
        <Slider
          defaultValue={[selectedScreen.currentContent?.rotation || 0]}
          max={360}
          step={1}
          onValueChange={handleRotationChange}
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Maximize2 className="w-4 h-4" />
          <Label>Tamanho</Label>
        </div>
        <Slider
          defaultValue={[selectedScreen.currentContent?.scale || 1]}
          min={0.5}
          max={2}
          step={0.1}
          onValueChange={handleScaleChange}
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Palette className="w-4 h-4" />
          <Label>Cor de Fundo</Label>
        </div>
        <RadioGroup
          defaultValue={selectedScreen.currentContent?.backgroundColor || "black"}
          onValueChange={handleBackgroundChange}
          className="grid grid-cols-3 gap-2"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="black" id="black" />
            <Label htmlFor="black">Preto</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="#1A1F2C" id="dark" />
            <Label htmlFor="dark">Escuro</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="#8E9196" id="gray" />
            <Label htmlFor="gray">Cinza</Label>
          </div>
        </RadioGroup>
      </div>
    </Card>
  );
};