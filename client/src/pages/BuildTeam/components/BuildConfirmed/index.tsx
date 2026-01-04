import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Confetti from 'react-confetti';

interface BuildConfirmedProps {
    open: boolean;
    handleClose: (b: boolean) => void;
}

export default function BuildConfirmedDialog({
                                                 open,
                                                 handleClose,
                                             }: BuildConfirmedProps) {

    const handleClickClose = () => {
        handleClose(true);
    };

    return (
        <>
            <Confetti
                numberOfPieces={250}
                recycle={false}
                gravity={0.3}
                run={open}
            />

            <Dialog
                open={open}
                onClose={handleClickClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    Successfully saved draft picks!
                </DialogTitle>

                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Thanks for playing! Share your experience using this new format or
                        click below to review your picks. Good luck!
                    </DialogContentText>
                </DialogContent>

                <DialogActions>
                    <Button
                        onClick={handleClickClose}
                        variant="contained"
                        color="success"
                        href='/shoeper-bowl/profile'
                    >
                        View Picks!
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
