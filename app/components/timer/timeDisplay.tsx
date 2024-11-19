import React from "react";
import { StyleSheet, Text } from "react-native";

type TimeDisplayProps = {
  centiseconds: number;
};
function TimeDisplay({ centiseconds }: TimeDisplayProps): React.JSX.Element {
  return <Text style={styles.timeDisplay}>{displayTime(centiseconds)}</Text>;
}
const styles = StyleSheet.create({
  timeDisplay: {
    fontSize: 100,
  },
});

const displayTime = (centiseconds: number): string => {
  let minutes = 0;
  let seconds = 0;

  if (centiseconds < 0) {
    centiseconds = 0;
  }

  if (centiseconds < 100) {
    return `0:${padToTwo(centiseconds)}`;
  }

  const remainCentiseconds = centiseconds % 100;
  seconds = (centiseconds - remainCentiseconds) / 100;

  if (seconds < 60) {
    return `${seconds}:${padToTwo(remainCentiseconds)}`;
  }

  const remainSeconds = seconds % 60;
  minutes = (seconds - remainSeconds) / 60;

  return `${minutes}:${padToTwo(remainSeconds)}:${padToTwo(
    remainCentiseconds,
  )}`;
};

const padToTwo = (number: number): string => {
  return number <= 9 ? `0${number}` : number.toString();
};

export default TimeDisplay;
