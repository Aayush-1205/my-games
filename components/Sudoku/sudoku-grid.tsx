const SudokuGrid = ({
  board,
  puzzle,
  selected,
  setSelected,
}: {
  board: number[][];
  puzzle: number[][];
  selected: number[] | null;
  setSelected: (row: number, col: number) => void;
}) => {
  const cellStyle = (ridx: number, cidx: number) => {
    if (selected && ridx === selected[0]) {
      return "bg-blue-100";
    } else if (selected && cidx === selected[1]) {
      return "bg-blue-100";
    } else if (
      selected &&
      Math.floor(ridx / 3) === Math.floor(selected[0] / 3) &&
      Math.floor(cidx / 3) === Math.floor(selected[1] / 3)
    ) {
      return "bg-blue-100";
    }
  };

  return (
    <div className="w-fit mx-auto mt-8 rounded-md p-4 border border-black bg-white">
      <table className="border-collapse">
        <tbody>
          {board.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              className="nth-3:border-b-2 nth-6:border-b-2 nth-9:border-b-2 nth-1:border-t-2"
            >
              {row.map((cell, colIndex) => {
                const isPreFilled = puzzle[rowIndex][colIndex] !== null;
                return (
                  <td
                    key={colIndex}
                    className={`border border-black p-0 nth-3:border-r-2 nth-6:border-r-2 nth-9:border-r-2 nth-1:border-l-2 ${cellStyle(
                      rowIndex,
                      colIndex
                    )}`}
                  >
                    <input
                      type="number"
                      maxLength={1}
                      value={cell === null ? "" : cell}
                      readOnly={isPreFilled}
                      className="size-12 text-center text-lg border-none outline-none bg-transparent text-black cursor-default focus:caret-transparent focus:bg-blue-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      onFocus={() => setSelected(rowIndex, colIndex)}
                      onClick={() => setSelected(rowIndex, colIndex)}
                      // onChange={(e) => {}}
                    />
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SudokuGrid;
