"use server";

export interface SudokuGrid {
    value: number[][];
    solution: number[][];
    difficulty: string;
}

export interface SudokuResponse {
    newboard: {
        grids: SudokuGrid[];
        results: number;
        message: string;
    };
}

export async function getSudokuPuzzle(
    limit: number = 1
): Promise<SudokuGrid | SudokuGrid[] | null> {
    try {
        const response = await fetch(
            `https://sudoku-api.vercel.app/api/dosuku?query={newboard(limit:${limit}){grids{value,solution,difficulty},results,message}}`,
            {
                cache: "no-store",
            }
        );

        if (!response.ok) {
            throw new Error(`Failed to fetch Sudoku puzzle: ${response.statusText}`);
        }

        const data: SudokuResponse = await response.json();

        if (data.newboard.results > 0) {
            // Return array if limit > 1, otherwise return single puzzle
            if (limit > 1) {
                return data.newboard.grids;
            }
            return data.newboard.grids[0];
        }

        return null;
    } catch (error) {
        console.error("Error fetching Sudoku puzzle:", error);
        return null;
    }
}
