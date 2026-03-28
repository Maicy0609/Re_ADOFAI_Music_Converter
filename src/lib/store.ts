import { create } from "zustand";
import { InputSource } from "./core/types";

interface TrackInfo {
  id: number;
  size: number;
  enabled: boolean;
}

interface ConvertStats {
  tileCount: number;
  bpm: number;
  duration: number;
  sampleRate?: number;
  trackCount?: number;
  beatCount?: number;
  volumeMin?: number;
  volumeMax?: number;
}

interface BigCircleResult {
  trackIndex: number;
  json: string;
  fileName: string;
  tileCount: number;
  offset: number;
}

interface ConverterState {
  // 文件状态
  file: File | null;
  fileName: string;
  fileType: "midi" | "audio" | null;

  // 输入源
  inputSource: InputSource;

  // 转换模式
  convertMode: "angle" | "zipper" | "fullsample" | "bigcircle";

  // MIDI 参数
  trackInfo: TrackInfo[];
  octaveOffset: number;

  // 音频参数
  heightMin: number;
  heightMax: number;

  // 全采音参数
  pseudoSampleRate: number;
  useFloatVolume: boolean;

  // 通用参数
  baseBpm: number | null;
  customAngle: number;

  // 处理状态
  isProcessing: boolean;
  processingStep: string;
  progress: number;

  // 结果
  resultJson: string | null;
  resultFileName: string | null;
  stats: ConvertStats | null;
  bigCircleResults: BigCircleResult[] | null;
  error: string | null;

  // Actions
  setFile: (file: File | null) => void;
  setInputSource: (source: InputSource) => void;
  setConvertMode: (mode: "angle" | "zipper" | "fullsample") => void;
  setTrackInfo: (tracks: TrackInfo[]) => void;
  toggleTrack: (trackId: number) => void;
  setOctaveOffset: (offset: number) => void;
  setHeightMin: (value: number) => void;
  setHeightMax: (value: number) => void;
  setBaseBpm: (bpm: number | null) => void;
  setCustomAngle: (angle: number) => void;
  setPseudoSampleRate: (rate: number) => void;
  setUseFloatVolume: (useFloat: boolean) => void;
  setProcessing: (isProcessing: boolean, step?: string, progress?: number) => void;
  setResult: (json: string | null, fileName: string | null, stats: ConvertStats | null) => void;
  setBigCircleResults: (results: BigCircleResult[] | null) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState = {
  file: null,
  fileName: "",
  fileType: null as "midi" | "audio" | null,
  inputSource: "midi" as InputSource,
  convertMode: "angle" as "angle" | "zipper" | "fullsample",
  trackInfo: [] as TrackInfo[],
  octaveOffset: -4,
  heightMin: 0,
  heightMax: 32767,
  pseudoSampleRate: 8000,
  useFloatVolume: false,
  baseBpm: null as number | null,
  customAngle: 15,
  isProcessing: false,
  processingStep: "",
  progress: 0,
  resultJson: null as string | null,
  resultFileName: null as string | null,
  stats: null as ConvertStats | null,
  bigCircleResults: null as BigCircleResult[] | null,
  error: null as string | null,
};

export const useConverterStore = create<ConverterState>((set) => ({
  ...initialState,

  setFile: (file) =>
    set({
      file,
      fileName: file?.name ?? "",
      fileType: file?.name.endsWith(".mid") || file?.name.endsWith(".midi")
        ? "midi"
        : file?.name.endsWith(".wav")
        ? "audio"
        : null,
      // 重置其他状态
      trackInfo: [],
      resultJson: null,
      resultFileName: null,
      stats: null,
      bigCircleResults: null,
      error: null,
    }),

  setInputSource: (inputSource) => set({ inputSource }),

  setConvertMode: (convertMode) => set({ convertMode }),

  setTrackInfo: (trackInfo) => set({ trackInfo }),

  toggleTrack: (trackId) =>
    set((state) => ({
      trackInfo: state.trackInfo.map((track) =>
        track.id === trackId ? { ...track, enabled: !track.enabled } : track
      ),
    })),

  setOctaveOffset: (octaveOffset) => set({ octaveOffset }),

  setHeightMin: (heightMin) => set({ heightMin }),

  setHeightMax: (heightMax) => set({ heightMax }),

  setBaseBpm: (baseBpm) => set({ baseBpm }),

  setCustomAngle: (customAngle) => set({ customAngle }),

  setPseudoSampleRate: (pseudoSampleRate) => set({ pseudoSampleRate }),

  setUseFloatVolume: (useFloatVolume) => set({ useFloatVolume }),

  setProcessing: (isProcessing, step = "", progress = 0) =>
    set({ isProcessing, processingStep: step, progress }),

  setResult: (resultJson, resultFileName, stats) =>
    set({
      resultJson,
      resultFileName,
      stats,
      bigCircleResults: null,
      isProcessing: false,
      processingStep: "",
      progress: 100,
    }),

  setBigCircleResults: (bigCircleResults) =>
    set({
      bigCircleResults,
      resultJson: null,
      resultFileName: null,
      stats: null,
      isProcessing: false,
      processingStep: "",
      progress: 100,
    }),

  setError: (error) =>
    set({
      error,
      isProcessing: false,
      processingStep: "",
      progress: 0,
    }),

  reset: () => set(initialState),
}));
