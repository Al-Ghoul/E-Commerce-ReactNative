import { useColorScheme } from "@/lib/useColorScheme";
import { Link } from "expo-router";
import { View } from "react-native";
import { icons } from "lucide-react-native";
import Icon from "@/lib/icons/Icon";
import { Text } from "./ui/text";

export default function CategoryCard({ category }: { category: Category }) {
  const { isDarkColorScheme } = useColorScheme();
  
  return (
    <Link
      key={category.id}
      href={{
        pathname: "/(app)/categories/[id]/products",
        params: { id: category.id, categoryName: category.name },
      }}
      className="max-h-28 mb-3 text-background rounded-sm border-2 border-border px-2.5 py-0.5"
    >
      <View className="h-full w-full items-center p-2">
        <Icon
          name={category.icon as keyof typeof icons}
          color={isDarkColorScheme ? "white" : "black"}
          size={40}
        />

        <Text className="text-foreground my-auto">{category.name}</Text>

        <Text>{category.description}</Text>
      </View>
    </Link>
  );
}
