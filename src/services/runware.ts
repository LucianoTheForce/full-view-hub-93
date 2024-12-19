import { toast } from "sonner";

const API_ENDPOINT = "wss://ws-api.runware.ai/v1";

export interface GenerateImageParams {
  positivePrompt: string;
  model?: string;
  numberResults?: number;
  outputFormat?: string;
  CFGScale?: number;
  guidance?: number;
  scheduler?: string;
  strength?: number;
  promptWeighting?: "compel" | "sdEmbeds";
  seed?: number | null;
  lora?: string[];
}

export interface GeneratedImage {
  imageURL: string;
  positivePrompt: string;
  seed: number;
  NSFWContent: boolean;
}

export class RunwareService {
  private ws: WebSocket | null = null;
  private apiKey: string | null = null;
  private connectionSessionUUID: string | null = null;
  private messageCallbacks: Map<string, (data: GeneratedImage[]) => void> = new Map();
  private isAuthenticated: boolean = false;
  private connectionPromise: Promise<void> | null = null;
  private receivedImages: Map<string, GeneratedImage[]> = new Map();
  private expectedResults: Map<string, number> = new Map();

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.connectionPromise = this.connect();
  }

  private connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(API_ENDPOINT);
      
      this.ws.onopen = () => {
        console.log("WebSocket connected");
        this.authenticate().then(resolve).catch(reject);
      };

      this.ws.onmessage = (event) => {
        console.log("WebSocket message received:", event.data);
        const response = JSON.parse(event.data);
        
        if (response.error || response.errors) {
          console.error("WebSocket error response:", response);
          const errorMessage = response.errorMessage || response.errors?.[0]?.message || "An error occurred";
          toast.error(errorMessage);
          return;
        }

        if (response.data) {
          response.data.forEach((item: any) => {
            if (item.taskType === "authentication") {
              console.log("Authentication successful, session UUID:", item.connectionSessionUUID);
              this.connectionSessionUUID = item.connectionSessionUUID;
              this.isAuthenticated = true;
            } else if (item.taskType === "imageInference") {
              const taskUUID = item.taskUUID;
              const currentImages = this.receivedImages.get(taskUUID) || [];
              const newImage: GeneratedImage = {
                imageURL: item.imageURL,
                positivePrompt: item.positivePrompt,
                seed: item.seed,
                NSFWContent: item.NSFWContent,
              };
              
              currentImages.push(newImage);
              this.receivedImages.set(taskUUID, currentImages);
              
              const callback = this.messageCallbacks.get(taskUUID);
              const expectedCount = this.expectedResults.get(taskUUID) || 1;
              
              console.log(`Received image ${currentImages.length} of ${expectedCount} for task ${taskUUID}`);
              
              if (callback && currentImages.length === expectedCount) {
                console.log(`All ${expectedCount} images received for task ${taskUUID}, calling callback`);
                callback(currentImages);
                this.messageCallbacks.delete(taskUUID);
                this.receivedImages.delete(taskUUID);
                this.expectedResults.delete(taskUUID);
              }
            }
          });
        }
      };

      this.ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        toast.error("Connection error. Please try again.");
        reject(error);
      };

      this.ws.onclose = () => {
        console.log("WebSocket closed, attempting to reconnect...");
        this.isAuthenticated = false;
        setTimeout(() => {
          this.connectionPromise = this.connect();
        }, 1000);
      };
    });
  }

  private authenticate(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
        reject(new Error("WebSocket not ready for authentication"));
        return;
      }
      
      const authMessage = [{
        taskType: "authentication",
        apiKey: this.apiKey,
        ...(this.connectionSessionUUID && { connectionSessionUUID: this.connectionSessionUUID }),
      }];
      
      console.log("Sending authentication message");
      
      // Set up a one-time authentication callback
      const authCallback = (event: MessageEvent) => {
        const response = JSON.parse(event.data);
        if (response.data?.[0]?.taskType === "authentication") {
          this.ws?.removeEventListener("message", authCallback);
          resolve();
        }
      };
      
      this.ws.addEventListener("message", authCallback);
      this.ws.send(JSON.stringify(authMessage));
    });
  }

  async generateImage(params: GenerateImageParams): Promise<GeneratedImage[]> {
    await this.connectionPromise;

    if (!this.ws || this.ws.readyState !== WebSocket.OPEN || !this.isAuthenticated) {
      this.connectionPromise = this.connect();
      await this.connectionPromise;
    }

    const taskUUID = crypto.randomUUID();
    const numberResults = params.numberResults || 1;
    
    return new Promise((resolve, reject) => {
      const message = [{
        taskType: "imageInference",
        taskUUID,
        model: params.model || "runware:100@1",
        width: 1024,
        height: 1024,
        numberResults,
        outputFormat: params.outputFormat || "WEBP",
        steps: 4,
        CFGScale: params.CFGScale || 1,
        guidance: params.guidance || 3.5,
        scheduler: params.scheduler || "FlowMatchEulerDiscreteScheduler",
        strength: params.strength || 1,
        lora: params.lora || [],
        expectedResults: numberResults,
        ...params,
      }];

      if (!params.seed) {
        delete message[0].seed;
      }

      if (message[0].model === "runware:100@1") {
        delete message[0].promptWeighting;
      }

      console.log("Sending image generation message:", message);

      // Store the expected number of results
      this.expectedResults.set(taskUUID, numberResults);

      // Initialize the images array for this task
      this.receivedImages.set(taskUUID, []);

      this.messageCallbacks.set(taskUUID, (images) => {
        console.log(`Resolving promise with ${images.length} images`);
        resolve(images);
      });

      this.ws.send(JSON.stringify(message));

      // Add timeout to prevent hanging
      setTimeout(() => {
        const receivedImages = this.receivedImages.get(taskUUID) || [];
        if (receivedImages.length > 0 && receivedImages.length < numberResults) {
          console.log(`Timeout reached with ${receivedImages.length} images, resolving anyway`);
          resolve(receivedImages);
          this.messageCallbacks.delete(taskUUID);
          this.receivedImages.delete(taskUUID);
          this.expectedResults.delete(taskUUID);
        } else if (receivedImages.length === 0) {
          reject(new Error("Timeout: No images received"));
          this.messageCallbacks.delete(taskUUID);
          this.receivedImages.delete(taskUUID);
          this.expectedResults.delete(taskUUID);
        }
      }, 30000); // 30 second timeout
    });
  }
}