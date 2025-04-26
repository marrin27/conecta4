function App() {
  const createBoard = () => Array.from({ length: 6 }, () => Array(7).fill(null));
  const [board, setBoard] = useState(createBoard);
  const [turn, setTurn] = useState(true); // true = red, false = yellow
  const [winner, setWinner] = useState(null);

  // Helper function to get the current player's name
  const getCurrentPlayer = () => (turn ? "ROJO" : "AMARILLO");

  return (
    <div
      className="App"
      tabIndex={0} // Make the div focusable to capture keydown events
      onKeyDown={handleKeyDown} // Attach the keydown event handler
    >
      <div className="title">
        {winner ? (
          <>
            <h1 style={{ color: turn ? 'red' : 'yellow' }}>
              ¡Ganó el jugador {getCurrentPlayer()}!
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
            Es el turno del jugador {getCurrentPlayer()}
          </h1>
        )}
      </div>
      <table className="connect4-board">
        <tbody>
          {generateBoard()}
        </tbody>
      </table>
    </div>
  );
}