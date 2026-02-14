import React, { useRef, useState, ChangeEvent, useEffect } from 'react';
import { extractMetadata, VideoMetadata } from '../services/metadata';
import {
    Box,
    Button,
    Grid,
    Stack,
    Typography,
    useTheme,
    SelectChangeEvent,
    Container
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import ControlBar from './ControlBar';
import VideoPlayer from './VideoPlayer';
import HelpDialog from './HelpDialog';
import Draggable from './Draggable';

interface VideoFile extends VideoMetadata {
    name: string;
    url: string;
    fileObject?: File;
}

const VideoDiff: React.FC = () => {
    const theme = useTheme();

    // State
    const [files, setFiles] = useState<VideoFile[]>([]);
    const [selectedFile1, setSelectedFile1] = useState<string>('');
    const [selectedFile2, setSelectedFile2] = useState<string>('');
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(true);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isUiVisible, setIsUiVisible] = useState(true);
    const [showHelp, setShowHelp] = useState(false);
    const [isSynced, setIsSynced] = useState(true);

    // Zoom and Pan State for player 1
    const [zoom1, setZoom1] = useState(1);
    const [pan1, setPan1] = useState({ x: 0, y: 0 });

    // Zoom and Pan State for player 2
    const [zoom2, setZoom2] = useState(1);
    const [pan2, setPan2] = useState({ x: 0, y: 0 });

    const [isDragging, setIsDragging] = useState(false);
    const [dragSource, setDragSource] = useState<1 | 2 | null>(null);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    // Refs
    const video1Ref = useRef<HTMLVideoElement>(null);
    const video2Ref = useRef<HTMLVideoElement>(null);

    // File Upload Handler
    const handleFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            const uploadedFiles = Array.from(event.target.files);
            const newFiles: VideoFile[] = await Promise.all(uploadedFiles.map(async (file) => {
                const metadata = await extractMetadata(file);
                return {
                    name: file.name,
                    url: URL.createObjectURL(file),
                    fileObject: file,
                    ...metadata,
                };
            }));
            setFiles(prev => [...prev, ...newFiles]);
        }
    };

    // Synchronized Play/Pause
    const togglePlay = () => {
        const nextState = !isPlaying;
        setIsPlaying(nextState);

        if (nextState) {
            video1Ref.current?.play().catch(e => console.error("Video 1 play error:", e));
            video2Ref.current?.play().catch(e => console.error("Video 2 play error:", e));
        } else {
            video1Ref.current?.pause();
            video2Ref.current?.pause();
        }
    };

    // Keyboard Shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.code === 'Space') {
                e.preventDefault();
                togglePlay();
            } else if (e.code === 'ArrowRight') {
                e.preventDefault();
                const seekTime = e.shiftKey ? 1 / 30 : 5;
                handleSeek(null as any, Math.min(currentTime + seekTime, duration));
            } else if (e.code === 'ArrowLeft') {
                e.preventDefault();
                const seekTime = e.shiftKey ? 1 / 30 : 5;
                handleSeek(null as any, Math.max(currentTime - seekTime, 0));
            } else if (e.code === 'KeyR') {
                resetView();
            } else if (e.code === 'KeyH' || e.code === 'Escape') {
                setIsUiVisible(prev => !prev);
            } else if (e.code === 'KeyL') {
                setIsSynced(prev => !prev);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isPlaying, currentTime, duration, isSynced, setIsSynced, setIsUiVisible]); // Re-bind if needed, or use functional updates

    const toggleMute = () => setIsMuted(!isMuted);

    // Handle Seek
    const handleSeek = (_: Event, newValue: number | number[]) => {
        const time = newValue as number;
        setCurrentTime(time);
        if (video1Ref.current) video1Ref.current.currentTime = time;
        if (video2Ref.current) video2Ref.current.currentTime = time;
    };

    const stepForward = () => {
        if (isPlaying) {
            setIsPlaying(false);
            video1Ref.current?.pause();
            video2Ref.current?.pause();
        }
        const frameTime = 1 / 30;
        const newTime = Math.min(currentTime + frameTime, duration);
        setCurrentTime(newTime);
        if (video1Ref.current) video1Ref.current.currentTime = newTime;
        if (video2Ref.current) video2Ref.current.currentTime = newTime;
    };

    const handleTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement>) => {
        if (isPlaying) {
            setCurrentTime(e.currentTarget.currentTime);
        }
    };

    const handleLoadedMetadata = () => {
        const d1 = video1Ref.current?.duration || 0;
        const d2 = video2Ref.current?.duration || 0;
        setDuration(Math.max(d1, d2));
    };

    // Zoom keys
    const handleWheel = (e: React.WheelEvent, playerIndex: 1 | 2) => {
        const scaleAmount = -e.deltaY * 0.001;

        const updateZoom = (prevZoom: number) => Math.min(Math.max(1, prevZoom + scaleAmount), 5);

        if (isSynced) {
            const nextZoom1 = updateZoom(zoom1);
            const nextZoom2 = updateZoom(zoom2);
            setZoom1(nextZoom1);
            setZoom2(nextZoom2);
            if (nextZoom1 === 1) {
                setPan1({ x: 0, y: 0 });
                setPan2({ x: 0, y: 0 });
            }
        } else {
            if (playerIndex === 1) {
                const nextZoom = updateZoom(zoom1);
                setZoom1(nextZoom);
                if (nextZoom === 1) setPan1({ x: 0, y: 0 });
            } else {
                const nextZoom = updateZoom(zoom2);
                setZoom2(nextZoom);
                if (nextZoom === 1) setPan2({ x: 0, y: 0 });
            }
        }
    };

    const handleMouseDown = (e: React.MouseEvent, playerIndex: 1 | 2) => {
        const currentZoom = playerIndex === 1 ? zoom1 : zoom2;
        const currentPan = playerIndex === 1 ? pan1 : pan2;

        if (currentZoom > 1) {
            setIsDragging(true);
            setDragSource(playerIndex);
            setDragStart({ x: e.clientX - currentPan.x, y: e.clientY - currentPan.y });
            e.preventDefault();
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isDragging && dragSource !== null) {
            e.preventDefault();
            const newPan = { x: e.clientX - dragStart.x, y: e.clientY - dragStart.y };

            if (isSynced) {
                setPan1(newPan);
                setPan2(newPan);
            } else {
                if (dragSource === 1) setPan1(newPan);
                else setPan2(newPan);
            }
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
        setDragSource(null);
    };

    const handleMouseLeaveVideo = () => {
        setIsDragging(false);
        setDragSource(null);
    };

    const resetView = () => {
        setZoom1(1);
        setPan1({ x: 0, y: 0 });
        setZoom2(1);
        setPan2({ x: 0, y: 0 });
    };

    // Drag and Drop
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.currentTarget.style.borderColor = theme.palette.primary.main;
        e.currentTarget.style.borderWidth = '2px';
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.currentTarget.style.borderColor = '';
        e.currentTarget.style.borderWidth = '';
    };

    const handleDrop = async (e: React.DragEvent<HTMLDivElement>, playerIndex: 1 | 2) => {
        e.preventDefault();
        e.currentTarget.style.borderColor = '';
        e.currentTarget.style.borderWidth = '';

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const droppedFiles = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('video/'));
            if (droppedFiles.length === 0) return;

            const newFiles: VideoFile[] = await Promise.all(droppedFiles.map(async (file) => {
                const metadata = await extractMetadata(file);
                return {
                    name: file.name,
                    url: URL.createObjectURL(file),
                    fileObject: file,
                    ...metadata,
                };
            }));

            setFiles(prev => [...prev, ...newFiles]);

            if (newFiles.length > 0) {
                if (playerIndex === 1) setSelectedFile1(newFiles[0].url);
                else setSelectedFile2(newFiles[0].url);
            }
        }
    };

    const controlBarProps = {
        isPlaying,
        isMuted,
        isSynced,
        currentTime,
        duration,
        onTogglePlay: togglePlay,
        onStepForward: stepForward,
        onToggleMute: toggleMute,
        onToggleSync: () => setIsSynced(!isSynced),
        onSeek: handleSeek,
        onResetView: resetView,
        onToggleUi: () => setIsUiVisible(prev => !prev),
        onHelp: () => setShowHelp(true)
    };

    return (
        <Box sx={{ width: '100%', height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default', overflow: 'hidden' }}>
            <Container maxWidth={false} sx={{ flex: 1, display: 'flex', flexDirection: 'column', py: isUiVisible ? 1 : 0, px: 2, height: '100%' }}>
                <Stack spacing={isUiVisible ? 1 : 0} sx={{ height: '100%' }}>
                    {/* Header */}
                    {isUiVisible && (
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Box display="flex" alignItems="center" gap={2}>
                                {/* Optional Logo or Icon here */}
                                <Typography variant="h6" fontWeight="700" sx={{ background: 'linear-gradient(45deg, #3b82f6 30%, #10b981 90%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                    VideoDiff
                                </Typography>
                            </Box>

                            <Button
                                component="label"
                                variant="outlined"
                                size="small"
                                startIcon={<UploadFileIcon />}
                                sx={{ textTransform: 'none', borderRadius: 2 }}
                            >
                                Add Videos
                                <input
                                    type="file"
                                    hidden
                                    accept="video/*"
                                    multiple
                                    onChange={handleFileUpload}
                                />
                            </Button>
                        </Box>
                    )}

                    {/* Controls - Static */}
                    {isUiVisible && (
                        <ControlBar {...controlBarProps} />
                    )}

                    {/* Main Video Area */}
                    <Grid container spacing={1} sx={{ flex: 1, overflow: 'hidden' }}>
                        <Grid item xs={12} md={6} sx={{ height: '100%' }}>
                            <VideoPlayer
                                label="Video 1"
                                files={files}
                                selectedFile={selectedFile1}
                                videoRef={video1Ref}
                                isMuted={isMuted}
                                zoom={zoom1}
                                pan={pan1}
                                isDragging={isDragging && dragSource === 1}
                                onFileSelect={(e: SelectChangeEvent<string>) => setSelectedFile1(e.target.value)}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={(e) => handleDrop(e, 1)}
                                onWheel={(e) => handleWheel(e, 1)}
                                onMouseDown={(e) => handleMouseDown(e, 1)}
                                onMouseMove={handleMouseMove}
                                onMouseUp={handleMouseUp}
                                onMouseLeave={handleMouseLeaveVideo}
                                onTimeUpdate={handleTimeUpdate}
                                onLoadedMetadata={handleLoadedMetadata}
                            />
                        </Grid>
                        <Grid item xs={12} md={6} sx={{ height: '100%' }}>
                            <VideoPlayer
                                label="Video 2"
                                files={files}
                                selectedFile={selectedFile2}
                                videoRef={video2Ref}
                                isMuted={isMuted}
                                zoom={zoom2}
                                pan={pan2}
                                isDragging={isDragging && dragSource === 2}
                                onFileSelect={(e: SelectChangeEvent<string>) => setSelectedFile2(e.target.value)}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={(e) => handleDrop(e, 2)}
                                onWheel={(e) => handleWheel(e, 2)}
                                onMouseDown={(e) => handleMouseDown(e, 2)}
                                onMouseMove={handleMouseMove}
                                onMouseUp={handleMouseUp}
                                onMouseLeave={handleMouseLeaveVideo}
                                onLoadedMetadata={handleLoadedMetadata}
                            />
                        </Grid>
                    </Grid>
                </Stack>
            </Container>

            {/* Floating Controls - Draggable */}
            {!isUiVisible && (
                <Draggable initialPos={{ x: window.innerWidth * 0.1, y: window.innerHeight - 80 }}>
                    <Box sx={{ width: '80vw' }}> {/* 80% width */}
                        <ControlBar {...controlBarProps} />
                    </Box>
                </Draggable>
            )}

            <HelpDialog open={showHelp} onClose={() => setShowHelp(false)} />
        </Box>
    );
};

export default VideoDiff;
