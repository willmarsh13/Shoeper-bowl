import React, { useState } from 'react';
import {
    Modal,
    Box,
    Tabs,
    Tab,
    IconButton,
    useTheme,
    useMediaQuery
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

type RulesModalProps = {
    open: boolean;
    onClose: (newVal: boolean) => void;
};

const HEADER_HEIGHT = 56; // px (Tabs + padding)

export default function RulesModal({ open, onClose }: RulesModalProps) {
    const [tab, setTab] = useState<'game' | 'rules'>('game');

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const imageSrc =
        tab === 'game'
            ? '/shoeper-bowl/assets/gameInfo/rules.png'
            : '/shoeper-bowl/assets/gameInfo/scoring.png';

    return (
        <Modal
            open={open}
            onClose={() => onClose(false)}
            sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <Box
                sx={{
                    width: '100%',
                    maxWidth: 900,
                    height: '85vh',
                    bgcolor: 'background.paper',
                    borderRadius: 2,
                    boxShadow: 24,
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                {/* Header */}
                <Box
                    sx={{
                        height: HEADER_HEIGHT,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        px: 2,
                        borderBottom: 1,
                        borderColor: 'divider',
                        flexShrink: 0,
                    }}
                >
                    <Tabs
                        value={tab}
                        onChange={(_, val) => setTab(val)}
                        variant={isMobile ? 'fullWidth' : 'standard'}
                    >
                        <Tab label="Game Info" value="game" />
                        <Tab label="Rules" value="rules" />
                    </Tabs>

                    <IconButton onClick={() => onClose(false)}>
                        <CloseIcon />
                    </IconButton>
                </Box>

                {/* Image Area */}
                <Box
                    sx={{
                        height: `calc(100% - ${HEADER_HEIGHT}px)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        p: 1,
                    }}
                >
                    <Box
                        component="img"
                        src={imageSrc}
                        alt={tab === 'game' ? 'Game Information' : 'Rules'}
                        sx={{
                            maxWidth: '100%',
                            maxHeight: '100%',
                            objectFit: 'contain',
                        }}
                    />
                </Box>
            </Box>
        </Modal>
    );
}
