import { Text } from "react-native";
import { Redirect, Stack } from "expo-router";
import { useSession } from "@/components/AuthContext";
import { ThemeToggle } from "@/components/ThemeToggle";
import Drawer from "@/components/Drawer";

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
        <Stack>
          <Stack.Screen
            name="index"
            options={{ headerShown: false, headerRight: () => <ThemeToggle /> }}
          />
        </Stack>
      </Drawer>
  );
}
