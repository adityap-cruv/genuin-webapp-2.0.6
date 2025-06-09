export class AudioAnalyzer {
  private audioContext: AudioContext | null = null;
  private audioBuffer: AudioBuffer | null = null;

  async analyzeAudioFile(file: File, samples: number = 100): Promise<number[]> {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const arrayBuffer = await file.arrayBuffer();
      this.audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      
      const rawData = this.audioBuffer.getChannelData(0);
      const blockSize = Math.floor(rawData.length / samples);
      const filteredData: number[] = [];

      for (let i = 0; i < samples; i++) {
        let sum = 0;
        for (let j = 0; j < blockSize; j++) {
          sum += Math.abs(rawData[i * blockSize + j] ?? 0);
        }
        filteredData.push(sum / blockSize);
      }

      // Normalize data
      const max = Math.max(...filteredData);
      return filteredData.map(val => val / max);
    } catch (error) {
      console.error('Error analyzing audio:', error);
      return this.generateFallbackData(samples);
    }
  }

  async analyzeAudioUrl(url: string, samples: number = 100): Promise<number[]> {
    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      
      const rawData = this.audioBuffer.getChannelData(0);
      const blockSize = Math.floor(rawData.length / samples);
      const filteredData: number[] = [];

      for (let i = 0; i < samples; i++) {
        let sum = 0;
        for (let j = 0; j < blockSize; j++) {
          sum += Math.abs(rawData[i * blockSize + j] ?? 0);
        }
        filteredData.push(sum / blockSize);
      }

      const max = Math.max(...filteredData);
      return filteredData.map(val => val / max);
    } catch (error) {
      console.error('Error analyzing audio URL:', error);
      return this.generateFallbackData(samples);
    }
  }

  private generateFallbackData(samples: number): number[] {
    const data = [];
    for (let i = 0; i < samples; i++) {
      // Generate more realistic waveform pattern
      const baseAmplitude = Math.sin(i * 0.1) * 0.3 + 0.4;
      const randomVariation = (Math.random() - 0.5) * 0.4;
      data.push(Math.max(0.05, Math.min(1, baseAmplitude + randomVariation)));
    }
    return data;
  }

  cleanup(): void {
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
    }
  }
}

