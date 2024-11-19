import { Drawer as DrawerLayout } from "react-native-drawer-layout";
import { Text } from "./ui/text";
import { ReactNode, useState } from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Drawer({
  children,
  signOut,
}: {
  children: ReactNode;
  signOut: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const insets = useSafeAreaInsets();

  return (
    <DrawerLayout
      open={isOpen}
      onOpen={() => setIsOpen(true)}
      onClose={() => setIsOpen(false)}
      drawerPosition="right"
      renderDrawerContent={() => {
        return (
          <View
            className="flex-1 items-center bg-background"
            style={{ paddingTop: insets.top }}
          >
            <Text className="mt-auto mb-7" onPress={() => signOut()}>Sign Out</Text>
          </View>
        );
      }}
    >
      {children}
    </DrawerLayout>
  );
}
