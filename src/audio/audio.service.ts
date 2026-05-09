import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class AudioService {
  private readonly baseUrl = 'https://api.alquran.cloud/v1';

  async getAyahAudio(ayahNumber: number, reciter = 'ar.alafasy'): Promise<string> {
    try {
      const response = await axios.get(`${this.baseUrl}/ayah/${ayahNumber}/${reciter}`);
      return response.data.data.audio;
    } catch (error) {
      throw new Error(`Failed to fetch audio for ayah ${ayahNumber}: ${error.message}`);
    }
  }

  async getSurahAudio(surahNumber: number, reciter = 'ar.alafasy'): Promise<any[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/surah/${surahNumber}/${reciter}`);
      const ayahs = response.data?.data?.ayahs;
      
      if (!ayahs || !Array.isArray(ayahs)) {
        console.warn(`No ayahs found in audio response for surah ${surahNumber}`);
        return [];
      }

      return ayahs.map((ayah: any) => ({
        number: ayah.number,
        audio: ayah.audio,
        audioSecondary: ayah.audioSecondary,
      }));
    } catch (error) {
      console.error(`Failed to fetch audio for surah ${surahNumber}:`, error.message);
      return []; // Return empty array instead of throwing
    }
  }

  async getEditions(format?: string, language?: string, type?: string): Promise<any[]> {
    try {
      const params: any = {};
      if (format) params.format = format;
      if (language) params.language = language;
      if (type) params.type = type;

      const response = await axios.get(`${this.baseUrl}/edition`, { params });
      return response.data.data;
    } catch (error) {
      throw new Error(`Failed to fetch editions: ${error.message}`);
    }
  }

  async getLanguages(): Promise<any[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/languages`);
      return response.data.data;
    } catch (error) {
      throw new Error(`Failed to fetch languages: ${error.message}`);
    }
  }

  async getTypes(): Promise<any[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/edition/type`);
      return response.data.data;
    } catch (error) {
      throw new Error(`Failed to fetch edition types: ${error.message}`);
    }
  }

  async getFormats(): Promise<any[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/edition/format`);
      return response.data.data;
    } catch (error) {
      throw new Error(`Failed to fetch edition formats: ${error.message}`);
    }
  }

  async getReciters(): Promise<any[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/edition/type/versebyverse`);
      return response.data?.data || [];
    } catch (error) {
      console.error(`Failed to fetch reciters:`, error.message);
      return [];
    }
  }
}
