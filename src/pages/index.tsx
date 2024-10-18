import * as React from "react";
import { useState, useEffect, useCallback } from "react";

const FLASH_DURATION = 1000; // 0.7 seconds
const ROUNDS = 2;
const LETTERS_PER_ROUND = 6;

export default function FlashMemoryGame() {
  const [gameState, setGameState] = useState("ready");
  const [currentRound, setCurrentRound] = useState(0);
  const [flashLetters, setFlashLetters] = useState("");
  const [userInput, setUserInput] = useState("");
  const [roundResults, setRoundResults] = useState([] as { timeTaken: number; correctGuesses: number }[]);
  const [startTime, setStartTime] = useState(0);

  const generateLetters = useCallback(() => {
    return Array.from({ length: LETTERS_PER_ROUND }, () =>
      String.fromCharCode(65 + Math.floor(Math.random() * 26))
    ).join("").toUpperCase();
  }, []);

  const startRound = useCallback(() => {
    const letters = generateLetters();
    setFlashLetters(letters);
    setGameState("flashing");
    setStartTime(Date.now());

    setTimeout(() => {
      setGameState("guessing");
    }, FLASH_DURATION);
  }, [generateLetters]);

  const submitGuess = useCallback(() => {
    const endTime = Date.now();
    const timeTaken = (endTime - startTime) / 1000;
    const correctGuessesArray = userInput
      .toUpperCase()
      .split("")
    console.log('correctGuessesArray', correctGuessesArray);
    console.log('flashLetters', flashLetters);
    const amountCorrect = correctGuessesArray.filter((char, index) => char === flashLetters[index]).length;

    setRoundResults([...roundResults, { timeTaken, correctGuesses: amountCorrect }]);
    setUserInput("");

    if (currentRound < ROUNDS - 1) {
      setCurrentRound(currentRound + 1);
      startRound();
    } else {
      setGameState("finished");
    }
  }, [currentRound, flashLetters, roundResults, startTime, userInput]);

  useEffect(() => {
    if (gameState === "ready") {
      const handleKeyPress = () => {
        startRound();
        window.removeEventListener('keydown', handleKeyPress);
      };

      // Add event listener for any key press
      window.addEventListener('keydown', handleKeyPress);
    }
  }, [gameState]);

  const renderContent = () => {
    switch (gameState) {
      case "ready":
        return (
          <div>
            <div className="text-2xl font-bold mb-4">
              Flash Memory Game
            </div>
            <button
              className="btn btn-primary text-lg"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setGameState("flashing");
                }
              }}
            >
              Press Enter to Start
            </button>
          </div>
        );
      case "flashing":
        return (
          <div className="text-4xl font-bold tracking-widest">
            {flashLetters}
          </div>
        );
      case "guessing":
        return (
          <div>
            <div className="text-xl mb-4">
              Enter the letters you saw:
            </div>
            <input
              autoFocus
              className="input w-64 text-lg p-2 border-2 border-gray-300 rounded"
              maxLength={LETTERS_PER_ROUND}
              value={userInput}
              onChange={(e) => setUserInput(e.target.value.toUpperCase())}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  submitGuess();
                }
              }}
            />
            <div>
              <button
                className="btn btn-primary mt-4 text-lg"
                onClick={submitGuess}
              >
                Press Enter to Submit
              </button>
            </div>
          </div>
        );
      case "finished":
        const handleKeyPress = () => {
          window.removeEventListener('keydown', handleKeyPress);
          // reset values
          setGameState("ready");
          setCurrentRound(0);
          setRoundResults([]);
        }
        setTimeout(() => window.addEventListener('keydown', handleKeyPress), 1000);
        const totalCorrect = roundResults.reduce((sum, round) => sum + round?.correctGuesses, 0);
        const totalTime = roundResults.reduce((sum, round) => sum + round?.timeTaken, 0);
        const averageTime = totalTime / ROUNDS;
        return (
          <div>
            <div className="text-2xl font-bold mb-4">
              Game Finished!
            </div>
            <div className="text-xl mb-2">
              Total Correct: {totalCorrect}/{ROUNDS * LETTERS_PER_ROUND}
            </div>
            <div className="text-xl mb-2">
              Total Time: {totalTime.toFixed(2)} seconds
            </div>
            <div className="text-xl mb-4">
              Average Time per round: {averageTime.toFixed(2)} seconds
            </div>
            <button
              className="btn btn-primary text-lg"
              onClick={() => {
                setGameState("ready");
                setCurrentRound(0);
                setRoundResults([]);
              }}
            >
              Press Enter To Play Again
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="h-screen bg-gray-100 flex items-center justify-center">
      {gameState === 'guessing' && (<div className="text-xl mb-4 flex items-center justify-center">
        Round: {currentRound + 1}/{ROUNDS}
      </div>)
      }
      <div>
        {renderContent()}
      </div>
    </div>
  );
}
