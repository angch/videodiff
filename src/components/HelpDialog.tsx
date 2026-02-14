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
                            <MouseIcon color="primary" />
                            <Typography variant="subtitle2" fontWeight="bold">Mouse Controls</Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary" paragraph>
                            <strong>Scroll Wheel:</strong> Zoom in/out on the video.
                        </Typography>
                        <Typography variant="body2" color="text.secondary" paragraph>
                            <strong>Drag:</strong> Pan around when zoomed in.
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            <strong>Drop:</strong> Drag and drop video files directly onto the player areas.
                        </Typography>
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} variant="contained" size="small">Got it</Button>
            </DialogActions>
        </Dialog>
    );
};

export default HelpDialog;
