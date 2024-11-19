import { useSession } from "@/components/AuthContext";
import { View } from "react-native";
import { Text } from "~/components/ui/text";

export default function Index() {
  const { signOut } = useSession();

  return (
    <View className="flex-1 items-center justify-center">
      <Text
        onPress={() => {
          signOut();
        }}
      >
        Sign Out
      </Text>
    </View>
  );
}
