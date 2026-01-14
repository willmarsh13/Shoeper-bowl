import React, {useEffect, useState} from 'react'
import ProfilePicks from "./components/ProfilePicks";
import {Typography, Box, Container} from "@mui/material";
import getTeam from "../BuildTeam/logic/getTeam";
import {PlayoffRound, ROUND_CONFIG, RoundConfig} from "../BuildTeam/logic/roundRules";

export default function Profile() {
    const [usersPicks, setUsersPicks] = useState([])
    const [round, setRound] = useState<RoundConfig>({
        key: 'WILD_CARD',
        displayName: '',
        allowedPositions: [''],
        maxPlayersPerTeam: 0,
    })


    useEffect(() => {
        getTeam()
            .then(data => {
                setUsersPicks(data.roster)
                setRound(ROUND_CONFIG[data.round as PlayoffRound])
            })
    }, []);

    return (
        <Container maxWidth="md" sx={{py: 4}}>
            <Typography variant="h4" gutterBottom>
                Profile
            </Typography>

            <Box sx={{mt: 3}}>
                <ProfilePicks picks={usersPicks || []} round={round}/>
            </Box>
        </Container>
    )
}