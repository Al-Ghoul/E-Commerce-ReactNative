/*eslint import/namespace: ['error', { allowComputed: true }]*/ 
import { icons } from "lucide-react-native";

const Icon = ({
  name,
  color,
  size,
}: {
  name: keyof typeof icons;
  color: string;
  size: number;
}) => {
  const LucideIcon = icons[capitalizeAndFormat(name)];

  return <LucideIcon color={color} size={size} />;
};

function capitalizeAndFormat(str: string) {
  return str
    .toLowerCase() // Convert the entire string to lowercase
    .split("-") // Split the string by '-'
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize the first letter of each word
    .join("") as keyof typeof icons; // Join the words back together without the '-'
}

export default Icon;
