import { Pressable, View } from "react-native";
import { Text } from "~/components/ui/text";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import Login from "@/components/core/user/Login";
import Register from "@/components/core/user/Register";

export default function SignIn() {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");

  return (
    <View className="flex-1 justify-center bg-background">
      <View className="absolute right-5 top-14">
        <ThemeToggle />
      </View>
      <Card className="max-w-md w-full self-center">
        <View className="flex-row gap-3 m-4">
          <InputToggle
            title="Register"
            activeTab={activeTab}
            setActiveTab={() => setActiveTab("register")}
          />
          <InputToggle
            title="Login"
            activeTab={activeTab}
            setActiveTab={() => setActiveTab("login")}
          />
        </View>

        <CardHeader>
          <CardTitle>
            {activeTab === "register" ? "Register" : "Login"}
          </CardTitle>
        </CardHeader>

        <CardContent className="gap-4">
          {activeTab === "register" ? (
            <Register onSuccess={() => setActiveTab("login")} />
          ) : null}
          {activeTab === "login" ? <Login /> : null}
        </CardContent>
      </Card>
    </View>
  );
}

function InputToggle({
  title,
  activeTab,
  setActiveTab,
}: {
  title: string;
  activeTab: "login" | "register";
  setActiveTab: () => void;
}) {
  return (
    <Pressable
      className={`flex flex-[0.5] p-2 rounded
        ${activeTab === title.toLowerCase() ? "bg-primary" : "bg-background border border-primary"}`}
      onPress={() => setActiveTab()}
    >
      <Text
        className={`text-center text-primary
          ${activeTab === title.toLowerCase() ? "text-primary-foreground" : "text-primary"}`}
      >
        {title}
      </Text>
    </Pressable>
  );
}
