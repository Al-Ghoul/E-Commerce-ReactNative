import { ThemeToggle } from "@/components/ThemeToggle";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { xiorInstance } from "@/lib/fetcher";
import { useColorScheme } from "@/lib/useColorScheme";
import {
  CreditCardInputSchema,
  CreditCardInputSchemaType,
  PaymentInputSchemaType,
  ShippingAddressInputSchema,
  ShippingAddressInputSchemaType,
} from "@/lib/zodTypes";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Link, router, Tabs, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { ScrollView, View } from "react-native";
import { Text } from "~/components/ui/text";
import { Button } from "~/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SafeAreaView } from "react-native-safe-area-context";
import { showToastable } from "react-native-toastable";
import { Check, X } from "lucide-react-native";

const steps = ["Shipping", "Payment", "Review"];

export default function CheckoutPage() {
  const { id } = useLocalSearchParams();
  const { isDarkColorScheme } = useColorScheme();

  const [currentStep, setCurrentStep] = useState(0);

  const getOrderReq = useQuery({
    queryKey: ["order", id],
    queryFn: () =>
      xiorInstance
        .get(`/orders/${id}`)
        .then((res) => res.data)
        .catch((error) => Promise.reject(error)),
  });

  const getOrderItemsReq = useQuery({
    queryKey: ["orderItems", id],
    queryFn: () =>
      xiorInstance
        .get(`/orders/${id}/items`)
        .then((res) => res.data)
        .catch((error) => Promise.reject(error)),
    enabled: getOrderReq.isSuccess,
  });

  const handleNextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const backToPrevStep = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const {
    control: shippingControl,
    handleSubmit: handleShippingSubmit,
    formState: { errors },
    getValues: shippingErrors,
    setError: setShippingError,
  } = useForm<ShippingAddressInputSchemaType>({
    values: {
      full_name: "Abdulrahman AlGhoul",
      address: "23 July Street",
      city: "Al-Arish",
      country: "Egypt",
      postal_code: "45111",
    },
    resolver: zodResolver(ShippingAddressInputSchema),
  });
  const {
    control: paymentControl,
    getValues: getPaymentValues,
    handleSubmit: handlePaymentSubmit,
    formState: { errors: paymentErrors },
    setError: setPaymentError,
  } = useForm<CreditCardInputSchemaType>({
    values: {
      card_number: (4242424242424242).toString(),
      card_holder: "Abdulrahman AlGhoul",
      card_expiry: "12/24",
      card_cvv: "123",
    },
    resolver: zodResolver(CreditCardInputSchema),
  });

  const createShippingReq = useMutation({
    mutationFn: async (data: ShippingAddressInputSchemaType) =>
      xiorInstance
        .post(`/orders/${id}/shipping`, data)
        .then((res) => Promise.resolve(res.data))
        .catch((error) => Promise.reject(error)),
    onError: (error) => {
      if ("data" in error) {
        Object.entries(error.data as { [key: string]: string[] }).forEach(
          ([key, value]) => {
            setShippingError(key as ShippingAddressInputSchemaType & "root", {
              type: "custom",
              message: value[0],
            });
          },
        );
      }
    },
  });

  const createPaymentReq = useMutation({
    mutationFn: async (
      data: PaymentInputSchemaType & CreditCardInputSchemaType,
    ) =>
      xiorInstance
        .post(`/orders/${id}/payment`, data)
        .then((res) => Promise.resolve(res.data))
        .catch((error) => Promise.reject(error)),
    onError: (error) => {
      if ("data" in error) {
        Object.entries(error.data as { [key: string]: string[] }).forEach(
          ([key, value]) => {
            setPaymentError(key as CreditCardInputSchemaType & "root", {
              type: "custom",
              message: value[0],
            });
          },
        );
      }
    },
  });

  return (
    <SafeAreaView className="mx-5">
      <Tabs.Screen
        options={{
          headerLeft: () => (
            <Link href="/(app)/orders" className="mx-3">
              <FontAwesome
                size={28}
                name="arrow-left"
                className="mx-3"
                color={isDarkColorScheme ? "white" : "black"}
              />
            </Link>
          ),
          title: `Order ${id}`,
          headerRight: () => <ThemeToggle />,
          tabBarStyle: {
            display: "none",
          },
        }}
      />
      <ScrollView className="mb-4">
        <View className="flex flex-row justify-between mt-3">
          {steps.map((step, index) => (
            <View key={step} className="flex flex-row items-center">
              <View
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  index <= currentStep
                    ? "bg-secondary text-primary-foreground border border-primary-background"
                    : "bg-gray-500 text-gray-600"
                }`}
              >
                <Text>{index + 1}</Text>
              </View>
              <Text className="ml-2 text-sm font-medium">{step}</Text>
              {index < steps.length - 1 && (
                <View className="w-12 h-1 mx-2 bg-gray-200">
                  <View
                    className="h-full bg-primary"
                    style={{ width: index < currentStep ? "100%" : "0%" }}
                  ></View>
                </View>
              )}
            </View>
          ))}
        </View>
        <View className="mt-3">
          {currentStep === 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-semibold mb-4">
                  Shipping Information
                </CardTitle>
              </CardHeader>
              <CardContent className="gap-4">
                <Controller
                  control={shippingControl}
                  rules={{
                    required: true,
                  }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      id="full_name"
                      className="w-full border border-gray-400 p-2 rounded-lg"
                      onChangeText={onChange}
                      onBlur={onBlur}
                      value={value}
                    />
                  )}
                  name="full_name"
                />
                {errors.full_name ? (
                  <Text className="text-red-500 text-center">
                    {errors.full_name.message}
                  </Text>
                ) : null}

                <Controller
                  control={shippingControl}
                  rules={{
                    required: true,
                  }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      id="address"
                      className="w-full border border-gray-400 p-2 rounded-lg"
                      onChangeText={onChange}
                      onBlur={onBlur}
                      value={value}
                    />
                  )}
                  name="address"
                />
                {errors.address ? (
                  <Text className="text-red-500 text-center">
                    {errors.address.message}
                  </Text>
                ) : null}

                <Controller
                  control={shippingControl}
                  rules={{
                    required: true,
                  }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      id="city"
                      className="w-full border border-gray-400 p-2 rounded-lg"
                      onChangeText={onChange}
                      onBlur={onBlur}
                      value={value}
                    />
                  )}
                  name="city"
                />
                {errors.city ? (
                  <Text className="text-red-500 text-center">
                    {errors.city.message}
                  </Text>
                ) : null}

                <Controller
                  control={shippingControl}
                  rules={{
                    required: true,
                  }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      id="country"
                      className="w-full border border-gray-400 p-2 rounded-lg"
                      onChangeText={onChange}
                      onBlur={onBlur}
                      value={value}
                    />
                  )}
                  name="country"
                />
                {errors.country ? (
                  <Text className="text-red-500 text-center">
                    {errors.country.message}
                  </Text>
                ) : null}
                <Controller
                  control={shippingControl}
                  rules={{
                    required: true,
                  }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      id="postal_code"
                      className="w-full border border-gray-400 p-2 rounded-lg"
                      onChangeText={onChange}
                      onBlur={onBlur}
                      value={value}
                    />
                  )}
                  name="postal_code"
                />
                {errors.postal_code ? (
                  <Text className="text-red-500 text-center">
                    {errors.postal_code.message}
                  </Text>
                ) : null}

                <Button
                  onPress={handleShippingSubmit(() => {
                    handleNextStep();
                  })}
                >
                  <Text>Continue to Payment</Text>
                </Button>
              </CardContent>
            </Card>
          )}
          {currentStep === 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-semibold mb-4">
                  Payment Information
                </CardTitle>
              </CardHeader>
              <CardContent className="gap-4">
                <Controller
                  control={paymentControl}
                  rules={{
                    required: true,
                  }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      id="card_number"
                      className="w-full border border-gray-400 p-2 rounded-lg"
                      onChangeText={onChange}
                      onBlur={onBlur}
                      value={value}
                    />
                  )}
                  name="card_number"
                />
                {paymentErrors.card_number ? (
                  <Text className="text-red-500 text-center">
                    {paymentErrors.card_number.message}
                  </Text>
                ) : null}
                <Controller
                  control={paymentControl}
                  rules={{
                    required: true,
                  }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      id="card_holder"
                      className="w-full border border-gray-400 p-2 rounded-lg"
                      onChangeText={onChange}
                      onBlur={onBlur}
                      value={value}
                    />
                  )}
                  name="card_holder"
                />
                {paymentErrors.card_holder ? (
                  <Text className="text-red-500 text-center">
                    {paymentErrors.card_holder.message}
                  </Text>
                ) : null}
                <Controller
                  control={paymentControl}
                  rules={{
                    required: true,
                  }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      id="card_expiry"
                      className="w-full border border-gray-400 p-2 rounded-lg"
                      onChangeText={onChange}
                      onBlur={onBlur}
                      value={value}
                    />
                  )}
                  name="card_expiry"
                />
                {paymentErrors.card_expiry ? (
                  <Text className="text-red-500 text-center">
                    {paymentErrors.card_expiry.message}
                  </Text>
                ) : null}
                <Controller
                  control={paymentControl}
                  rules={{
                    required: true,
                  }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      id="card_cvv"
                      className="w-full border border-gray-400 p-2 rounded-lg"
                      onChangeText={onChange}
                      onBlur={onBlur}
                      value={value}
                    />
                  )}
                  name="card_cvv"
                />
                {paymentErrors.card_cvv ? (
                  <Text className="text-red-500 text-center">
                    {paymentErrors.card_cvv.message}
                  </Text>
                ) : null}
                <Button
                  onPress={handlePaymentSubmit(() => {
                    handleNextStep();
                  })}
                >
                  <Text>Review Order</Text>
                </Button>
                <Button onPress={backToPrevStep} variant="secondary">
                  <Text>Back</Text>
                </Button>
              </CardContent>
            </Card>
          )}
          {currentStep === 2 && (
            <Card>
              <CardHeader className="-mb-4">
                <CardTitle className="text-xl font-semibold mb-4">
                  Review Your Order
                </CardTitle>
              </CardHeader>
              <CardContent className="gap-4">
                <View>
                  <Text className="text-lg font-semibold">
                    Shipping Information:
                  </Text>
                  <Text>{shippingErrors().full_name}</Text>
                  <Text>{shippingErrors().address}</Text>
                  <Text>
                    {shippingErrors().city}, {shippingErrors().country}{" "}
                    {shippingErrors().postal_code}
                  </Text>
                </View>

                <View>
                  <Text className="text-lg font-semibold">
                    Payment Information:
                  </Text>
                  <Text>
                    Card ending in
                    {" " + getPaymentValues().card_number.toString().slice(-4)}
                  </Text>
                  <Text>{getPaymentValues().card_holder}</Text>
                </View>
                <View>
                  <Text className="text-lg font-semibold">Order Items:</Text>
                  {getOrderItemsReq.data?.data.map(
                    (item: OrderItem & Product) => (
                      <View key={item.id} className="flex-row justify-between">
                        <Text>
                          {item.name} (x{item.quantity})
                        </Text>
                        <Text>
                          ${(item.price_at_purchase * item.quantity).toFixed(2)}
                        </Text>
                      </View>
                    ),
                  )}
                </View>
                <Button
                  onPress={handleShippingSubmit((data) => {
                    createShippingReq
                      .mutateAsync(data)
                      .then(() => {
                        handlePaymentSubmit((data) => {
                          createPaymentReq
                            .mutateAsync({
                              ...data,
                              amount: parseFloat(
                                getOrderReq.data?.data.total_amount,
                              ),
                              payment_method: "credit_card",
                            })
                            .then(() => {
                              showToastable({
                                renderContent: () => (
                                  <View className="flex-row gap-2 p-4 bg-green-800 rounded-lg">
                                    <Check
                                      color="#FFF"
                                      size={20}
                                      className="self-center"
                                    />
                                    <Text className="text-background">
                                      Order placed successfully
                                    </Text>
                                  </View>
                                ),
                                message: undefined,
                                duration: 2000,
                              });
                              router.push(`/orders/${id}/details`);
                            })
                            .catch((error) => {
                              showToastable({
                                renderContent: () => (
                                  <View className="flex-row gap-2 p-4 bg-red-800 rounded-lg">
                                    <X
                                      color="#FFF"
                                      size={20}
                                      className="self-center"
                                    />
                                    <Text className="text-background">
                                      {error.detail}
                                    </Text>
                                  </View>
                                ),
                                message: undefined,
                                duration: 2000,
                              });
                            });
                        })();
                      })
                      .catch((error) => {
                        showToastable({
                          renderContent: () => (
                            <View className="flex-row gap-2 p-4 bg-red-800 rounded-lg">
                              <X
                                color="#FFF"
                                size={20}
                                className="self-center"
                              />
                              <Text className="text-background">
                                {error.detail}
                              </Text>
                            </View>
                          ),
                          message: undefined,
                          duration: 2000,
                        });
                      });
                  })}
                >
                  <Text>Place Order</Text>
                </Button>
                <Button onPress={backToPrevStep} variant="secondary">
                  <Text>Back</Text>
                </Button>
              </CardContent>
            </Card>
          )}

          <Card className="mt-5">
            <CardHeader className="-mb-4">
              <CardTitle className="text-lg font-semibold mb-4">
                Order Summary
              </CardTitle>
              <CardContent>
                {getOrderItemsReq.data?.data.map(
                  (item: OrderItem & Product) => (
                    <View
                      key={item.id}
                      className="flex-row justify-between text-sm"
                    >
                      <Text>
                        {item.name} (x{item.quantity})
                      </Text>
                      <Text>
                        ${(item.price_at_purchase * item.quantity).toFixed(2)}
                      </Text>
                    </View>
                  ),
                )}
              </CardContent>
              <Separator className="my-4" />
              <View className="flex-row justify-between font-semibold">
                <Text>Total</Text>
                <Text>${getOrderReq.data?.data.total_amount}</Text>
              </View>
            </CardHeader>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
