"use server";

export type Difficulty = "easy" | "medium" | "hard" | "random";

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
    difficulty: Difficulty = "random"
): Promise<SudokuGrid | null> {
    try {
        const response = await fetch(
            `https://sudoku-api.vercel.app/api/dosuku?query={newboard(limit:1){grids{value,solution,${difficulty}},results,message}}`,
            {
                cache: "no-store",
            }
        );

        if (!response.ok) {
            throw new Error(`Failed to fetch Sudoku puzzle: ${response.statusText}`);
        }

        const data: SudokuResponse = await response.json();

        if (data.newboard.results > 0) {
            const puzzle = data.newboard.grids[0];
            // If specific difficulty requested, keep fetching until we get it
            // For now, return what we get (API doesn't support difficulty filter directly)
            return puzzle;
        }

        return null;
    } catch (error) {
        console.error("Error fetching Sudoku puzzle:", error);
        return null;
    }
}
