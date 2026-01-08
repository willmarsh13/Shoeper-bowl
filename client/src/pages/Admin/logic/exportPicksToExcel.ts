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

    const positions = roundConfig.allowedPositions;

    // Prepare rows: each row is Name, Email, then players by position
    const rows = accounts.map(account => {
        const pickMap: Record<string, string> = {};
        const roster = account.picks?.[0]?.roster ?? [];

        roster.forEach(pick => {
            if (pick.position && pick.player?.full_name && pick.player?.team) {
                pickMap[pick.position] = `${pick.player.full_name} - ${pick.player.team}`;
            }
        });

        return [
            `${account.firstName} ${account.lastName}`,
            account.Email,
            ...positions.map(pos => pickMap[pos] ?? "")
        ];
    });

    // Build worksheet
    const wsData = [
        ["Name", "Email", ...positions], // header row
        ...rows
    ];

    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Auto-fit columns (approximate by string length)
    const colWidths = wsData[0].map((_, colIndex) => {
        return {
            wch: Math.max(
                ...wsData.map(row => (row[colIndex] ? row[colIndex].toString().length : 0)),
                10 // minimum width
            )
        };
    });
    ws['!cols'] = colWidths;
    ws['!freeze'] = { xSplit: 0, ySplit: 1 };

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Picks');

    // Generate Excel file
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    FileSaver.saveAs(blob, `shoeper-bowl-picks-${dayjs().format("YYYY-MM-DD")}.xlsx`);
}
