import React from "react";
import { StyleSheet, TouchableWithoutFeedback, View } from "react-native";

import TimeDisplay from "./timeDisplay";

type ControlProps = {
  handleRightButtonPress: () => void;
  centiseconds: number;
};
function Control({
  handleRightButtonPress,
  centiseconds,
}: ControlProps): React.JSX.Element {
  return (
    <TouchableWithoutFeedback onPress={() => handleRightButtonPress()}>
      <View style={styles.opacity}>
        <TimeDisplay centiseconds={centiseconds} />
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  opacity: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default React.memo(Control);
