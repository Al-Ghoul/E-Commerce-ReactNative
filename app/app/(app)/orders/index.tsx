import { useSession } from "@/components/AuthContext";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { xiorInstance } from "@/lib/fetcher";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import React, { useState } from "react";
import { FlatList, View } from "react-native";
import { RefreshControl } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { useDebouncedCallback } from "use-debounce";
import Toast from "react-native-root-toast";

export default function OrdersPage() {
  const { session } = useSession();
  const [ordersLimitBy, setOrdersLimitBy] = useState(4);
  const [ordersOffset, setOrdersOffset] = useState(0);

  const ordersReq = useQuery({
    queryKey: ["orders", ordersLimitBy, ordersOffset],
    queryFn: () =>
      xiorInstance
        .get(
          `/users/${session?.userId}/orders/?limit=${ordersLimitBy}&offset=${ordersOffset}`,
        )
        .then((data) => Promise.resolve(data.data))
        .catch((error) => Promise.reject(error)),
    placeholderData: keepPreviousData,
    enabled: !!session?.userId,
  });

  const statusColors = {
    pending: "bg-yellow-200 text-yellow-800",
    processing: "bg-yellow-200 text-yellow-800",
    shipped: "bg-blue-200 text-blue-800",
    delivered: "bg-green-200 text-green-800",
    canceled: "bg-red-200 text-red-800",
  };

  const updateOrdersLimitBy = useDebouncedCallback(() => {
    if (ordersReq.data?.meta.total > ordersLimitBy) {
      setOrdersLimitBy((prevLimitBy) => prevLimitBy * 2);
    }
  }, 1000);

  return (
    <SafeAreaView className="mx-2">
      {ordersReq.isFetching || ordersReq.isRefetching || ordersReq.isPending ? (
        <View className="mx-auto my-5 w-6 h-6 rounded-full animate-spin border-y border-solid border-primary border-t-transparent"></View>
      ) : null}
      <FlatList
        onEndReached={updateOrdersLimitBy}
        refreshControl={
          <RefreshControl
            refreshing={ordersReq.isPending}
            onRefresh={ordersReq.refetch}
          />
        }
        data={ordersReq.data?.data}
        renderItem={({ item }) => (
          <Card id={item.id} className="mb-3">
            <CardHeader className="flex-row justify-between">
              <CardTitle>Order #{item.id}</CardTitle>
              <Text
                className={`${statusColors[item.fulfillment_status as keyof typeof statusColors]} rounded-full px-2 py-1`}
              >
                {item.fulfillment_status.charAt(0).toUpperCase() +
                  item.fulfillment_status.slice(1)}
              </Text>
            </CardHeader>

            <CardContent>
              <Text className="text-sm">Total: ${item.total_amount}</Text>
              <Text className="text-sm">
                Date: {new Date(item.created_at).toLocaleString()}
              </Text>
            </CardContent>

            <CardFooter className="flex-row justify-between">
              <Button>
                <Text>Details</Text>
              </Button>

              <Button variant="secondary">
                <Text>Checkout</Text>
              </Button>
            </CardFooter>
          </Card>
        )}
      />
    </SafeAreaView>
  );
}
