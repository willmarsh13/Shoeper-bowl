import {
    Badge,
    Box,
    Button,
    Collapse,
    Divider,
    IconButton,
    InputAdornment,
    Paper,
    Stack,
    TextField,
    Typography
} from "@mui/material";
import FeedbackIcon from '@mui/icons-material/Feedback';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DoDisturbOnOutlinedIcon from '@mui/icons-material/DoDisturbOnOutlined';
import DoDisturbOnIcon from '@mui/icons-material/DoDisturbOn';
import SearchIcon from "@mui/icons-material/Search";
import React, {useEffect, useState, FormEvent} from "react";
import {getRequests} from "../logic/getRequests";
import {UpdateRequest} from "../logic/updateRequest";
import {enqueueSnackbar} from "notistack";

// Define a type for your request object
interface Request {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    deviceName?: string;
}

export default function AccountReqs() {
    const [requests, setRequests] = useState<Request[]>([]);
    const [displayedRequests, setDisplayedRequests] = useState<Request[]>([]);
    const [searchBox, setSearchBox] = useState('');
    const [requestsVisible, setRequestsVisible] = useState(false);
    const [numResults, setNumResults] = useState(0);

    useEffect(() => {
        getRequests()
            .then(results => {
                setRequests(results.results);
                setNumResults(results.count);
            });
    }, []);

    useEffect(() => {
        setDisplayedRequests(requests);
    }, [requests]);

    // Handle typing for input changes
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchBox(value);

        if (!requests) {
            setDisplayedRequests([]);
            return;
        }

        const searchKey = value.toLowerCase();

        if (value === '') {
            setDisplayedRequests(requests);
        } else {
            setDisplayedRequests(
                requests.filter(user =>
                    user &&
                    (
                        (user.firstName?.toLowerCase().includes(searchKey)) ||
                        (user.lastName?.toLowerCase().includes(searchKey)) ||
                        (user.email?.toLowerCase().includes(searchKey))
                    )
                )
            );
        }
    };


    // Handle typing for form submit
    const handleFormSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (searchBox === '') {
            setDisplayedRequests(requests);
        } else {
            const searchKey = searchBox.toLowerCase();
            setDisplayedRequests(requests.filter(user =>
                user.firstName.toLowerCase().includes(searchKey) ||
                user.lastName.toLowerCase().includes(searchKey) ||
                user.email.toLowerCase().includes(searchKey)
            ));
        }
    };

    return (
        <Paper sx={{textAlign: 'center', padding: 3}}>
            <Stack direction='column' spacing={1} alignContent="center">
                <Stack textAlign='center' direction='row' justifyContent='center' spacing={1}>
                    <Typography variant="h4">
                        Pending Requests
                    </Typography>
                    {numResults > 0 &&
                        <Badge badgeContent={numResults} color="primary">
                            <FeedbackIcon color="action"/>
                        </Badge>
                    }
                </Stack>
                <Divider variant={'fullWidth'}/>
                {numResults > 0 ? (
                    <>
                        <form onSubmit={handleFormSubmit}>
                            <TextField
                                label="Search by name or email"
                                variant="outlined"
                                onChange={handleInputChange}
                                value={searchBox}
                                fullWidth
                                InputProps={{
                                    endAdornment:
                                        <InputAdornment position="end">
                                            <IconButton type="submit">
                                                <SearchIcon/>
                                            </IconButton>
                                        </InputAdornment>
                                }}
                            />
                        </form>
                        <Stack direction="row" justifyContent="center" spacing={2}>
                            <Button
                                size="small"
                                variant="outlined"
                                sx={{maxWidth: 'fit-content', alignSelf: 'center'}}
                                onClick={() => setRequestsVisible(!requestsVisible)}
                            >
                                {requestsVisible ? "Hide Requests" : "Show Requests"}
                            </Button>
                        </Stack>
                    </>
                ) : (
                    <Typography>No Pending Accounts</Typography>
                )}
                <Collapse in={requestsVisible}>
                    <Box
                        sx={{
                            maxHeight: 400,
                            overflowY: 'auto',
                            mt: 1,
                            pr: 1, // prevents scrollbar overlap
                        }}
                    >
                        {displayedRequests?.map((request) => (
                            <ApprovalPaper key={request.id} request={request}/>
                        ))}
                    </Box>
                </Collapse>
            </Stack>
        </Paper>
    );
}

// Props for ApprovalPaper
interface ApprovalPaperProps {
    request: Request;
}

const ApprovalPaper: React.FC<ApprovalPaperProps> = ({request}) => {
    const [optionSelected, setOptionSelected] = useState<'Approved' | 'Denied' | null>(null);

    const handleUpdateReq = async (user: Request, isApproved: boolean) => {
        try {
            const data = await UpdateRequest(user, isApproved);
            enqueueSnackbar(data.message || 'There was an error.', {variant: data.variant || 'error'});
            setOptionSelected(isApproved ? 'Approved' : 'Denied');
        } catch (err) {
            enqueueSnackbar('There was an error.', {variant: 'error'});
        }
    }

    return (
        <Paper elevation={3} sx={{paddingX: 2, paddingY: 0.75, marginY: 1}}>
            <Stack direction='row' spacing={2} alignContent='center'>
                <Typography textAlign='left' flexGrow={1}>
                    {request.firstName} {request.lastName}
                </Typography>
                <Box>
                    <IconButton color='success' onClick={() => handleUpdateReq(request, true)}>
                        {optionSelected === 'Approved' ? <CheckCircleIcon/> : <CheckCircleOutlineIcon/>}
                    </IconButton>
                    <Typography variant='body2' color='green'>Approve</Typography>
                </Box>
                <Box>
                    <Divider orientation='vertical' sx={{height: '100%', color: 'white'}}/>
                </Box>
                <Box>
                    <IconButton color='error' onClick={() => handleUpdateReq(request, false)}>
                        {optionSelected === 'Denied' ? <DoDisturbOnIcon/> : <DoDisturbOnOutlinedIcon/>}
                    </IconButton>
                    <Typography variant='body2' color='error'>Decline</Typography>
                </Box>
            </Stack>
        </Paper>
    );
};
