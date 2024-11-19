import { StatusBar } from "expo-status-bar";
import React, { useCallback, useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";

import Timer from "./components/timer/timer";
import Navbar from "./components/navbar/navbar";
import { createScramble } from "./utils/utils";

import { PuzzleType } from "./utils/types";
const Home = (): React.JSX.Element => {
  const [puzzleType, setPuzzleTypes] = useState<PuzzleType>("3x3");
  const [currentScramble, setCurrentScramble] = useState<string>(
    "Generating Scramble...",
  );

  const generateScramble = useCallback((): void => {
    setCurrentScramble(createScramble(puzzleType));
  }, [puzzleType]);

  useEffect(() => {
    generateScramble();
  }, [generateScramble]);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar style="light" backgroundColor="black" />
      <Navbar scramble={currentScramble} puzzleType={puzzleType} page="Home" />
      <Timer generateScramble={generateScramble} />
    </SafeAreaView>
  );
};

export default Home;
