/**
 * Audio Processor - 完全等价移植自 Python 版本
 * 处理 WAV 音频文件，提取能量信号
 * 
 * 重要：所有 Web Audio API 必须在客户端组件中调用
 * 使用 "use client" 标记，在 useEffect 或用户交互事件中执行
 */

export interface AudioData {
  sampleRate: number;
  samples: Float64Array;
  duration: number;
  fileName: string;
}

/**
 * 音频处理器
 * 使用 Web Audio API 解码 WAV 文件
 */
export class AudioProcessor {
  private sampleRate: number = 0;
  private samples: Float64Array | null = null;
  private duration: number = 0;
  private fileName: string = "";

  /**
   * 加载音频文件
   * @param file - 音频文件
   * @returns 是否加载成功
   */
  async load(file: File): Promise<boolean> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      
      // 获取声道数据
      let channelData = audioBuffer.getChannelData(0);
      
      // 如果是多声道，混合为单声道
      if (audioBuffer.numberOfChannels > 1) {
        const leftChannel = audioBuffer.getChannelData(0);
        const rightChannel = audioBuffer.getChannelData(1);
        channelData = new Float32Array(leftChannel.length);
        for (let i = 0; i < leftChannel.length; i++) {
          channelData[i] = (leftChannel[i] + rightChannel[i]) / 2;
        }
      }

      // 转换为 Float64Array
      this.samples = new Float64Array(channelData);
      this.sampleRate = audioBuffer.sampleRate;
      this.duration = audioBuffer.duration;
      this.fileName = file.name;

      audioContext.close();

      return true;
    } catch (error) {
      console.error("Failed to load audio:", error);
      return false;
    }
  }

  /**
   * 获取能量信号
   * 完全等价移植自 Python 版本的 get_energy_signal
   * @returns 归一化的能量信号 (int16 范围)
   */
  getEnergySignal(): Int16Array {
    if (!this.samples) {
      throw new Error("No audio loaded");
    }

    const y0 = this.samples;
    const y1 = new Float64Array(y0.length);

    // 计算平方能量
    for (let i = 0; i < y0.length; i++) {
      y1[i] = y0[i] * y0[i];
    }

    // 找最大值
    let y1Max = 0;
    for (let i = 0; i < y1.length; i++) {
      if (y1[i] > y1Max) {
        y1Max = y1[i];
      }
    }

    // 归一化到 int16 范围
    const result = new Int16Array(y1.length);
    if (y1Max === 0) {
      return result;
    }

    for (let i = 0; i < y1.length; i++) {
      result[i] = Math.floor((y1[i] / y1Max) * 32767);
    }

    return result;
  }

  /**
   * 获取采样率
   */
  getSampleRate(): number {
    return this.sampleRate;
  }

  /**
   * 获取总采样数
   */
  getTotalSamples(): number {
    return this.samples ? this.samples.length : 0;
  }

  /**
   * 获取时长
   */
  getDuration(): number {
    return this.duration;
  }

  /**
   * 获取文件名
   */
  getFileName(): string {
    return this.fileName;
  }

  /**
   * 获取时间轴
   */
  getTimeAxis(): Float64Array {
    if (!this.samples) {
      throw new Error("No audio loaded");
    }
    const timeAxis = new Float64Array(this.samples.length);
    for (let i = 0; i < this.samples.length; i++) {
      timeAxis[i] = i / this.sampleRate;
    }
    return timeAxis;
  }

  /**
   * 获取原始采样数据
   */
  getSamples(): Float64Array | null {
    return this.samples;
  }
}

/**
 * 使用 OfflineAudioContext 进行高质量重采样
 * 完全等价移植自 Python 版本的 scipy.signal.resample_poly
 * 
 * @param audioData - 原始音频数据
 * @param originalSampleRate - 原始采样率
 * @param targetSampleRate - 目标采样率
 * @param onProgress - 进度回调函数
 * @returns 重采样后的音频数据
 */
export async function resampleAudio(
  audioData: Float64Array,
  originalSampleRate: number,
  targetSampleRate: number,
  onProgress?: (progress: number) => void
): Promise<Float64Array> {
  // 验证采样率
  if (targetSampleRate <= 0 || targetSampleRate > 48000) {
    throw new Error(`Invalid target sample rate: ${targetSampleRate}`);
  }

  if (originalSampleRate === targetSampleRate) {
    return audioData;
  }

  // 计算目标采样数
  const duration = audioData.length / originalSampleRate;
  const targetLength = Math.ceil(duration * targetSampleRate);

  // 创建 OfflineAudioContext
  const offlineContext = new OfflineAudioContext(1, targetLength, targetSampleRate);

  // 创建音频缓冲区
  const audioBuffer = offlineContext.createBuffer(1, audioData.length, originalSampleRate);
  const channelData = audioBuffer.getChannelData(0);
  
  // 复制数据到缓冲区
  for (let i = 0; i < audioData.length; i++) {
    channelData[i] = audioData[i];
  }

  // 创建音频源
  const source = offlineContext.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(offlineContext.destination);
  source.start(0);

  // 渲染音频
  onProgress?.(10);
  const renderedBuffer = await offlineContext.startRendering();
  onProgress?.(100);

  // 提取重采样后的数据
  const resampledData = renderedBuffer.getChannelData(0);
  
  return new Float64Array(resampledData);
}

/**
 * 计算音量序列
 * 完全等价移植自 Python 版本的 _calculate_volumes
 * 
 * @param audioData - 重采样后的音频数据
 * @param useFloatVolume - 是否使用浮点数音量
 * @returns 音量列表（0-100）
 */
export function calculateVolumes(
  audioData: Float64Array,
  useFloatVolume: boolean = false
): number[] {
  // 取绝对值获取幅度
  const amplitudes = new Float64Array(audioData.length);
  for (let i = 0; i < audioData.length; i++) {
    amplitudes[i] = Math.abs(audioData[i]);
  }

  // 归一化到 0-1
  let maxAmplitude = 0;
  for (let i = 0; i < amplitudes.length; i++) {
    if (amplitudes[i] > maxAmplitude) {
      maxAmplitude = amplitudes[i];
    }
  }

  const normalized = new Float64Array(amplitudes.length);
  if (maxAmplitude > 0) {
    for (let i = 0; i < amplitudes.length; i++) {
      normalized[i] = amplitudes[i] / maxAmplitude;
    }
  }

  // 映射到 0-100
  const volumes: number[] = [];
  for (let i = 0; i < normalized.length; i++) {
    if (useFloatVolume) {
      volumes.push(normalized[i] * 100.0);
    } else {
      volumes.push(Math.round(normalized[i] * 100.0));
    }
  }

  return volumes;
}

/**
 * 全采音模式处理器
 * 封装完整的全采音处理流程
 */
export class FullSampleProcessor {
  private audioData: Float64Array | null = null;
  private originalSampleRate: number = 0;
  private resampledData: Float64Array | null = null;
  private volumes: number[] = [];

  /**
   * 加载并处理音频文件
   */
  async loadAndProcess(
    file: File,
    pseudoSampleRate: number,
    useFloatVolume: boolean = false,
    onProgress?: (step: string, progress: number) => void
  ): Promise<boolean> {
    try {
      // 步骤1: 加载音频
      onProgress?.("loading", 0);
      const processor = new AudioProcessor();
      const loaded = await processor.load(file);
      
      if (!loaded) {
        throw new Error("Failed to load audio file");
      }

      this.audioData = processor.getSamples();
      this.originalSampleRate = processor.getSampleRate();

      if (!this.audioData) {
        throw new Error("No audio data");
      }

      onProgress?.("loading", 100);

      // 步骤2: 重采样
      onProgress?.("resampling", 0);
      this.resampledData = await resampleAudio(
        this.audioData,
        this.originalSampleRate,
        pseudoSampleRate,
        (p) => onProgress?.("resampling", p)
      );

      // 步骤3: 计算音量
      onProgress?.("calculating", 0);
      this.volumes = calculateVolumes(this.resampledData, useFloatVolume);
      onProgress?.("calculating", 100);

      return true;
    } catch (error) {
      console.error("Full sample processing failed:", error);
      return false;
    }
  }

  /**
   * 获取音量序列
   */
  getVolumes(): number[] {
    return this.volumes;
  }

  /**
   * 获取采样点数量
   */
  getSampleCount(): number {
    return this.volumes.length;
  }

  /**
   * 获取音量范围
   */
  getVolumeRange(): { min: number; max: number } {
    if (this.volumes.length === 0) {
      return { min: 0, max: 0 };
    }
    
    let min = this.volumes[0];
    let max = this.volumes[0];
    
    for (const v of this.volumes) {
      if (v < min) min = v;
      if (v > max) max = v;
    }
    
    return { min, max };
  }
}
