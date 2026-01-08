import * as XLSX from 'xlsx';
import FileSaver from 'file-saver';
import dayjs from 'dayjs';
import {RoundConfig} from "../../BuildTeam/logic/roundRules";
import {AccountRequest} from "../components/Accounts";

export function exportPicksToExcel(
    accounts: AccountRequest[],
    roundConfig?: RoundConfig
) {
    if (!roundConfig) return;

    // Build unique slot names from allowedPositions
    const slotNames: string[] = [];
    const positionCounts: Record<string, number> = {};
    roundConfig.allowedPositions.forEach(pos => {
        positionCounts[pos] = (positionCounts[pos] || 0) + 1;
        const count = positionCounts[pos];
        slotNames.push(count > 1 ? `${pos}${count}` : pos); // QB, RB1, RB2, WR1, WR2, TE, etc.
    });

    const positions = roundConfig.allowedPositions;

    // Prepare rows
    const rows = accounts.map(account => {
        const roster = account.picks?.[0]?.roster ?? [];
        const rowData: string[] = [
            `${account.firstName} ${account.lastName}`,
            account.Email
        ];

        // Track how many times we’ve used each position for this account
        const usedCount: Record<string, number> = {};

        positions.forEach(pos => {
            usedCount[pos] = (usedCount[pos] || 0) + 1;
            const currentIndex = usedCount[pos];

            // Find the nth occurrence of this position in roster
            const pick = roster.filter(p => p.position === pos)[currentIndex - 1];

            if (pick && pick.player) {
                rowData.push(`${pick.player.full_name} - ${pick.player.team}`);
            } else {
                rowData.push("");
            }
        });

        return rowData;
    });

    // Build worksheet
    const wsData = [
        ["Name", "Email", ...slotNames], // header row
        ...rows
    ];

    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Auto-fit columns
    ws['!cols'] = wsData[0].map((_, colIndex) => ({
        wch: Math.max(
            ...wsData.map(row => (row[colIndex] ? row[colIndex].toString().length : 0)),
            10
        )
    }));
    ws['!freeze'] = { xSplit: 0, ySplit: 1 };

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Picks');

    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    FileSaver.saveAs(blob, `shoeper-bowl-picks-${dayjs().format("YYYY-MM-DD")}.xlsx`);
}
