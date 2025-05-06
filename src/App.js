import './App.css';
import React, { useState, useCallback, useEffect } from 'react';

function App() {
  const createBoard = () => Array.from({ length: 6 }, () => Array(7).fill(null));
  const [board, setBoard] = useState(createBoard);
  const [turn, setTurn] = useState(true); // true = red, false = yellow
  const [winner, setWinner] = useState(null);
  const [isDropping, setIsDropping] = useState(false);
  const [hoverCol, setHoverCol] = useState(null); // Column under the pointer
  const [redWins, setRedWins] = useState(0);
  const [yellowWins, setYellowWins] = useState(0);
  const [timer, setTimer] = useState(30); // 30 seconds per turn
  const [moveHistory, setMoveHistory] = useState([]); // Stores all moves
  const [currentMoveIndex, setCurrentMoveIndex] = useState(-1); // For move navigation

  // Timer logic
  useEffect(() => {
    if (winner || isDropping) return;

    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev === 1) {
          // If time runs out, switch turns
          setTurn(!turn);
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [turn, winner, isDropping]);

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
      const tempBoard = board.map(r => [...r]); // Clone the board
      tempBoard[dropRow][colIndex] = color; // Set the current drop position
      if (dropRow > 0) tempBoard[dropRow - 1][colIndex] = null; // Clear the previous position
      setBoard(tempBoard); // Update the board state
      await new Promise(resolve => setTimeout(resolve, 45)); // Add a delay for the animation
    }
  }, [setBoard]);

  const handleColClick = useCallback(async (colIndex) => {
    if (isDropping || winner) return;

    setIsDropping(true);
    const newBoard = board.map(row => [...row]);

    for (let row = board.length - 1; row >= 0; row--) {
      if (newBoard[row][colIndex] === null) {
        const color = turn ? 'red' : 'yellow';

        // Simulate the drop animation
        await simulateDrop(newBoard, colIndex, row, color);

        // Save move to history
        setMoveHistory((prev) => [...prev, { board: newBoard, turn, colIndex }]);

        newBoard[row][colIndex] = color; // Set the dropped piece
        setBoard(newBoard);

        if (checkWinner(newBoard, row, colIndex, color)) {
          setWinner(color);
          if (color === 'red') setRedWins((prev) => prev + 1);
          else setYellowWins((prev) => prev + 1);
        } else {
          setTurn(!turn);
        }

        break;
      }
    }

    setTimer(30); // Reset timer for the next turn
    setIsDropping(false);
  }, [checkWinner, board, turn, winner, isDropping, simulateDrop]);

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

  function getDropRow(colIndex) {
    for (let row = board.length - 1; row >= 0; row--) {
      if (board[row][colIndex] === null) {
        return row;
      }
    }
    return null;
  }

  function generateBoard() {
    if (winner) {
      return board.map((row, rowIndex) => (
        <tr key={rowIndex}>
          {row.map((cell, colIndex) => (
            <td
              key={colIndex}
              className={`cell ${cell || ''}`}
            ></td>
          ))}
        </tr>
      ));
    }

    const dropRowByCol = hoverCol !== null ? getDropRow(hoverCol) : null;

    return board.map((row, rowIndex) => (
      <tr key={rowIndex}>
        {row.map((cell, colIndex) => {
          const isHoverCol = hoverCol === colIndex;
          const isDropCell = isHoverCol && rowIndex === dropRowByCol;

          const cellColorClass = cell || '';
          const hoverClass = isHoverCol ? 'highlight-column' : '';
          const dropClass = isDropCell ? `highlight-drop ghost-${turn ? 'red' : 'yellow'}` : '';

          return (
            <td
              key={colIndex}
              className={`cell ${cellColorClass} ${hoverClass} ${dropClass}`}
              onClick={() => handleColClick(colIndex)}
              onMouseEnter={() => setHoverCol(colIndex)}
              onMouseLeave={() => setHoverCol(null)}
            ></td>
          );
        })}
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
            onMouseEnter={() => setHoverCol(colIndex)}
            onMouseLeave={() => setHoverCol(null)}
          ></button>
        ))}
      </div>
    );
  }

  const replayLastMove = () => {
    if (moveHistory.length === 0) {
      alert('No moves to replay!');
      return;
    }
    const confirmReplay = window.confirm('Do you want to replay the last move?');
    if (confirmReplay) {
      const lastMove = moveHistory[moveHistory.length - 1];
      setBoard(lastMove.board);
      setTurn(lastMove.turn);
    }
  };

  const navigateMoves = (direction) => {
    if (direction === 'first') setCurrentMoveIndex(0);
    if (direction === 'last') setCurrentMoveIndex(moveHistory.length - 1);
    if (direction === 'next' && currentMoveIndex < moveHistory.length - 1)
      setCurrentMoveIndex((prev) => prev + 1);
    if (direction === 'prev' && currentMoveIndex > 0)
      setCurrentMoveIndex((prev) => prev - 1);

    if (currentMoveIndex >= 0 && currentMoveIndex < moveHistory.length) {
      const move = moveHistory[currentMoveIndex];
      setBoard(move.board);
      setTurn(move.turn);
    }
  };

  const startNewGame = () => {
    setBoard(createBoard());
    setTurn(true);
    setWinner(null);
    setTimer(30);
    setMoveHistory([]);
    setCurrentMoveIndex(-1);
  };

  function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  return (
    <div className="App" tabIndex={0} onKeyDown={handleKeyDown}>
      <div className="game-container">
        <div className="board-container">
          {generateInvisibleButtons()}
          <table className="connect4-board">
            <tbody>{generateBoard()}</tbody>
          </table>
        </div>
        <div className="control-panel">
          <div className="player-info">
            <div className={`player red ${turn ? 'active' : ''} ${winner === 'red' ? 'winner' : ''}`}>
              <span className="player-name">🔴 Red</span>
              <span className={`player-timer ${turn && timer <= 10 ? 'danger' : ''}`}>
                {turn ? formatTime(timer) : '-'}
              </span>
              <span className="player-wins">🏆 {redWins}</span>
            </div>
            <hr /> {/* Horizontal separator */}
            <div className={`player yellow ${!turn ? 'active' : ''} ${winner === 'yellow' ? 'winner' : ''}`}>
              <span className="player-name">🟡 Yellow</span>
              <span className={`player-timer ${!turn && timer <= 10 ? 'danger' : ''}`}>
                {!turn ? formatTime(timer) : '-'}
              </span>
              <span className="player-wins">🏆 {yellowWins}</span>
            </div>
          </div>
          <div className="game-controls">
            <button onClick={() => navigateMoves('first')} title="First Move" disabled={!winner}>⏮️</button>
            <button onClick={() => navigateMoves('prev')} title="Previous Move" disabled={!winner}>◀️</button>
            <button onClick={() => navigateMoves('next')} title="Next Move" disabled={!winner}>▶️</button>
            <button onClick={() => navigateMoves('last')} title="Last Move" disabled={!winner}>⏭️</button>
            <button onClick={replayLastMove} title="Replay Last Move" >🔄</button>
            <button onClick={startNewGame} title="New Game">🆕</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;