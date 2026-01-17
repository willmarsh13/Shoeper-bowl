import React, {useEffect, useState} from 'react'
import ProfilePicks from './components/ProfilePicks'
import {
    Typography,
    Box,
    Container,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from '@mui/material'
import getTeam from '../BuildTeam/logic/getTeam'
import {Player, Position, ProfilePick} from '../../Interfaces/Player'

interface Pick {
    slotId: string
    position: Position
    player: Player
}

interface ProfileRound {
    key: string
    displayName: string
}

export default function Profile() {
    const [usersPicks, setUsersPicks] = useState<Record<string, ProfilePick[]>>({})
    const [displayedPicks, setDisplayedPicks] = useState<ProfilePick[]>([])
    const [rounds, setRounds] = useState<ProfileRound[]>([])
    const [round, setRound] = useState<ProfileRound>({
        key: 'WILD_CARD',
        displayName: '',
    })

    useEffect(() => {
        getTeam().then(data => {
            const picksByRound = data.results.reduce(
                (acc: Record<string, ProfilePick[]>, result: any) => {
                    acc[result.round] = result.roster.map((item: any) => ({
                        id: `${result.round}-${item.slotId}`, // stable unique id
                        round: result.round,
                        position: item.position,
                        player: item.player,
                    }))
                    return acc
                },
                {}
            )

            setUsersPicks(picksByRound)
            setRounds(data.rounds)

            const current = data.rounds.find(
                (r: ProfileRound) => r.key === data.currentRound
            )

            if (current) {
                setRound(current)
            }
        })
    }, [])

    useEffect(() => {
        setDisplayedPicks(usersPicks[round.key] ?? [])
    }, [usersPicks, round])

    const handleRoundChange = (roundKey: string) => {
        const selectedRound = rounds.find(r => r.key === roundKey)
        if (selectedRound) {
            setRound(selectedRound)
        }
    }

    return (
        <Container maxWidth="md" sx={{py: 4}}>
            <Typography variant="h4" gutterBottom>
                Profile
            </Typography>

            {/* Round selector */}
            <Box sx={{mt: 2, mb: 3}}>
                <FormControl fullWidth>
                    <InputLabel id="round-select-label">Round</InputLabel>
                    <Select
                        labelId="round-select-label"
                        value={round.key}
                        label="Round"
                        onChange={e => handleRoundChange(e.target.value)}
                    >
                        {rounds.map(r => (
                            <MenuItem key={r.key} value={r.key}>
                                {r.displayName}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>

            {/* Picks */}
            <Box sx={{mt: 3}}>
                <ProfilePicks picks={displayedPicks}/>
            </Box>
        </Container>
    )
}