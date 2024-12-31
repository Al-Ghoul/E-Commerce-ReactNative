import { View } from "react-native";
import Animated, { SlideInLeft, SlideOutRight } from "react-native-reanimated";
import { Controller, useForm } from "react-hook-form";
import {
  LoginInputClientSchemaType,
  RegisterInputSchema,
} from "@/lib/zodTypes";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Text } from "~/components/ui/text";
import { Button } from "@/components/ui/button";
import { xiorInstance } from "@/lib/fetcher";
import { useMutation } from "@tanstack/react-query";
import { showToastable } from "react-native-toastable";
import { Check, X } from "lucide-react-native";
import { parseJwt, useSession } from "@/components/AuthContext";
import { router } from "expo-router";
import { XiorError } from "xior";

export default function Login() {
  const { signIn } = useSession();
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

  const { mutate: submitLogin, isPending: isLoginPending } = useMutation({
    mutationFn: (data: LoginInputClientSchemaType) =>
      xiorInstance
        .post("/auth/login", data)
        .then((res) => Promise.resolve(res))
        .catch((error) => Promise.reject(error)),
    onSuccess: (res) => {
      showToastable({
        renderContent: () => (
          <View className="flex-row gap-2 p-4 bg-green-800 rounded-lg">
            <Check color="#FFF" size={20} className="self-center" />
            <Text className="text-background">Logged in successfully</Text>
          </View>
        ),
        message: undefined,
        duration: 2000,
      });

      const userId = parseJwt(res.data.access_token).sub.split("|")[1];
      signIn({
        access_token: res.data.access_token,
        refresh_token: res.data.refresh_token,
        userId: userId,
      });

      router.replace("/");
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
          showToastable({
            renderContent: () => (
              <View className="flex-row gap-2 p-4 bg-red-800 rounded-lg">
                <X color="#FFF" size={20} className="self-center" />
                <Text className="text-background">
                  {error.response?.data.message}
                </Text>
              </View>
            ),
            message: undefined,
            duration: 2000,
          });
        }
      } else {
        showToastable({
          renderContent: () => (
            <View className="flex-row gap-2 p-4 bg-red-800 rounded-lg">
              <X color="#FFF" size={20} className="self-center" />
              <Text className="text-background">
                {error.message}
              </Text>
            </View>
          ),
          message: undefined,
          duration: 2000,
        });
      }
    },
  });

  return (
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

      <Button
        onPress={loginHandleSubmit((data) => submitLogin(data))}
        disabled={isLoginPending}
      >
        <Text>Login</Text>
      </Button>
    </Animated.View>
  );
}
