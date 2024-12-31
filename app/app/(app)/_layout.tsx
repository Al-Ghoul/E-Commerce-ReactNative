import { Text } from "react-native";
import { Redirect, Tabs } from "expo-router";
import { useSession } from "@/components/AuthContext";
import { ThemeToggle } from "@/components/ThemeToggle";
import Drawer from "@/components/Drawer";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AppLayout() {
  const { session, isLoading, signOut } = useSession();

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center">
        <Text>Loading...</Text>
      </SafeAreaView>
    );
  }

  if (!session) {
    return <Redirect href="/log-in" />;
  }

  return (
    <Drawer signOut={signOut}>
      <Tabs screenOptions={{ tabBarHideOnKeyboard: true }}>
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
          name="categories/index"
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
          name="cart/index"
          options={{
            headerShown: true,
            headerRight: () => <ThemeToggle />,
            title: "Cart",
            tabBarIcon: ({ color }) => (
              <FontAwesome size={28} name="opencart" color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="orders/index"
          options={{
            headerShown: true,
            headerRight: () => <ThemeToggle />,
            title: "Orders",
            tabBarIcon: ({ color }) => (
              <FontAwesome6 size={28} name="money-check-dollar" color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="categories/[id]/products"
          options={{
            headerShown: true,
            headerRight: () => <ThemeToggle />,
            href: null,
          }}
        />
        <Tabs.Screen
          name="orders/[id]/checkout"
          options={{
            headerShown: true,
            headerRight: () => <ThemeToggle />,
            href: null,
          }}
        />
        <Tabs.Screen
          name="orders/[id]/details"
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
