import './App.css';
import React, { useState, useCallback } from 'react';

function App() {
  const createBoard = () => Array.from({ length: 6 }, () => Array(7).fill(null));
  const [board, setBoard] = useState(createBoard);
  const [turn, setTurn] = useState(true); // true = red, false = yellow
  const [winner, setWinner] = useState(null);
  const [isDropping, setIsDropping] = useState(false);

  const checkWinner = useCallback((board, row, col, color) => {
    const directions = [
      [1, 0],  // vertical
      [0, 1],  // horizontal
      [1, 1],  // diagonal ↘
      [1, -1], // diagonal ↙
    ];

    for (let [dx, dy] of directions) {
      const cellCount = [];
      let count = 1;
      cellCount.push([row, col]);

      count += countCells(board, row, col, dx, dy, color, cellCount);
      count += countCells(board, row, col, -dx, -dy, color, cellCount);

      if (count >= 4) {
        highlightWinningCells(board, cellCount, color);
        return true;
      }
    }

    return false;
  }, []);

  const simulateDrop = useCallback(async (board, colIndex, targetRow, color) => {
    for (let dropRow = 0; dropRow <= targetRow; dropRow++) {
      const tempBoard = board.map(r => [...r]);
      tempBoard[dropRow][colIndex] = color;
      if (dropRow > 0) tempBoard[dropRow - 1][colIndex] = null;
      setBoard(tempBoard);
      await new Promise(resolve => setTimeout(resolve, 45));
    }
  }, [setBoard]);

  const handleColClick = useCallback(async (colIndex) => {
    if (winner || isDropping) return;

    setIsDropping(true);
    const newBoard = board.map(row => [...row]);

    for (let row = board.length - 1; row >= 0; row--) {
      if (newBoard[row][colIndex] === null) {
        const color = turn ? 'red' : 'yellow';

        await simulateDrop(newBoard, colIndex, row, color);
        newBoard[row][colIndex] = color;
        setBoard(newBoard);

        if (checkWinner(newBoard, row, colIndex, color)) {
          setWinner(color);
        } else {
          setTurn(!turn);
        }

        break;
      }
    }

    setIsDropping(false);
  }, [board, winner, isDropping, turn, simulateDrop, checkWinner]);

  function countCells(board, row, col, dx, dy, color, cellCount) {
    let count = 0;
    let r = row + dx;
    let c = col + dy;

    while (r >= 0 && r < 6 && c >= 0 && c < 7 && board[r][c] === color) {
      cellCount.push([r, c]);
      count++;
      r += dx;
      c += dy;
    }

    return count;
  }

  function highlightWinningCells(board, cellCount, color) {
    cellCount.forEach(([r, c]) => {
      board[r][c] = `${color} winner`;
    });
  }

  function generateBoard() {
    return board.map((row, rowIndex) => (
      <tr key={rowIndex}>
        {row.map((cell, colIndex) => (
          <td
            key={colIndex}
            className={`cell ${cell || ''}`}
            onClick={() => handleColClick(colIndex)}
          ></td>
        ))}
      </tr>
    ));
  }

  function handleKeyDown(event) {
    if (winner || isDropping) return;

    const key = event.key;
    if (['1', '2', '3', '4', '5', '6', '7'].includes(key)) {
      const colIndex = parseInt(key) - 1;
      handleColClick(colIndex);
    }
  }

  function generateInvisibleButtons() {
    return (
      <div className="invisible-buttons">
        {[...Array(7)].map((_, colIndex) => (
          <button
            key={colIndex}
            className="invisible-button"
            onClick={() => handleColClick(colIndex)}
          ></button>
        ))}
      </div>
    );
  }

  return (
    <div
      className="App"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <div className="title">
        {winner ? (
          <>
            <h1 style={{ color: turn ? 'red' : 'yellow' }}>
              ¡Ganó el jugador {turn ? "ROJO" : "AMARILLO"}!
            </h1>
            <input
              type="button"
              value="Reiniciar"
              onClick={() => {
                setBoard(createBoard());
                setTurn(true);
                setWinner(null);
              }}
              className="restart-button"
            />
          </>
        ) : (
          <h1 style={{ color: turn ? 'red' : 'yellow' }}>
            Es el turno del jugador {turn ? "ROJO" : "AMARILLO"}
          </h1>
        )}
      </div>
      {generateInvisibleButtons()}
      <table className="connect4-board">
        <tbody>
          {generateBoard()}
        </tbody>
      </table>
    </div>
  );
}

export default App;