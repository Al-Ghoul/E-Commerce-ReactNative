import { useSession } from "@/components/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { xiorInstance } from "@/lib/fetcher";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Pressable, RefreshControl, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "~/components/ui/text";
import PlaceHolderImage from "@/assets/images/placeholder.svg";
import EvilIcons from "@expo/vector-icons/EvilIcons";
import { useColorScheme } from "@/lib/useColorScheme";
import Toast from "react-native-root-toast";
import { router } from "expo-router";

interface CartItemInputType {
  itemId: number;
  quantity: number;
}

export default function CartPage() {
  const { session } = useSession();
  const { isDarkColorScheme } = useColorScheme();

  const cartReq = useQuery({
    queryKey: ["userCart", session?.userId],
    queryFn: () =>
      xiorInstance
        .get(`/users/${session?.userId}/carts`)
        .then((data) => Promise.resolve(data))
        .catch((error) => Promise.reject(error)),
    enabled: !!session?.userId,
  });

  const cartItemsReq = useQuery({
    queryKey: ["cartItems"],
    queryFn: () =>
      xiorInstance.get(`/carts/${cartReq.data?.data.data.id}/items`),
    enabled: !!cartReq.data?.data.data.id,
  });

  const updateCartItemReq = useMutation({
    mutationKey: ["cartItem"],
    mutationFn: (input: CartItemInputType) =>
      xiorInstance
        .patch(`/carts/${cartReq.data?.data.data.id}/items/${input.itemId}`, {
          quantity: input.quantity,
        })
        .then((res) => Promise.resolve(res))
        .catch((error) => Promise.reject(error)),
  });

  const deleteCartItemReq = useMutation({
    mutationKey: ["cartItem"],
    mutationFn: (itemId: number) =>
      xiorInstance
        .delete(`/carts/${cartReq.data?.data.data.id}/items/${itemId}`)
        .then((res) => Promise.resolve(res))
        .catch((error) => Promise.reject(error)),
  });

  const createOrderReq = useMutation({
    mutationKey: ["userOrder", session?.userId],
    mutationFn: (cart_id: number) =>
      xiorInstance
        .post(`/users/${session?.userId}/orders`, {
          cart_id,
        })
        .then((res) => Promise.resolve(res))
        .catch((error) => Promise.reject(error)),
  });

  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    const newTotal =
      cartItemsReq.data?.data.data.reduce(
        (sum: number, item: CartItemWithPrice) =>
          sum + item.price * item.quantity,
        0,
      ) || 0;
    setTotalPrice(newTotal);
  }, [cartItemsReq.data?.data.data]);

  return (
    <SafeAreaView className="flex-1 p-2">
      {cartItemsReq.isFetching ? (
        <View className="mx-auto w-6 h-6 rounded-full animate-spin border-y border-solid border-primary border-t-transparent"></View>
      ) : null}

      {cartItemsReq.data?.data.data.length > 0 ? (
        <>
          <Card className="-mt-8">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
              <CardContent>
                {cartItemsReq.data?.data.data.map((item: CartItemWithPrice) => (
                  <View key={item.id} className="flex-row justify-between mt-3">
                    <Text>
                      {item.name} (x{item.quantity})
                    </Text>
                    <Text>{item.price}</Text>
                  </View>
                ))}
              </CardContent>
              <Separator className="my-4" />
              <CardFooter className="flex-row justify-between p-0">
                <Text>Total</Text>
                <Text>{totalPrice}</Text>
              </CardFooter>
              <Button
                disabled={createOrderReq.isPending}
                className="w-full mt-4"
                onPress={() => {
                  createOrderReq
                    .mutateAsync(Number(cartReq.data?.data.data.id))
                    .then(() => {
                      Toast.show("Order placed successfully");
                      cartReq.refetch();
                      cartItemsReq.refetch();
                      // router.replace("/orders");
                    })
                    .catch((err) => {
                      const data = err.response.data;
                      Toast.show(data.message || data.detail);
                    });
                }}
              >
                <Text>Checkout</Text>
              </Button>
            </CardHeader>
          </Card>
        </>
      ) : (
        <View className="flex-1 items-center justify-center">
          <EvilIcons
            name="cart"
            size={32}
            color={isDarkColorScheme ? "white" : "black"}
          />
          <Text className="text-center text-2xl">Your cart is empty</Text>
        </View>
      )}

      <ScrollView
        className="mt-4"
        refreshControl={
          <RefreshControl
            refreshing={cartItemsReq.isFetching}
            onRefresh={cartItemsReq.refetch}
          />
        }
      >
        {cartItemsReq.data?.data.data.map((item: CartItemWithPrice) => (
          <Card key={item.id}>
            <CardHeader className="flex-row justify-between">
              <PlaceHolderImage height={80} width={90} />
              <View className="mt-5">
                <CardTitle>{item.name}</CardTitle>
                <Text>{item.description}</Text>
              </View>
            </CardHeader>

            <CardContent className="flex-row justify-between">
              <Text>${item.price}</Text>
              <View className="flex-row">
                <Pressable
                  disabled={updateCartItemReq.isPending}
                  onPress={() => {
                    updateCartItemReq
                      .mutateAsync({
                        itemId: item.id,
                        quantity: +item.quantity - 1,
                      })
                      .then(() => {
                        cartItemsReq.refetch();
                        Toast.show(`${item.name} decreased by 1`);
                      })
                      .catch((err) => {
                        Toast.show(err.message);
                      });
                  }}
                >
                  <EvilIcons
                    name="minus"
                    size={32}
                    color={isDarkColorScheme ? "white" : "black"}
                  />
                </Pressable>
                <Text className="mx-2 text-lg"> x {item.quantity}</Text>
                <Pressable
                  disabled={updateCartItemReq.isPending}
                  onPress={() => {
                    updateCartItemReq
                      .mutateAsync({
                        itemId: item.id,
                        quantity: +item.quantity + 1,
                      })
                      .then(() => {
                        cartItemsReq.refetch();
                        Toast.show(`${item.name} increased by 1`);
                      })
                      .catch((err) => {
                        Toast.show(err.message);
                      });
                  }}
                >
                  <EvilIcons
                    name="plus"
                    size={32}
                    color={isDarkColorScheme ? "white" : "black"}
                  />
                </Pressable>
              </View>
              <Pressable
                disabled={deleteCartItemReq.isPending}
                onPress={() => {
                  deleteCartItemReq.mutateAsync(item.id).then(() => {
                    cartItemsReq.refetch();
                    Toast.show(`${item.name} removed from cart`);
                  });
                }}
              >
                <EvilIcons
                  name="trash"
                  size={32}
                  color={isDarkColorScheme ? "white" : "black"}
                />
              </Pressable>
            </CardContent>
          </Card>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
