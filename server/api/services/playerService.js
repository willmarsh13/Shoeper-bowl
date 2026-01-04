const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

const csvPath = path.join(__dirname, '../../data/players/playerInfo.csv');

async function getPlayers() {
    return new Promise((resolve, reject) => {
        const players = [];

        fs.createReadStream(csvPath)
            .pipe(csv())
            .on('data', (row) => {
                if (row.status === 'ACT') {
                    players.push({
                        firstName: row.first_name,
                        lastName: row.last_name,
                        full_name: row.full_name,
                        team: row.team,
                        position: row.position,
                    });
                }
            })
            .on('end', () => {
                resolve(players);
            })
            .on('error', (err) => {
                reject(err);
            });
    });
}

module.exports = {
    getPlayers,
};
