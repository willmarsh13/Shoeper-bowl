import React, {useEffect, useState} from 'react'
import ProfilePicks from "./components/ProfilePicks";
import {Typography, Box, Container} from "@mui/material";
import getTeam from "../BuildTeam/logic/getTeam";

export default function Profile() {
    const [usersPicks, setUsersPicks] = useState([])
    useEffect(() => {
        getTeam()
            .then(data => {
                setUsersPicks(data.roster)
            })
    }, []);

    return (
        <Container maxWidth="md" sx={{py: 4}}>
            <Typography variant="h4" gutterBottom>
                Profile
            </Typography>

            <Box sx={{mt: 3}}>
                <ProfilePicks picks={usersPicks || []}/>
            </Box>
        </Container>
    )
}