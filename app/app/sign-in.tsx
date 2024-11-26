import { useSession } from "@/components/AuthContext";
import { Pressable, View } from "react-native";
import { Text } from "~/components/ui/text";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  LoginInputClientSchemaType,
  RegisterInputClientSchema,
  RegisterInputClientSchemaType,
  RegisterInputSchema,
} from "@/lib/zodTypes";
import { Input } from "@/components/ui/input";
import { Button as PrimaryButton } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import Toast from "react-native-root-toast";
import { xiorInstance } from "@/lib/fetcher";
import { XiorError } from "xior";
import Animated, { SlideInLeft, SlideOutRight } from "react-native-reanimated";
import { ThemeToggle } from "@/components/ThemeToggle";
import { router } from "expo-router";

export default function SignIn() {
  const { signIn } = useSession();
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");

  const {
    control: registerControl,
    handleSubmit: registerHandleSubmit,
    formState: { errors: registerErrors },
    setError: setRegisterError,
  } = useForm<RegisterInputClientSchemaType>({
    values: {
      email: "Abdo.AlGhouul@gmail.com",
      password: "12345678",
      confirmPassword: "12345678",
    },
    resolver: zodResolver(RegisterInputClientSchema),
  });

  const {
    control: loginControl,
    handleSubmit: loginHandleSubmit,
    formState: { errors: loginErrors },
    setError: setLoginError,
  } = useForm<LoginInputClientSchemaType>({
    values: {
      email: "Abdo.AlGhouul@gmail.com",
      password: "12345678",
    },
    resolver: zodResolver(RegisterInputSchema),
  });

  const { mutate: submitRegister, isPending: isRegisterPending } = useMutation({
    mutationFn: (data: RegisterInputClientSchemaType) =>
      xiorInstance
        .post("/users", data)
        .then((res) => Promise.resolve(res))
        .catch((error) => Promise.reject(error)),
    onSuccess: (res) => {
      Toast.show(res.data.message, {
        duration: Toast.durations.LONG,
      });
      setActiveTab("login");
    },
    onError: (error) => {
      if (error instanceof XiorError) {
        if ("errors" in error.response?.data) {
          error.response?.data.errors.map(
            (error: {
              path: RegisterInputClientSchemaType & "root";
              message: string;
            }) => setRegisterError(error.path, { message: error.message }),
          );
        } else {
          Toast.show(error.response?.data.message, {
            duration: Toast.durations.LONG,
          });
        }
      }
    },
  });

  const { mutate: submitLogin, isPending: isLoginPending } = useMutation({
    mutationFn: (data: LoginInputClientSchemaType) =>
      xiorInstance
        .post("/auth/login", data)
        .then((res) => Promise.resolve(res))
        .catch((error) => Promise.reject(error)),
    onSuccess: (res) => {
      signIn({
        access_token: res.data.access_token,
        refresh_token: res.data.refresh_token,
      });
      router.replace("/");
      Toast.show("Logged in successfully", {
        duration: Toast.durations.LONG,
      });
    },
    onError: (error) => {
      if (error instanceof XiorError) {
        if ("errors" in error.response?.data) {
          error.response?.data.errors.map(
            (error: {
              path: LoginInputClientSchemaType & "root";
              message: string;
            }) => setLoginError(error.path, { message: error.message }),
          );
        } else {
          Toast.show(error.response?.data.message, {
            duration: Toast.durations.LONG,
          });
        }
      }
    },
  });

  return (
    <View className="flex-1 justify-center bg-background">
      <View className="absolute right-5 top-14">
        <ThemeToggle />
      </View>
      <Card className="max-w-md w-full self-center">
        <View className="flex-row gap-3 m-4">
          <Pressable
            className={`flex flex-[0.5] p-2 rounded ${activeTab === "register" ? "bg-primary" : "bg-background border border-primary"}`}
            onPress={() => setActiveTab("register")}
          >
            <Text
              className={`text-center ${activeTab === "register" ? "text-primary-foreground" : "text-primary"}`}
            >
              Register
            </Text>
          </Pressable>

          <Pressable
            className={`flex flex-[0.5] p-2 rounded ${activeTab === "login" ? "bg-primary" : "bg-background border border-primary"}`}
            onPress={() => setActiveTab("login")}
          >
            <Text
              className={`text-center text-primary ${activeTab === "login" ? "text-primary-foreground" : "text-primary"}`}
            >
              Login
            </Text>
          </Pressable>
        </View>

        <CardHeader>
          <CardTitle>
            {activeTab === "register" ? "Register" : "Login"}
          </CardTitle>
        </CardHeader>

        <CardContent className="gap-4">
          {activeTab === "register" ? (
            <Animated.View
              entering={SlideInLeft}
              exiting={SlideOutRight}
              className="gap-3"
            >
              <Controller
                control={registerControl}
                rules={{
                  required: true,
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    id="email"
                    className="w-full border border-gray-400 p-2 rounded-lg"
                    onChangeText={onChange}
                    onBlur={onBlur}
                    value={value}
                  />
                )}
                name="email"
              />
              {registerErrors.email ? (
                <Text className="text-red-500 text-center">
                  {registerErrors.email.message}
                </Text>
              ) : null}

              <Controller
                control={registerControl}
                rules={{
                  required: true,
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    id="password"
                    className="w-full border border-gray-400 p-2 rounded-lg"
                    onChangeText={onChange}
                    onBlur={onBlur}
                    value={value}
                    secureTextEntry
                  />
                )}
                name="password"
              />
              {registerErrors.password ? (
                <Text className="text-red-500 text-center">
                  {registerErrors.password.message}
                </Text>
              ) : null}

              <Controller
                control={registerControl}
                rules={{
                  required: true,
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    id="confirmPassword"
                    className="w-full border border-gray-400 p-2 rounded-lg"
                    onChangeText={onChange}
                    onBlur={onBlur}
                    value={value}
                    secureTextEntry
                  />
                )}
                name="confirmPassword"
              />
              {registerErrors.confirmPassword ? (
                <Text className="text-red-500 text-center">
                  {registerErrors.confirmPassword.message}
                </Text>
              ) : null}

              <PrimaryButton
                onPress={registerHandleSubmit((data) => submitRegister(data))}
                disabled={isRegisterPending}
              >
                <Text>Register</Text>
              </PrimaryButton>
            </Animated.View>
          ) : null}

          {activeTab === "login" ? (
            <Animated.View
              entering={SlideInLeft}
              exiting={SlideOutRight}
              className="gap-3"
            >
              <Controller
                control={loginControl}
                rules={{
                  required: true,
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    id="email"
                    className="w-full border border-gray-400 p-2 rounded-lg"
                    onChangeText={onChange}
                    onBlur={onBlur}
                    value={value}
                  />
                )}
                name="email"
              />
              {loginErrors.email ? (
                <Text className="text-red-500 text-center">
                  {loginErrors.email.message}
                </Text>
              ) : null}

              <Controller
                control={loginControl}
                rules={{
                  required: true,
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    id="password"
                    className="w-full border border-gray-400 p-2 rounded-lg"
                    onChangeText={onChange}
                    onBlur={onBlur}
                    value={value}
                    secureTextEntry
                  />
                )}
                name="password"
              />
              {loginErrors.password ? (
                <Text className="text-red-500 text-center">
                  {loginErrors.password.message}
                </Text>
              ) : null}

              <PrimaryButton
                onPress={loginHandleSubmit((data) => submitLogin(data))}
                disabled={isLoginPending}
              >
                <Text>Login</Text>
              </PrimaryButton>
            </Animated.View>
          ) : null}
        </CardContent>
      </Card>
    </View>
  );
}
