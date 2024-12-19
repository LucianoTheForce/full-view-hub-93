import axios from "axios";

export interface GenerateImageParams {
  positivePrompt: string;
  numberResults: number;
}

export class RunwareService {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.baseUrl = "https://api.runware.com/v1/generate"; // Replace with the actual Runware API endpoint
  }

  async generateImage(params: GenerateImageParams): Promise<{ imageURL: string }> {
    const response = await axios.post(this.baseUrl, params, {
      headers: {
        "Authorization": `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
    });

    if (response.status !== 200) {
      throw new Error("Failed to generate image");
    }

    return response.data;
  }
}
