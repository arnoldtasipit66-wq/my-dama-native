import React, { useState, useEffect } from 'react';

// Sukat ng board (8x8)
const BOARD_SIZE = 8;

// Mga uri ng piyesa
const EMPTY = 0;
const WHITE = 1;
const BLACK = 2;
const WHITE_KING = 3;
const BLACK_KING = 4;

export default function App() {
  const [board, setBoard] = useState([]);
  const [selected, setSelected] = useState(null); // { r, c }
  const [turn, setTurn] = useState(WHITE);

  // Initialize Board pagka-load ng app
  useEffect(() => {
    resetGame();
  }, []);

  const resetGame = () => {
    let newBoard = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(EMPTY));
    
    // Setup pieces (Rows 0-2 for Black, Rows 5-7 for White)
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        if ((r + c) % 2 === 1) {
          if (r < 3) newBoard[r][c] = BLACK;
          if (r > 4) newBoard[r][c] = WHITE;
        }
      }
    }
    setBoard(newBoard);
    setTurn(WHITE);
    setSelected(null);
  };

  const handleSquarePress = (r, c) => {
    const piece = board[r][c];

    // 1. Pagpili ng sariling piyesa
    if (piece !== EMPTY && (piece === turn || piece === turn + 2)) {
      setSelected({ r, c });
      return;
    }

    // 2. Paggalaw (kung may napili na)
    if (selected) {
      const moveResult = validateAndMove(selected.r, selected.c, r, c);
      if (moveResult) {
        setSelected(null);
      } else {
        // Kung invalid move, tingnan kung ibang sariling piyesa ang pinindot
        if (piece !== EMPTY && (piece === turn || piece === turn + 2)) {
          setSelected({ r, c });
        } else {
          setSelected(null);
        }
      }
    }
  };

  const validateAndMove = (fromR, fromC, toR, toC) => {
    const piece = board[fromR][fromC];
    const target = board[toR][toC];

    // Dapat sa madilim na square lang at walang laman ang target
    if ((toR + toC) % 2 === 0 || target !== EMPTY) return false;

    const rowDiff = toR - fromR;
    const colDiff = Math.abs(toC - fromC);
    const direction = (piece === WHITE || piece === WHITE_KING) ? -1 : 1;

    // Simpleng lakad (1 step diagonal)
    const isNormalMove = (piece === WHITE_KING || piece === BLACK_KING || rowDiff === direction) && Math.abs(rowDiff) === 1 && colDiff === 1;

    // Talon (Capture - 2 steps diagonal)
    const isJumpMove = Math.abs(rowDiff) === 2 && colDiff === 2;
    
    if (isJumpMove) {
      const midR = (fromR + toR) / 2;
      const midC = (fromC + toC) / 2;
      const jumpedPiece = board[midR][midC];
      
      // Dapat kalaban ang tinalon
      const isEnemy = turn === WHITE 
        ? (jumpedPiece === BLACK || jumpedPiece === BLACK_KING) 
        : (jumpedPiece === WHITE || jumpedPiece === WHITE_KING);
      
      if (!isEnemy) return false;

      // Execute jump move
      let newBoard = board.map(row => [...row]);
      newBoard[midR][midC] = EMPTY;
      executeMove(fromR, fromC, toR, toC, newBoard);
      return true;
    }

    if (isNormalMove) {
      executeMove(fromR, fromC, toR, toC, board);
      return true;
    }

    return false;
  };

  const executeMove = (fromR, fromC, toR, toC, currentBoard) => {
    let newBoard = currentBoard.map(row => [...row]);
    let piece = newBoard[fromR][fromC];

    // Dama/King Promotion pag umabot sa dulo
    if (piece === WHITE && toR === 0) piece = WHITE_KING;
    if (piece === BLACK && toR === BOARD_SIZE - 1) piece = BLACK_KING;

    newBoard[toR][toC] = piece;
    newBoard[fromR][fromC] = EMPTY;

    setBoard(newBoard);
    setTurn(turn === WHITE ? BLACK : WHITE);
  };

  const renderPiece = (piece) => {
    if (piece === EMPTY) return null;
    const isWhite = piece === WHITE || piece === WHITE_KING;
    const isKing = piece === WHITE_KING || piece === BLACK_KING;

    return (
      <div className={`
        w-4/5 h-4/5 rounded-full flex items-center justify-center border-2 border-black/10 shadow-md
        ${isWhite ? 'bg-white' : 'bg-red-600'}
      `}>
        {isKing && <span className="text-xs">⭐</span>}
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#1a1a1a] p-4 text-white font-sans">
      <h1 className="text-3xl font-black mb-4 tracking-tighter uppercase">Dama Native</h1>
      
      <div className="mb-6 px-6 py-2 bg-[#333] rounded-full border border-white/10 shadow-lg">
        <p className="text-md font-bold">
          Tira ng: <span className={turn === WHITE ? 'text-white' : 'text-red-500'}>
            {turn === WHITE ? 'Puti' : 'Itim'}
          </span>
        </p>
      </div>

      <div className="aspect-square w-full max-w-[380px] bg-[#333] border-4 border-[#333] shadow-2xl flex flex-col overflow-hidden rounded-sm">
        {board.map((row, r) => (
          <div key={r} className="flex flex-1">
            {row.map((cell, c) => {
              const isDark = (r + c) % 2 === 1;
              const isSelected = selected && selected.r === r && selected.c === c;
              return (
                <button
                  key={`${r}-${c}`}
                  onClick={() => handleSquarePress(r, c)}
                  className={`
                    flex-1 flex items-center justify-center transition-all duration-150
                    ${isDark ? 'bg-[#4d4d4d]' : 'bg-white'}
                    ${isSelected ? 'bg-yellow-400 ring-4 ring-yellow-300 ring-inset z-10' : ''}
                  `}
                >
                  {renderPiece(cell)}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      <button 
        onClick={resetGame}
        className="mt-8 px-10 py-3 bg-[#444] rounded-full font-bold border border-[#666] active:scale-90 transition-transform shadow-lg"
      >
        BAGONG LARO
      </button>

      <div className="mt-8 text-[10px] text-gray-500 max-w-[250px] text-center leading-tight opacity-50">
        Ang preview na ito ay gumagamit ng web elements para sa visualization, pero ang logic ay handa para sa iyong Native App conversion.
      </div>
    </div>
  );
}
