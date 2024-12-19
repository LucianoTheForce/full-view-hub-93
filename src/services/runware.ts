import axios from "axios";

interface GeneratedImage {
  imageURL: string;
}

export class RunwareService {
  private static instance: RunwareService;
  private readonly apiKey: string;

  private constructor() {
    this.apiKey = import.meta.env.VITE_RUNWARE_API_KEY || "";
  }

  public static getInstance(): RunwareService {
    if (!RunwareService.instance) {
      RunwareService.instance = new RunwareService();
    }
    return RunwareService.instance;
  }

  async generateImage(prompt: string, numberResults: number = 1): Promise<GeneratedImage[]> {
    console.log(`Generating ${numberResults} images with prompt: ${prompt}`);
    
    try {
      const response = await axios.post(
        "https://api.runware.com/api/image",
        {
          prompt,
          numberResults: Number(numberResults), // Ensure it's a number
          width: 1024,
          height: 1024,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.apiKey}`,
          },
        }
      );

      console.log("API Response:", response.data);

      // Ensure we always return an array of images
      const images = Array.isArray(response.data) ? response.data : [response.data];
      return images.map((img: any) => ({
        imageURL: img.imageURL || img.url
      }));
    } catch (error) {
      console.error("Error generating image:", error);
      throw error;
    }
  }
}