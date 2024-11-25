import { Text } from "react-native";
import { Redirect, Tabs } from "expo-router";
import { useSession } from "@/components/AuthContext";
import { ThemeToggle } from "@/components/ThemeToggle";
import Drawer from "@/components/Drawer";
import FontAwesome from "@expo/vector-icons/FontAwesome";

export default function AppLayout() {
  const { session, isLoading, signOut } = useSession();

  if (isLoading) {
    return <Text>Loading...</Text>;
  }

  if (!session) {
    return <Redirect href="/sign-in" />;
  }

  return (
    <Drawer signOut={signOut}>
      <Tabs>
        <Tabs.Screen
          name="index"
          options={{
            headerShown: true,
            headerRight: () => <ThemeToggle />,
            title: "Home",
            tabBarIcon: ({ color }) => (
              <FontAwesome size={28} name="home" color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="categories"
          options={{
            headerShown: true,
            headerRight: () => <ThemeToggle />,
            title: "Categories",
            tabBarIcon: ({ color }) => (
              <FontAwesome size={28} name="th-large" color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="category/[id]"
          options={{
            headerShown: true,
            headerRight: () => <ThemeToggle />,
            href: null,
          }}
        />
      </Tabs>
    </Drawer>
  );
}
