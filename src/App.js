import logo from './logo.svg';
import './App.css';

function App() {
  return (
    <div className="App">
    <h1>Connect 4</h1>
    <table className="connect4-board">
      <tbody>
        {Array.from({ length: 6 }).map((_, rowIndex) => (
          <tr key={rowIndex}>
            {Array.from({ length: 7 }).map((_, colIndex) => (
              <td key={colIndex} className="cell"></td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
    
  );
}

export default App;
