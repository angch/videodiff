/* eslint-disable @typescript-eslint/no-explicit-any */
import mediaInfoFactory from 'mediainfo.js';

export interface VideoMetadata {
    fps?: number;
    resolution?: string;
    size?: string;
    codec?: string;
    bitrate?: string;
}

let mediainfo: any = null;

const getMediaInfo = async () => {
    if (!mediainfo) {
        mediainfo = await mediaInfoFactory({
            format: 'object',
            locateFile: () => '/MediaInfoModule.wasm', // Locate the WASM file in public folder
        });
    }
    return mediainfo;
};

export const extractMetadata = async (file: File): Promise<VideoMetadata> => {
    try {
        const mi = await getMediaInfo();
        const result = await mi.analyzeData(() => file.size, (chunkSize: number, offset: number) => {
            return new Promise<Uint8Array>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (event) => {
                    if (event.target?.result) {
                        resolve(new Uint8Array(event.target.result as ArrayBuffer));
                    } else {
                        reject(new Error("Failed to read chunk"));
                    }
                };
                reader.onerror = (event) => reject(event.target?.error);
                const slice = file.slice(offset, offset + chunkSize);
                reader.readAsArrayBuffer(slice);
            });
        });

        const videoTrack = result.media?.track?.find((t: any) => t['@type'] === 'Video');
        const generalTrack = result.media?.track?.find((t: any) => t['@type'] === 'General');

        if (!videoTrack) {
            return {};
        }

        const fileSizeInBytes = parseInt(generalTrack?.FileSize || '0', 10);
        let size = '';
        if (fileSizeInBytes > 1024 * 1024 * 1024) {
            size = `${(fileSizeInBytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
        } else if (fileSizeInBytes > 1024 * 1024) {
            size = `${(fileSizeInBytes / (1024 * 1024)).toFixed(2)} MB`;
        } else {
            size = `${(fileSizeInBytes / 1024).toFixed(2)} KB`;
        }

        const bitRate = parseInt(generalTrack?.OverallBitRate || videoTrack?.BitRate || '0', 10);
        let bitrateStr = '';
        if (bitRate > 1000000) {
            bitrateStr = `${(bitRate / 1000000).toFixed(1)} Mbps`;
        } else {
            bitrateStr = `${(bitRate / 1000).toFixed(0)} Kbps`;
        }


        return {
            fps: parseFloat(videoTrack.FrameRate),
            resolution: `${videoTrack.Width}x${videoTrack.Height}`,
            size: size,
            codec: videoTrack.Format,
            bitrate: bitrateStr,
        };
    } catch (error) {
        console.error("Error extraction metadata:", error);
        return {};
    }
};
