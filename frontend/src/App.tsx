import { useState } from "react";

export default function App() {
  const [grid, setGrid] = useState<boolean[][]>(
    Array.from({ length: 20 }).map((_, row) =>
      Array.from({ length: 20 }).map((_, col) => row === 0 && col === 0),
    ),
  );
  const [hist, setHist] = useState<boolean[][][]>([]);

  return (
    <>
      <button
        disabled={hist.length === 0}
        onClick={() => {
          const hist2 = [...hist];
          setGrid(hist2.pop()!);
          setHist(hist2);
        }}
      >
        Undo
      </button>
      <table>
        <tbody>
          {grid.map((row, rowNum) => (
            <tr key={rowNum}>
              {row.map((col, colNum) => (
                <td key={colNum}>
                  <button
                    style={{
                      backgroundColor:
                        colNum === 0 && rowNum === 0
                          ? `oklch(0.8618 0.08281250000000001 20)`
                          : colNum === 0
                            ? `oklch(0.8418 0.08281250000000001 180)`
                            : rowNum === 0
                              ? `oklch(0.8506 0.08281250000000001 250)`
                              : `oklch(0.8613 0.08281250000000001 320)`,
                    }}
                    disabled={!col}
                    onClick={() => {
                      if (grid[rowNum + 1][colNum] || grid[rowNum][colNum + 1]) return;
                      setHist([...hist, grid]);
                      setGrid(
                        grid.map((row, y) =>
                          row.map((col, x) =>
                            y === rowNum && x === colNum
                              ? false
                              : y === rowNum + 1 && x === colNum
                                ? true
                                : y === rowNum && x === colNum + 1
                                  ? true
                                  : col,
                          ),
                        ),
                      );
                    }}
                  >
                    {col ? "X" : "O"}
                  </button>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
