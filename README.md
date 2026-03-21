# Re: ADOFAI Music Converter

[中文文档 (Chinese README)](./README_CN.md)

A web-based music converter for **A Dance of Fire and Ice (ADOFAI)** level files. This is a complete rewrite of the original [Python version](https://github.com/Luxusio/ADOFAI-Midi-Converter), implemented purely in frontend technologies.

## Features

- **Dual Input Support**: MIDI files and WAV audio files
- **Two Conversion Modes**:
  - **angleData Mode**: Pure angle control with fixed base BPM
  - **Zipper Mode**: Fixed angle with dynamic BPM (angleData + SetSpeed)
- **Multi-language**: English and Simplified Chinese
- **Pure Frontend**: No backend server required, can be deployed to any static hosting service

## Tech Stack

- **Framework**: Next.js 16 + React 19 + TypeScript
- **Styling**: Tailwind CSS 4 + shadcn/ui
- **State Management**: Zustand
- **Animation**: Framer Motion
- **Audio Processing**: Web Audio API

## Quick Start

### Option 1: Use Pre-built Static Files

Download `ADOFAI_Converter_Web_Static.zip` from [Releases](https://github.com/Maicy0609/Re_ADOFAI_Music_Converter/releases), extract and deploy to any static hosting service:

```bash
# Local preview
npx serve .
```

### Option 2: Build from Source

```bash
# Clone the repository
git clone https://github.com/Maicy0609/Re_ADOFAI_Music_Converter.git
cd Re_ADOFAI_Music_Converter

# Install dependencies
bun install

# Development mode
bun run dev

# Build static files
bun run build
```

## Usage

1. **Upload File**: Drag and drop or click to upload a MIDI (.mid) or WAV audio file
2. **Select Mode**: Choose between angleData or Zipper mode
3. **Adjust Parameters**:
   - For MIDI: Select tracks, set octave offset
   - For Audio: Select sampling mode, set threshold range
4. **Convert & Download**: Click convert button, then download the .adofai file

## Core Algorithm

### Time Formula

```
Time = RotationAngle / 180 × 60 / BPM
```

Both modes generate identical absolute timing for each beat:
- **angleData Mode**: Fixed BPM → Dynamic angle = Time × BPM × 180 / 60
- **Zipper Mode**: Fixed angle → Dynamic BPM = Angle / 180 × 60 / Time

### MIDI Parsing

Extracts note events from MIDI files and calculates time intervals based on note frequencies.

### Audio Beat Detection

Uses energy signal peak detection algorithm to identify beat positions:
1. Calculate energy signal (sample²)
2. Peak detection (find_peaks)
3. Convert to time points

### Magic Number

For Zipper mode:
```
Magic Number = 180 / Angle
Display BPM = Actual BPM / Magic Number
```

Example: 15° angle → Magic Number = 12

## Project Structure

```
src/
├── app/
│   ├── page.tsx          # Main page
│   └── layout.tsx        # Layout
├── lib/
│   ├── core/
│   │   ├── types.ts      # Type definitions
│   │   ├── midi-parser.ts    # MIDI file parser
│   │   ├── audio-processor.ts # Audio loader
│   │   ├── beat-detector.ts  # Beat detection
│   │   └── map-data.ts   # ADOFAI map generator
│   ├── i18n/             # Internationalization
│   └── store.ts          # State management
└── components/ui/        # UI components (shadcn/ui)
```

## Acknowledgments

- Original Java developer: [Luxus io](https://github.com/Luxusio/ADOFAI-Midi-Converter)
- [pyadofai](https://github.com/TonyLimps/pyadofai) - angleData calculation reference
- [apofai](https://github.com/sky-sama/apofai_main_console) - Audio beat detection reference

## License

Open source. Please refer to the original Python project for licensing terms.
