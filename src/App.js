import './App.css';
import React, { useState } from 'react';

function App() {
  const createBoard = () => Array.from({ length: 6 }, () => Array(7).fill(null));
  const [board, setBoard] = useState(createBoard);
  const [turn, setTurn] = useState(true); // true = red, false = yellow
  const [winner, setWinner] = useState(null);

  function checkWinner(board, row, col, color) {
    const directions = [
      [1, 0],  // vertical
      [0, 1],  // horizontal
      [1, 1],  // diagonal ↘
      [1, -1], // diagonal ↙
    ];

    for (let [dx, dy] of directions) {
      const cellCount=[]

      let count = 1;
      cellCount.push([row, col])
      let r = row - dx;
      let c = col - dy;
      while (r >= 0 && r < 6 && c >= 0 && c < 7 && board[r][c] === color) {
        cellCount.push([r, c])
        count++;
        r -= dx;
        c -= dy;
      }

      r = row + dx;
      c = col + dy;
      while (r >= 0 && r < 6 && c >= 0 && c < 7 && board[r][c] === color) {
        cellCount.push([r, c])
        count++;
        r += dx;
        c += dy;

      }

      if (count >= 4) {
        cellCount.map((cell) => {
          const [r, c] = cell;
          board[r][c] = color + ' winner';
        }
        )
        return true;
      }
    }

    return false;
  }

  function handleColClick(colIndex) {
    if (winner) return;

    const newBoard = board.map(row => [...row]);

    for (let row = board.length - 1; row >= 0; row--) {
      if (newBoard[row][colIndex] === null) {
        const color = turn ? 'red' : 'yellow';
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
  }

  function handleKeyDown(event) {
    if (winner) return;

    const key = event.key;
    if (['1', '2', '3', '4', '5', '6', '7'].includes(key)) {
      const colIndex = parseInt(key) - 1;
      handleColClick(colIndex);
    }
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

  return (
    <div
      className="App"
      tabIndex={0} // Make the div focusable to capture keydown events
      onKeyDown={handleKeyDown} // Attach the keydown event handler
    >
  <div className="title">
  {winner ? (
    <h1 style={{ color: turn ? 'red' : 'yellow' }}>
      ¡Ganó el jugador {turn ? "ROJO" : "AMARILLO"}!
    </h1>
  ) : (
    <h1 style={{ color: turn ? 'red' : 'yellow' }}>
      Es el turno del jugador {turn ? "ROJO" : "AMARILLO"}
    </h1>
  )}
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
</div>
      <table className="connect4-board">
        <tbody>
          {generateBoard()}
        </tbody>
      </table>
    </div>
  );
}

export default App;