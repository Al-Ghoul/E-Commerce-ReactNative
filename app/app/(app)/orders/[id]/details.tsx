import { ThemeToggle } from "@/components/ThemeToggle";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { xiorInstance } from "@/lib/fetcher";
import { useColorScheme } from "@/lib/useColorScheme";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useQuery } from "@tanstack/react-query";
import { Link, Tabs, useLocalSearchParams } from "expo-router";
import React from "react";
import { FlatList, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "@/components/ui/text";
import { Separator } from "@/components/ui/separator";

export default function OrderDetailsPage() {
  const { id } = useLocalSearchParams();
  const { isDarkColorScheme } = useColorScheme();

  const getOrderReq = useQuery({
    queryKey: ["order", id],
    queryFn: () =>
      xiorInstance
        .get(`/orders/${id}`)
        .then((res) => res.data)
        .catch((error) => Promise.reject(error)),
  });

  const getOrderPaymentInfoReq = useQuery({
    queryKey: ["orderPaymentInfo", id],
    queryFn: () =>
      xiorInstance
        .get(`/orders/${id}/payment`)
        .then((res) => res.data)
        .catch((error) => Promise.reject(error)),
  });

  const getOrderShippingInfoReq = useQuery({
    queryKey: ["orderShippingInfo", id],
    queryFn: () =>
      xiorInstance
        .get(`/orders/${id}/shipping`)
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

  const statusColors = {
    pending: "bg-yellow-200 text-yellow-800",
    shipped: "bg-blue-200 text-blue-800",
    delivered: "bg-green-200 text-green-800",
    processing: "bg-yellow-200 text-yellow-800",
    canceled: "bg-red-200 text-red-800",
  };

  return (
    <SafeAreaView>
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

      {getOrderReq.isFetching || getOrderReq.isPending ? (
        <View className="mx-auto my-5 w-6 h-6 rounded-full animate-spin border-y border-solid border-primary border-t-transparent"></View>
      ) : (
        <Card className="mx-3">
          <CardHeader>
            <View className="flex-row justify-between">
              <CardTitle>Order {id}</CardTitle>
              <Text
                className={`${statusColors[getOrderReq.data?.data.fulfillment_status as keyof typeof statusColors]} rounded-full px-2 py-1`}
              >
                {getOrderReq.data?.data.fulfillment_status
                  .charAt(0)
                  .toUpperCase() +
                  getOrderReq.data?.data.fulfillment_status.slice(1)}
              </Text>
            </View>
          </CardHeader>
          <CardContent>
            <Text className="text-lg mb-2 font-bold">Order Summary</Text>
            <Text>
              Date:
              {new Date(getOrderReq.data?.data.created_at).toLocaleString()}
            </Text>
            <Text>Total: ${getOrderReq.data?.data.total_amount}</Text>
            <Separator className="m-2 my-3" />

            <Text className="text-lg mb-2 font-bold">Items: </Text>
            {getOrderItemsReq.isFetching || getOrderItemsReq.isPending ? (
              <View className="mx-auto my-5 w-6 h-6 rounded-full animate-spin border-y border-solid border-primary border-t-transparent"></View>
            ) : (
              <FlatList
                data={getOrderItemsReq.data?.data}
                renderItem={({ item }) => (
                  <View key={item.id} className="flex-row justify-between">
                    <Text>
                      {item.name} (x{item.quantity})
                    </Text>
                    <Text>
                      ${(item.price_at_purchase * item.quantity).toFixed(2)}
                    </Text>
                  </View>
                )}
              />
            )}

            {getOrderPaymentInfoReq.isFetching ||
            getOrderPaymentInfoReq.isPending ? (
              <View className="mx-auto my-5 w-6 h-6 rounded-full animate-spin border-y border-solid border-primary border-t-transparent"></View>
            ) : getOrderReq.data?.data.fulfillment_status !== "pending" &&
              getOrderReq.data?.data.fulfillment_status !== "canceled" &&
              getOrderPaymentInfoReq.data?.data ? (
              <>
                <Separator className="m-2 my-3" />
                <Text className="text-lg mb-2 font-bold">Payment Details:</Text>
                <Text>
                  Method:
                  {getOrderPaymentInfoReq.data?.data.payment_method ===
                  "credit_card"
                    ? "Credit Card"
                    : null}
                </Text>
                <Text>
                  {getOrderPaymentInfoReq.data.data.payment_method ===
                  "credit_card"
                    ? "Last 4 digits: " +
                      getOrderPaymentInfoReq.data.data.card_number
                        .toString()
                        .slice(-4)
                    : null}
                </Text>
                <Text>
                  Amount: $
                  {parseFloat(getOrderPaymentInfoReq.data?.data.amount).toFixed(
                    2,
                  )}
                </Text>
              </>
            ) : null}
            <Separator className="m-2 my-3" />

            {getOrderShippingInfoReq.isPending ||
            getOrderShippingInfoReq.isFetching ? (
              <View className="mx-auto my-5 w-6 h-6 rounded-full animate-spin border-y border-solid border-primary border-t-transparent"></View>
            ) : getOrderShippingInfoReq.data?.data ? (
              <View>
                <Text className="text-lg font-semibold mb-2">
                  Shipping Details:
                </Text>

                <Text>
                  {getOrderShippingInfoReq.data.address}
                  {`${getOrderShippingInfoReq.data.data.city}, ${getOrderShippingInfoReq.data.data.country} ${getOrderShippingInfoReq.data.data.postal_code}`}
                </Text>
              </View>
            ) : null}
          </CardContent>
        </Card>
      )}
    </SafeAreaView>
  );
}
