import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Grid,
    Box,
    Chip,
    useTheme,
    alpha
} from '@mui/material';
import KeyboardIcon from '@mui/icons-material/Keyboard';
import MouseIcon from '@mui/icons-material/Mouse';
import CompareIcon from '@mui/icons-material/Compare';

interface HelpDialogProps {
    open: boolean;
    onClose: () => void;
}

const HelpDialog: React.FC<HelpDialogProps> = ({ open, onClose }) => {
    const theme = useTheme();

    const ShortcutItem = ({ keys, description }: { keys: string[], description: string }) => (
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="body2" color="text.secondary">{description}</Typography>
            <Box display="flex" gap={0.5}>
                {keys.map((k, i) => (
                    <Chip
                        key={i}
                        label={k}
                        size="small"
                        sx={{
                            height: 20,
                            fontSize: '0.7rem',
                            fontFamily: 'monospace',
                            bgcolor: alpha(theme.palette.text.primary, 0.1)
                        }}
                    />
                ))}
            </Box>
        </Box>
    );

    return (
        <Dialog
            open={open}
            onClose={onClose}
            PaperProps={{
                sx: {
                    borderRadius: 3,
                    bgcolor: alpha(theme.palette.background.paper, 0.9),
                    backdropFilter: 'blur(10px)',
                    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
                }
            }}
        >
            <DialogTitle display="flex" alignItems="center" gap={1}>
                <Typography variant="h6" fontWeight="bold">VideoDiff Help</Typography>
            </DialogTitle>
            <DialogContent>
                <Grid container spacing={4}>
                    <Grid item xs={12} sm={6}>
                        <Box display="flex" alignItems="center" gap={1} mb={2}>
                            <KeyboardIcon color="primary" />
                            <Typography variant="subtitle2" fontWeight="bold">Keyboard Shortcuts</Typography>
                        </Box>
                        <ShortcutItem keys={['Space']} description="Play / Pause" />
                        <ShortcutItem keys={['←', '→']} description="Seek -/+ 5s" />
                        <ShortcutItem keys={['Shift', '←/→']} description="Seek 1 Frame" />
                        <ShortcutItem keys={['R']} description="Reset View" />
                        <ShortcutItem keys={['L']} description="Toggle View Sync" />
                        <ShortcutItem keys={['H', 'Esc']} description="Toggle UI Visibility" />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <Box display="flex" alignItems="center" gap={1} mb={2}>
                            <CompareIcon color="primary" fontSize="small" />
                            <Typography variant="subtitle2" fontWeight="bold">Comparison Modes</Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary" paragraph sx={{ fontSize: '0.8rem' }}>
                            <strong>Normal:</strong> Side-by-side or overlaid view of both videos.
                        </Typography>
                        <Typography variant="body2" color="text.secondary" paragraph sx={{ fontSize: '0.8rem' }}>
                            <strong>Chroma Diff:</strong> Custom engine highlights color differences (U/V channels) between frames, making compression artifacts and color shifts visible.
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                            <strong>Auto-Sync:</strong> Automatically finds the best frame alignment by scanning nearby frames and minimizing the difference score.
                        </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <Box display="flex" alignItems="center" gap={1} mb={2}>
                            <MouseIcon color="primary" />
                            <Typography variant="subtitle2" fontWeight="bold">Mouse Controls</Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary" paragraph>
                            <strong>Scroll Wheel:</strong> Zoom in/out (synced across views).
                        </Typography>
                        <Typography variant="body2" color="text.secondary" paragraph>
                            <strong>Drag:</strong> Pan around when zoomed in (synced).
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            <strong>Drop:</strong> Drag video files directly onto the player areas to load them.
                        </Typography>
                    </Grid>
                </Grid>
                <Box mt={3} p={2} sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05), borderRadius: 2, border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}` }}>
                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom color="primary">Technical Note: Diff Engine</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', lineHeight: 1.4 }}>
                        The difference engine samples both videos at the current timestamp, converts the pixel data to YUV color space, and calculates the Euclidean distance between the chrominance values. This is more effective than simple RGB subtraction for spotting encoding differences.
                    </Typography>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} variant="contained" size="small">Got it</Button>
            </DialogActions>
        </Dialog >
    );
};

export default HelpDialog;
