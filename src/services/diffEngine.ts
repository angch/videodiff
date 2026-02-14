/**
 * DiffEngine handles the comparison of two video frames using HTML5 Canvas.
 */
export class DiffEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private offscreen1: HTMLCanvasElement;
  private offscreen2: HTMLCanvasElement;
  private ctx1: CanvasRenderingContext2D;
  private ctx2: CanvasRenderingContext2D;

  private readonly PROCESSING_WIDTH = 640;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d', { willReadFrequently: true })!;
    this.offscreen1 = document.createElement('canvas');
    this.offscreen2 = document.createElement('canvas');
    this.ctx1 = this.offscreen1.getContext('2d', { willReadFrequently: true })!;
    this.ctx2 = this.offscreen2.getContext('2d', { willReadFrequently: true })!;
  }

  /**
   * RGB to YUV conversion helper.
   * Y is luminance, U and V are chroma components.
   * Based on BT.601 coefficients.
   */
  private rgbToYuv(r: number, g: number, b: number): [number, number, number] {
    const y = 0.299 * r + 0.587 * g + 0.114 * b;
    const u = -0.14713 * r - 0.28886 * g + 0.436 * b;
    const v = 0.615 * r - 0.51499 * g - 0.10001 * b;
    return [y, u, v];
  }

  /**
   * Helper to calculate source and destination dimensions for diffing.
   * Accounts for object-fit: contain and zoom/pan.
   */
  private getGeometries(
    video: HTMLVideoElement,
    zoom: number,
    pan: { x: number; y: number }
  ) {
    const vWidth = video.videoWidth;
    const vHeight = video.videoHeight;
    const cWidth = video.clientWidth;
    const cHeight = video.clientHeight;

    if (!vWidth || !vHeight || !cWidth || !cHeight) {
      return { sx: 0, sy: 0, sw: vWidth || 1, sh: vHeight || 1, width: this.PROCESSING_WIDTH, height: (this.PROCESSING_WIDTH * (vHeight || 1080)) / (vWidth || 1920) };
    }

    const videoAspect = vWidth / vHeight;
    const containerAspect = cWidth / cHeight;

    let scale;
    if (videoAspect > containerAspect) {
      scale = cWidth / vWidth; // Width constrained
    } else {
      scale = cHeight / vHeight; // Height constrained
    }

    // Calculate source rect that is visible in the container
    const sw = Math.min(vWidth, cWidth / (scale * zoom));
    const sh = Math.min(vHeight, cHeight / (scale * zoom));

    // Pan offset in source space:
    const sx = (vWidth - sw) / 2 - (pan.x / scale) / zoom;
    const sy = (vHeight - sh) / 2 - (pan.y / scale) / zoom;

    const actualAspect = sw / sh;
    const pHeight = Math.round(this.PROCESSING_WIDTH / actualAspect);

    return { sx, sy, sw, sh, width: this.PROCESSING_WIDTH, height: pHeight };
  }

  /**
   * Computes the difference between two video elements at their current time.
   */
  public computeDiff(
    video1: HTMLVideoElement,
    video2: HTMLVideoElement,
    zoom1: number,
    pan1: { x: number; y: number },
    zoom2: number,
    pan2: { x: number; y: number }
  ): string {
    const geom1 = this.getGeometries(video1, zoom1, pan1);
    const geom2 = this.getGeometries(video2, zoom2, pan2);

    const { width, height } = geom1; // Use video 1 as reference for output size

    if (this.canvas.width !== width || this.canvas.height !== height) {
      this.canvas.width = width;
      this.canvas.height = height;
      this.offscreen1.width = width;
      this.offscreen1.height = height;
      this.offscreen2.width = width;
      this.offscreen2.height = height;
    }

    this.ctx1.clearRect(0, 0, width, height);
    this.ctx2.clearRect(0, 0, width, height);
    this.ctx1.drawImage(video1, geom1.sx, geom1.sy, geom1.sw, geom1.sh, 0, 0, width, height);
    this.ctx2.drawImage(video2, geom2.sx, geom2.sy, geom2.sw, geom2.sh, 0, 0, width, height);

    const imgData1 = this.ctx1.getImageData(0, 0, width, height);
    const imgData2 = this.ctx2.getImageData(0, 0, width, height);
    const diffData = this.ctx.createImageData(width, height);

    const d1 = imgData1.data;
    const d2 = imgData2.data;
    const dd = diffData.data;

    for (let i = 0; i < d1.length; i += 4) {
      const yuv1 = this.rgbToYuv(d1[i], d1[i + 1], d1[i + 2]);
      const yuv2 = this.rgbToYuv(d2[i], d2[i + 1], d2[i + 2]);

      const du = yuv1[1] - yuv2[1];
      const dv = yuv1[2] - yuv2[2];
      
      // Euclidean distance in UV space, scaled for visibility
      const diffVal = Math.min(255, Math.sqrt(du * du + dv * dv) * 4);

      dd[i] = diffVal;
      dd[i + 1] = diffVal;
      dd[i + 2] = diffVal;
      dd[i + 3] = 255;
    }

    this.ctx.putImageData(diffData, 0, 0);
    return this.canvas.toDataURL('image/webp', 0.5);
  }


  /**
   * Returns a numerical score representing the difference between two video elements.
   */
  public getDiffScore(
    video1: HTMLVideoElement,
    video2: HTMLVideoElement,
    zoom1: number,
    pan1: { x: number; y: number },
    zoom2: number,
    pan2: { x: number; y: number }
  ): number {
    const geom1 = this.getGeometries(video1, zoom1, pan1);
    const geom2 = this.getGeometries(video2, zoom2, pan2);

    const { width, height } = geom1;

    this.offscreen1.width = width;
    this.offscreen1.height = height;
    this.offscreen2.width = width;
    this.offscreen2.height = height;

    this.ctx1.clearRect(0, 0, width, height);
    this.ctx2.clearRect(0, 0, width, height);
    this.ctx1.drawImage(video1, geom1.sx, geom1.sy, geom1.sw, geom1.sh, 0, 0, width, height);
    this.ctx2.drawImage(video2, geom2.sx, geom2.sy, geom2.sw, geom2.sh, 0, 0, width, height);

    const d1 = this.ctx1.getImageData(0, 0, width, height).data;
    const d2 = this.ctx2.getImageData(0, 0, width, height).data;

    let totalDiff = 0;
    const step = 4;

    for (let i = 0; i < d1.length; i += 4 * step) {
      const yuv1 = this.rgbToYuv(d1[i], d1[i + 1], d1[i + 2]);
      const yuv2 = this.rgbToYuv(d2[i], d2[i + 1], d2[i + 2]);

      const du = yuv1[1] - yuv2[1];
      const dv = yuv1[2] - yuv2[2];
      totalDiff += Math.sqrt(du * du + dv * dv);
    }

    return totalDiff / (d1.length / (4 * step));
  }
}

export const diffEngine = new DiffEngine();

