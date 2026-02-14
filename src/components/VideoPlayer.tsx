import React, { RefObject } from 'react';
import {
    Box,
    Typography,
    Paper,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Chip,
    Stack,
    SelectChangeEvent,
    useTheme,
    alpha
} from '@mui/material';
import { VideoMetadata } from '../services/metadata';

interface VideoFile extends VideoMetadata {
    name: string;
    url: string;
    fileObject?: File;
}

interface VideoPlayerProps {
    label: string;
    files: VideoFile[];
    selectedFile: string;
    videoRef: RefObject<HTMLVideoElement>;
    isMuted: boolean;
    zoom: number;
    pan: { x: number; y: number };
    isDragging: boolean;
    onFileSelect: (event: SelectChangeEvent<string>) => void;
    onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
    onDragLeave: (e: React.DragEvent<HTMLDivElement>) => void;
    onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
    onWheel: (e: React.WheelEvent) => void;
    onMouseDown: (e: React.MouseEvent) => void;
    onMouseMove: (e: React.MouseEvent) => void;
    onMouseUp: () => void;
    onMouseLeave: () => void;
    onTimeUpdate?: (e: React.SyntheticEvent<HTMLVideoElement>) => void;
    onLoadedMetadata?: () => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
    label,
    files,
    selectedFile,
    videoRef,
    isMuted,
    zoom,
    pan,
    isDragging,
    onFileSelect,
    onDragOver,
    onDragLeave,
    onDrop,
    onWheel,
    onMouseDown,
    onMouseMove,
    onMouseUp,
    onMouseLeave,
    onTimeUpdate,
    onLoadedMetadata
}) => {
    const theme = useTheme();
    const currentFile = files.find(f => f.url === selectedFile);

    return (
        <Stack spacing={1} sx={{ height: '100%' }}>
            <Box display="flex" alignItems="center" gap={1}>
                <FormControl fullWidth size="small" variant="outlined" sx={{
                    fontSize: '0.875rem',
                    '& .MuiOutlinedInput-root': {
                        bgcolor: alpha(theme.palette.background.paper, 0.5),
                        backdropFilter: 'blur(8px)',
                        borderRadius: 1,
                    },
                    '& .MuiInputLabel-root': { fontSize: '0.875rem' },
                    '& .MuiSelect-select': { py: 1 }
                }}>
                    <InputLabel>{label}</InputLabel>
                    <Select
                        value={selectedFile}
                        label={label}
                        onChange={onFileSelect}
                        sx={{ borderRadius: 1 }}
                    >
                        {files.map((f, i) => (
                            <MenuItem key={`${f.name}-${label}-${i}`} value={f.url}>{f.name}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>

            {/* Metadata Chips */}
            {currentFile && (
                <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                    {currentFile.resolution && <Chip label={currentFile.resolution} size="small" variant="outlined" sx={{ height: 20, fontSize: '0.7rem' }} />}
                    {currentFile.fps && <Chip label={`${currentFile.fps} fps`} size="small" variant="outlined" color="primary" sx={{ height: 20, fontSize: '0.7rem' }} />}
                    {currentFile.codec && <Chip label={currentFile.codec} size="small" variant="outlined" sx={{ height: 20, fontSize: '0.7rem' }} />}
                    {currentFile.bitrate && <Chip label={currentFile.bitrate} size="small" variant="outlined" sx={{ height: 20, fontSize: '0.7rem' }} />}
                    {currentFile.size && <Chip label={currentFile.size} size="small" variant="outlined" sx={{ height: 20, fontSize: '0.7rem' }} />}
                </Stack>
            )}

            <Paper
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                onWheel={onWheel}
                onMouseDown={onMouseDown}
                onMouseMove={onMouseMove}
                onMouseUp={onMouseUp}
                onMouseLeave={onMouseLeave}
                elevation={0}
                sx={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    borderRadius: 0,
                    bgcolor: 'black',
                    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    transition: 'all 0.2s',
                    cursor: isDragging ? 'grabbing' : zoom > 1 ? 'grab' : 'default',
                    position: 'relative'
                }}
            >
                {selectedFile ? (
                    <video
                        ref={videoRef}
                        src={selectedFile}
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain',
                            transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
                            transformOrigin: 'center',
                            transition: isDragging ? 'none' : 'transform 0.1s ease-out'
                        }}
                        onTimeUpdate={onTimeUpdate}
                        onLoadedMetadata={onLoadedMetadata}
                        muted={isMuted}
                    />
                ) : (
                    <Box textAlign="center" p={4} sx={{ opacity: 0.5, border: '2px dashed #444', borderRadius: 0 }}>
                        <Typography variant="h6" color="text.secondary">Drop Video Here</Typography>
                        <Typography variant="body2" color="text.secondary">or select from list</Typography>
                    </Box>
                )}
            </Paper>
        </Stack>
    );
};

export default VideoPlayer;
