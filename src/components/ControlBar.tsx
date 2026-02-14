import React from 'react';
import {
    Paper,
    Stack,
    IconButton,
    Box,
    Typography,
    Slider,
    alpha,
    useTheme,
    Tooltip
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

import LinkIcon from '@mui/icons-material/Link';
import LinkOffIcon from '@mui/icons-material/LinkOff';

interface ControlBarProps {
    isPlaying: boolean;
    isMuted: boolean;
    isSynced: boolean;
    currentTime: number;
    duration: number;
    onTogglePlay: () => void;
    onStepForward: () => void;
    onToggleMute: () => void;
    onToggleSync: () => void;
    onSeek: (_: Event, newValue: number | number[]) => void;
    onResetView: () => void;
    onToggleUi: () => void;
    onHelp: () => void;
}

const ControlBar: React.FC<ControlBarProps> = ({
    isPlaying,
    isMuted,
    isSynced,
    currentTime,
    duration,
    onTogglePlay,
    onStepForward,
    onToggleMute,
    onToggleSync,
    onSeek,
    onResetView,
    onToggleUi,
    onHelp
}) => {
    const theme = useTheme();

    return (
        <Paper
            elevation={3}
            sx={{
                p: 1,
                background: alpha(theme.palette.background.paper, 0.8),
                backdropFilter: 'blur(12px)',
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                borderRadius: 3,
                zIndex: 100,
                boxShadow: theme.shadows[4]
            }}
        >
            <Stack spacing={1} direction="row" alignItems="center">
                <Tooltip title={isPlaying ? "Pause" : "Play"}>
                    <IconButton
                        onClick={onTogglePlay}
                        color="primary"
                        sx={{
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) }
                        }}
                    >
                        {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
                    </IconButton>
                </Tooltip>

                <Tooltip title={isSynced ? "Unlink Views (L)" : "Link Views (L)"}>
                    <IconButton onClick={onToggleSync} size="small" color={isSynced ? "primary" : "default"}>
                        {isSynced ? <LinkIcon fontSize="small" /> : <LinkOffIcon fontSize="small" />}
                    </IconButton>
                </Tooltip>

                <Tooltip title="Step Forward (1 Frame)">
                    <IconButton onClick={onStepForward}>
                        <SkipNextIcon />
                    </IconButton>
                </Tooltip>

                <Tooltip title={isMuted ? "Unmute" : "Mute"}>
                    <IconButton onClick={onToggleMute}>
                        {isMuted ? <VolumeOffIcon /> : <VolumeUpIcon />}
                    </IconButton>
                </Tooltip>

                <Box flex={1} display="flex" alignItems="center" gap={2}>
                    <Typography variant="body2" sx={{ minWidth: 50, fontFamily: 'monospace', color: 'text.secondary' }}>
                        {currentTime.toFixed(2)}s
                    </Typography>
                    <Slider
                        value={currentTime}
                        min={0}
                        max={duration || 100}
                        onChange={onSeek}
                        step={0.01}
                        sx={{
                            flex: 1,
                            height: 6,
                            '& .MuiSlider-thumb': {
                                width: 16,
                                height: 16,
                                transition: '0.2s cubic-bezier(.47,1.64,.41,.8)',
                                '&:before': {
                                    boxShadow: '0 2px 12px 0 rgba(0,0,0,0.4)',
                                },
                                '&:hover, &.Mui-focusVisible': {
                                    boxShadow: `0px 0px 0px 8px ${alpha(theme.palette.primary.main, 0.16)}`,
                                },
                                '&.Mui-active': {
                                    width: 20,
                                    height: 20,
                                },
                            },
                        }}
                    />
                    <Typography variant="body2" sx={{ minWidth: 50, fontFamily: 'monospace', color: 'text.secondary' }}>
                        {duration.toFixed(2)}s
                    </Typography>
                </Box>

                <Tooltip title="Reset View (Zoom & Pan) [R]">
                    <IconButton onClick={onResetView} size="small" sx={{ ml: 1 }}>
                        <RestartAltIcon fontSize="small" />
                    </IconButton>
                </Tooltip>

                <Tooltip title="Hide UI [H / Esc]">
                    <IconButton onClick={onToggleUi} size="small">
                        <VisibilityOffIcon fontSize="small" />
                    </IconButton>
                </Tooltip>

                <Tooltip title="Help">
                    <IconButton onClick={onHelp} size="small">
                        <HelpOutlineIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
            </Stack>
        </Paper>
    );
};

export default ControlBar;
