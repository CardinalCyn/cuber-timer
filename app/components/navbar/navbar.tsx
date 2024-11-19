import Ionicons from "@expo/vector-icons/Ionicons";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import { ParamListBase, useNavigation } from "@react-navigation/native";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { puzzleTypeMap } from "@/app/utils/constants";
import { C2F2LLevel, PuzzleType, SubsetScrambleType } from "@/app/utils/types";

type NavbarHomeProps = {
  scramble: string;
  puzzleType: PuzzleType;
  page: "Home";
};

type NavbarC2F2LProps = {
  scramble: string;
  currentLevel: C2F2LLevel;
  page: "C2F2L";
};

type NavbarSubsetScrambleProps = {
  scramble: string;
  subsetScrambleType: SubsetScrambleType;
  page: "Subset Scrambles";
};

type NavbarScrambleProps =
  | NavbarC2F2LProps
  | NavbarHomeProps
  | NavbarSubsetScrambleProps;

type NavbarSettingsProps = {
  page: "Settings";
};

type NavbarProps = NavbarScrambleProps | NavbarSettingsProps;
export default function Navbar(props: NavbarProps): React.JSX.Element {
  const nav = useNavigation<DrawerNavigationProp<ParamListBase>>();

  const toggleDrawerView = (): void => {
    nav.toggleDrawer();
  };
  return (
    <View>
      <View style={styles.container}>
        {((): React.JSX.Element => {
          switch (props.page) {
            case "Home":
              return (
                <View style={styles.puzzleSelection}>
                  <Ionicons
                    name="settings"
                    style={styles.settingIconLeft}
                    size={30}
                    onPress={toggleDrawerView}
                  />
                  <View style={styles.mainText}>
                    <Text style={styles.timerHeaderText}>
                      {puzzleTypeMap[props.puzzleType]}
                    </Text>
                    <Ionicons
                      name="caret-down-outline"
                      size={30}
                      color="black"
                      style={styles.caretIcon}
                    />
                  </View>
                  <Ionicons
                    name="settings"
                    style={styles.settingIconRight}
                    size={30}
                    onPress={toggleDrawerView}
                  />
                </View>
              );
            case "C2F2L":
              return (
                <View>
                  <View style={styles.c2f2lSelection}>
                    <Ionicons
                      name="settings"
                      style={styles.settingIconLeft}
                      size={30}
                      onPress={toggleDrawerView}
                    />
                    <View style={styles.mainText}>
                      <Text style={styles.timerHeaderText}>{props.page}</Text>
                      <Ionicons
                        name="caret-down-outline"
                        size={30}
                        color="black"
                        style={styles.caretIcon}
                      />
                    </View>
                    <Ionicons
                      name="settings"
                      style={styles.settingIconRight}
                      size={30}
                      onPress={toggleDrawerView}
                    />
                  </View>
                  <Text style={styles.c2f2lText}>
                    Current Level: {props.currentLevel}
                  </Text>
                </View>
              );
            case "Subset Scrambles":
              return (
                <View>
                  <View style={styles.c2f2lSelection}>
                    <Ionicons
                      name="settings"
                      style={styles.settingIconLeft}
                      size={30}
                      onPress={toggleDrawerView}
                    />
                    <View style={styles.mainText}>
                      <Text style={styles.timerHeaderText}>{props.page}</Text>
                      <Ionicons
                        name="caret-down-outline"
                        size={30}
                        color="black"
                        style={styles.caretIcon}
                      />
                    </View>
                    <Ionicons
                      name="settings"
                      style={styles.settingIconRight}
                      size={30}
                      onPress={toggleDrawerView}
                    />
                  </View>
                  <Text style={styles.c2f2lText}>
                    Subset Scramble Type: {props.subsetScrambleType}
                  </Text>
                </View>
              );
            case "Settings":
              return (
                <View style={styles.c2f2lSelection}>
                  <View style={styles.mainText}>
                    <Text style={styles.timerHeaderText}>{props.page}</Text>
                  </View>
                </View>
              );
            default:
              return <>Blank page???</>;
          }
        })()}
      </View>
      {"scramble" in props && (
        <Text style={styles.scramble}>{props.scramble}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  scramble: {
    marginTop: 10,
    marginHorizontal: 10,
    justifyContent: "center",
    alignContent: "center",
    textAlign: "center",
    fontSize: 24,
  },
  container: {
    marginTop: 20,
    marginBottom: 10,
  },
  puzzleSelection: {
    flexDirection: "row",
    alignItems: "center",
    flexGrow: 1,
    justifyContent: "space-between",
  },
  settingIconLeft: {
    marginLeft: 20,
  },
  settingIconRight: {
    marginRight: 20,
    opacity: 0,
  },
  mainText: {
    flexDirection: "row",
    alignItems: "center",
  },
  c2f2lSelection: {
    flexDirection: "row",
    alignItems: "center",
    flexGrow: 1,
    justifyContent: "space-between",
  },
  timerHeaderText: {
    fontSize: 50,
    textAlign: "center",
  },
  c2f2lText: {
    fontSize: 20,
    textAlign: "center",
  },
  caretIcon: {
    marginTop: 10, // Adjust this value as needed
  },
});
