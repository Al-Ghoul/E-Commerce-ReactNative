import Animated, { SlideInLeft, SlideOutRight } from "react-native-reanimated";
import { Controller, useForm } from "react-hook-form";
import {
  RegisterInputClientSchema,
  RegisterInputClientSchemaType,
} from "@/lib/zodTypes";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Text } from "~/components/ui/text";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { xiorInstance } from "@/lib/fetcher";
import { XiorError } from "xior";
import { showToastable } from "react-native-toastable";
import { View } from "react-native";
import { Check, X } from "lucide-react-native";

export default function Register({ onSuccess }: { onSuccess: () => void }) {
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

  const { mutate: submitRegister, isPending: isRegisterPending } = useMutation({
    mutationFn: (data: RegisterInputClientSchemaType) =>
      xiorInstance
        .post("/users", data)
        .then((res) => Promise.resolve(res))
        .catch((error) => Promise.reject(error)),
    onSuccess: (res) => {
      showToastable({
        renderContent: () => (
          <View className="flex-row gap-2 p-4 bg-green-800 rounded-lg">
            <Check color="#FFF" size={20} className="self-center" />
            <Text className="text-background">{res.data.message}</Text>
          </View>
        ),
        message: undefined,
        duration: 2000,
      });
      
      onSuccess();
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
              <Text className="text-background">{error.message}</Text>
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

      <Button
        onPress={registerHandleSubmit((data) => submitRegister(data))}
        disabled={isRegisterPending}
      >
        <Text>Register</Text>
      </Button>
    </Animated.View>
  );
}
