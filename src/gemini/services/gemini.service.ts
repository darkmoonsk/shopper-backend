import { GoogleGenerativeAI } from '@google/generative-ai';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GeminiService {
  private readonly apiKey: string;
  private genAi: GoogleGenerativeAI;

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
    if (!this.apiKey) {
      throw new Error('GEMINI_API_KEY is not defined in environment variables');
    }

    this.genAi = new GoogleGenerativeAI(this.apiKey);
  }

  async extractMeasureValue(imageBase64: string): Promise<number> {
    const prompt = `Extract the numeric value from the following image and respond in JSON format
      Use this JSON Schema:

      {
        "measure_value": number
      }
    `;
    const image = {
      inlineData: {
        data: Buffer.from(imageBase64, 'base64').toString('base64'),
        mimeType: 'image/png',
      },
    };

    const model = this.genAi.getGenerativeModel({
      model: 'gemini-1.5-pro-latest',
    });

    const result = await model.generateContent([prompt, image]);

    const measureValue = JSON.parse(
      result.response
        .text()
        .replace(/```json/g, '')
        .replace(/```/g, ''),
    ).measure_value;

    if (typeof measureValue !== 'number') {
      throw new Error('Invalid measure value received from Gemini API');
    }

    return measureValue;
  }
}
