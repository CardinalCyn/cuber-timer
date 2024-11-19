import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Drawer } from "expo-router/drawer";
import { Ionicons } from "@expo/vector-icons";
import { allScreens } from "./utils/constants";

export default function Layout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        screenOptions={{
          drawerItemStyle: { display: "none" },
        }}
      >
        {allScreens.map((screen) => (
          <Drawer.Screen
            key={screen.name}
            name={screen.name}
            options={{
              headerShown: false,
              drawerLabel: screen.drawerLabel,
              drawerItemStyle: { display: "flex" },
              drawerIcon: ({ size, color }) => (
                <Ionicons name={screen.ioniconName} size={size} color={color} />
              ),
            }}
          />
        ))}
      </Drawer>
    </GestureHandlerRootView>
  );
}
