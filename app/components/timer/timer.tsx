import React, { useCallback, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";

import Control from "./control";

type TimerProps = {
  generateScramble: () => void;
};
export default function Timer({
  generateScramble,
}: TimerProps): React.JSX.Element {
  const [centiseconds, setCentiseconds] = useState<number>(0);
  const [isRunning, setRunning] = useState<boolean>(false);
  const timer = useRef<NodeJS.Timeout | null>(null); // Use NodeJS.Timeout type

  //starts the timer from 0
  const startTimer = useCallback((): void => {
    generateScramble();
    setCentiseconds(0);
    const start = Math.floor(Date.now() / 10);
    const interval = setInterval(() => {
      setCentiseconds(Math.floor(Date.now() / 10) - start);
    }, 10);

    if (timer.current !== null) {
      clearInterval(timer.current);
    }

    timer.current = interval;
  }, [generateScramble]);
  const stopTimer = (): void => {
    if (timer.current !== null) {
      clearInterval(timer.current);
    }
  };
  const handleRightButtonPress = useCallback(() => {
    if (!isRunning) {
      startTimer();
    } else {
      stopTimer();
    }
    setRunning((previousState: boolean) => !previousState);
  }, [isRunning, startTimer]);

  return (
    <View style={styles.container}>
      <Control
        handleRightButtonPress={handleRightButtonPress}
        centiseconds={centiseconds}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
  },
});
