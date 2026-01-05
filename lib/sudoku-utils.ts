export type Board = (number | null)[][];

export function isValid(board: Board, row: number, col: number, num: number): boolean {
    // Check row
    for (let x = 0; x < 9; x++) {
        if (board[row][x] === num) return false;
    }

    // Check column
    for (let x = 0; x < 9; x++) {
        if (board[x][col] === num) return false;
    }

    // Check 3x3 box
    const startRow = row - (row % 3);
    const startCol = col - (col % 3);
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (board[i + startRow][j + startCol] === num) return false;
        }
    }

    return true;
}

export function getConflicts(board: Board, row: number, col: number): { row: boolean; col: boolean; box: boolean } {
    const num = board[row][col];
    if (num === null) return { row: false, col: false, box: false };

    let rowConflict = false;
    let colConflict = false;
    let boxConflict = false;

    // Check row
    for (let x = 0; x < 9; x++) {
        if (x !== col && board[row][x] === num) {
            rowConflict = true;
            break;
        }
    }

    // Check column
    for (let x = 0; x < 9; x++) {
        if (x !== row && board[x][col] === num) {
            colConflict = true;
            break;
        }
    }

    // Check 3x3 box
    const startRow = row - (row % 3);
    const startCol = col - (col % 3);
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            const r = i + startRow;
            const c = j + startCol;
            if ((r !== row || c !== col) && board[r][c] === num) {
                boxConflict = true;
                break;
            }
        }
        if (boxConflict) break;
    }

    return { row: rowConflict, col: colConflict, box: boxConflict };
}

export function isBoardComplete(board: Board): boolean {
    return board.every((row) => row.every((cell) => cell !== null));
}

export function isBoardCorrect(board: Board, solution: number[][]): boolean {
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            if (board[r][c] !== solution[r][c]) return false;
        }
    }
    return true;
}

export function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}
