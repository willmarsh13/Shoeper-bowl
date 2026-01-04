import React from 'react';
import {RosterSlot} from '../../../redux/rosterSlice';
import {Box, Button, Card, CardContent, Grid, Typography} from '@mui/material';

interface Props {
    slots: RosterSlot[];
    onRemove: (slotId: string) => void;
}

const RosterView: React.FC<Props> = ({slots, onRemove}) => {
    return (
        <Grid container spacing={2}>
            {slots.map(slot => (
                <Grid size={{xs: 12, sm: 6, md: 4}} key={slot.slotId}>
                    <div>
                        <Card>
                            <CardContent>
                                <Typography variant="subtitle2">{slot.slotId} ({slot.position})</Typography>

                                {slot.player ? (
                                    <>
                                        <Typography variant="body1">{slot.player.full_name}</Typography>
                                        <Typography
                                            variant="body2">{slot.player.team} — {slot.player.position}</Typography>
                                        <Box mt={1}>
                                            <Button variant="outlined" size="small"
                                                    onClick={() => onRemove(slot.slotId)}>Remove</Button>
                                        </Box>
                                    </>
                                ) : (
                                    <Typography variant="body2" color="text.secondary">Empty</Typography>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </Grid>
            ))}
        </Grid>
    );
};

export default RosterView;
