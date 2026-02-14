# VideoDiff

A modern, web-based tool for side-by-side video comparison with synchronized playback and metadata analysis.

🚀 **[Try it live on GitHub Pages](https://angch.github.io/videodiff/)**

> [!IMPORTANT]
> **Privacy First**: This tool runs entirely in your browser. All video processing and metadata extraction are performed locally using WebAssembly. Your video files are **never uploaded** to any server.


## Features

- **Advanced Comparison Engine**: Custom YUV-based difference calculation for accurate visual discrepancy detection.
- **Synchronized Playback**: Play, pause, and seek two videos simultaneously to spot differences easily.
- **Frame-by-Frame Analysis**: Precise control with frame stepping and keyboard shortcuts.
- **Zoom & Pan**: Synchronized zooming and panning with hardware-accelerated transitions for smooth detailed inspection.
- **Detailed Metadata**: Automatically extracts and displays video information using MediaInfo.js, including:
  - Resolution
  - FPS (Frames Per Second)
  - Codec
  - Bitrate
  - File Size
- **Local Processing**: All video processing happens locally in your browser using WebAssembly. Your files are never uploaded to a server.
- **Dark Mode UI**: Sleek, modern interface designed for extended use with Material UI.

## How it Works: Diff Engine

The application uses a custom offscreen rendering engine to perform real-time video comparison:
1. **Sampling**: Capture frames from both videos onto offscreen canvases.
2. **YUV Conversion**: Convert RGB data to YUV color space to isolate luminance from chrominance.
3. **Chroma Difference**: Calculate the Euclidean distance between U and V channels to detect color shifts and compression artifacts effectively.
4. **Visual Feedback**: The "Chroma Diff" view highlights differences by mapping color discrepancies to a visible spectrum.

## Getting Started

### Prerequisites

- Node.js (v18 or later recommended)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd videocompare
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173` (or the URL shown in the terminal).

## Usage

1. **Load Videos**: Drag and drop video files into the drop zones, or use the "Add Videos" button.
2. **Select Videos**: Choose which video to display in the left and right players from the dropdown menus.
3. **Compare**:
   - **Spacebar**: Play/Pause both videos.
   - **Arrow Keys**: Seek (Shift + Arrow for frame stepping).
   - **Mouse Wheel**: Zoom in/out (synchronized).
   - **Click & Drag**: Pan around zoomed videos (synchronized).
   - **R**: Reset view (zoom and pan).

## Deployment

This project is automatically deployed to GitHub Pages through CI/CD on every push to the main branch.

### Building for Production

```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory.

### Creating a Release

To create a new release, push a tag starting with `v`:

```bash
git tag v1.0.0
git push origin v1.0.0
```

This will trigger the release workflow, which will:
- Build the project
- Create a GitHub release with release notes
- Attach a downloadable ZIP archive of the build

## Technologies

- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/)
- [MUI (Material UI)](https://mui.com/)
- [MediaInfo.js](https://github.com/mediainfo.js/mediainfo.js)
