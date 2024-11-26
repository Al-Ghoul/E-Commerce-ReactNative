import { Text } from "@/components/ui/text";
import { xiorInstance } from "@/lib/fetcher";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { View, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link, Tabs, useLocalSearchParams } from "expo-router";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import PlacerHolderImage from "@/assets/images/placeholder.svg";
import { Button } from "@/components/ui/button";
import Toast from "react-native-root-toast";
import { Picker } from "@react-native-picker/picker";
import { useColorScheme } from "@/lib/useColorScheme";
import { useDebouncedCallback } from "use-debounce";
import { ThemeToggle } from "@/components/ThemeToggle";
import FontAwesome from "@expo/vector-icons/FontAwesome5";
import { Input } from "@/components/ui/input";

export default function Category() {
  const { id, categoryName } = useLocalSearchParams();
  const { isDarkColorScheme } = useColorScheme();

  const subCategoriesOffset = 0;
  const [subCategoriesLimitBy, setSubCategoriesLimitBy] = useState(8);

  const [selectedSubCategory, setSelectedSubCategory] = useState(-1);

  const fetchSubCategories = (id: string, offset: number, limitBy: number) =>
    xiorInstance
      .get(`/categories/${id}/subcategories/?limit=${limitBy}&offset=${offset}`)
      .then((data) => Promise.resolve(data))
      .catch((error) => Promise.reject(error));
  const subCategoriesReq = useQuery({
    queryKey: ["subCategories", id, subCategoriesOffset, subCategoriesLimitBy],
    queryFn: () =>
      fetchSubCategories(
        id as string,
        subCategoriesOffset,
        subCategoriesLimitBy,
      ),
    placeholderData: keepPreviousData,
  });

  const productsOffset = 0;
  const [productsLimitBy, setProductsLimitBy] = useState(8);
  const [sortBy, setSortBy] = useState("name");

  const fetchProducts = (
    offset: number,
    subcategory_id: number,
    sortBy: string,
    limitBy: number,
  ) =>
    xiorInstance
      .get(
        `/categories/${id}/products?limit=${limitBy}&offset=${offset}&subcategory=${subcategory_id}&sortBy=${sortBy === "priceHigh" ? "price" : sortBy === "priceLow" ? "price" : sortBy}&orderBy=${sortBy === "priceHigh" ? "desc" : sortBy === "priceLow" ? "asc" : "asc"}`,
      )
      .then((res) => Promise.resolve(res))
      .catch((error) => Promise.reject(error));
  const productsReq = useQuery({
    queryKey: [
      "products",
      productsOffset,
      selectedSubCategory,
      sortBy,
      productsLimitBy,
    ],
    queryFn: () =>
      fetchProducts(
        productsOffset,
        selectedSubCategory,
        sortBy,
        productsLimitBy,
      ),
    placeholderData: keepPreviousData,
  });

  const [searchQuery, setSearchQuery] = useState("");

  const fetchCategoriesProducts = (q: string) =>
    xiorInstance
      .get(`/categories/${id}/products/search?q=${q}`)
      .then((res) => Promise.resolve(res))
      .catch((error) => Promise.reject(error));
  const productsSearchReq = useQuery({
    queryKey: ["products", searchQuery],
    queryFn: () => fetchCategoriesProducts(searchQuery),
    enabled: searchQuery.length > 0,
  });

  const debouncedProductLimitByUpdate = useDebouncedCallback(() => {
    if (productsReq.data?.data.meta.total > productsLimitBy) {
      setProductsLimitBy((prevLimitBy) => prevLimitBy * 2);
    } else
      Toast.show("No more products", {
        duration: Toast.durations.LONG,
      });
  }, 1000);

  const debouncedSubCategoriesLimitByUpdate = useDebouncedCallback(() => {
    if (subCategoriesReq.data?.data.meta.total > subCategoriesLimitBy) {
      setSubCategoriesLimitBy((prevLimitBy) => prevLimitBy * 2);
    } else
      Toast.show("No more subcategories", {
        duration: Toast.durations.LONG,
      });
  }, 1000);

  return (
    <SafeAreaView className="flex-1">
      <Tabs.Screen
        options={{
          headerLeft: () => (
            <Link href="/(app)/categories" className="mx-3">
              <FontAwesome
                size={28}
                name="arrow-left"
                className="mx-3"
                color={isDarkColorScheme ? "white" : "black"}
              />
            </Link>
          ),
          title: categoryName as string,
          headerRight: () => <ThemeToggle />,
          tabBarStyle: {
            display: "none",
          },
        }}
      />
      {subCategoriesReq.isFetching ? (
        <View className="mx-auto w-6 h-6 rounded-full animate-spin border-y border-solid border-primary border-t-transparent"></View>
      ) : null}
      {subCategoriesReq.isPending ? (
        <View className="mx-auto w-6 h-6 rounded-full animate-spin border-y border-solid border-primary border-t-transparent"></View>
      ) : (
        subCategoriesReq.data?.data.data.length > 1 && (
          <ScrollView
            horizontal
            className="mx-2 py-5"
            onMomentumScrollEnd={debouncedSubCategoriesLimitByUpdate}
            showsHorizontalScrollIndicator={false}
          >
            <Pressable
              className={
                (selectedSubCategory === -1
                  ? "bg-foreground"
                  : "bg-background") +
                " text-background items-center rounded-full self-center border border-border h-8 ml-2 px-2.5 py-0.5"
              }
              onPress={() => setSelectedSubCategory(-1)}
            >
              <Text
                className={
                  selectedSubCategory === -1
                    ? "text-background"
                    : "text-foreground"
                }
              >
                All
              </Text>
            </Pressable>

            {subCategoriesReq.data?.data.data.map((category: Category) => (
              <Pressable
                key={category.id}
                onPress={() => setSelectedSubCategory(category.id)}
                className={
                  (selectedSubCategory === category.id
                    ? "bg-foreground"
                    : "bg-background") +
                  " text-background items-center rounded-full self-center border border-border h-8 ml-2 px-2.5 py-0.5"
                }
              >
                <Text
                  className={
                    selectedSubCategory === category.id
                      ? "text-background"
                      : "text-foreground"
                  }
                >
                  {category.name}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        )
      )}

      <View className="flex-row mt-7 mx-4 -mb-6">
        <Text className="text-foreground font-semibold text-xl my-auto">
          Sort By:
        </Text>
        <Picker
          style={{ flex: 1, color: isDarkColorScheme ? "white" : "black" }}
          selectedValue={sortBy}
          onValueChange={useDebouncedCallback((item) => {
            setSortBy(item);
            setProductsLimitBy(8);
          }, 1000)}
          dropdownIconColor={isDarkColorScheme ? "white" : "black"}
          mode="dialog"
        >
          <Picker.Item label="Name" value="name" />
          <Picker.Item label="Price: High to Low" value="priceHigh" />
          <Picker.Item label="Price: Low to High" value="priceLow" />
        </Picker>
      </View>

      <View className="mt-5 mx-2">
        <Input
          placeholder="Search products..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />

        {productsSearchReq.isError ? (
          <Text className="text-red-500">Something went wrong</Text>
        ) : null}
        {productsSearchReq.isFetching ? (
          <View className="absolute top-3 right-3 mx-auto w-6 h-6 rounded-full animate-spin border-y border-solid border-primary border-t-transparent"></View>
        ) : null}
      </View>

      {productsReq.isFetching ? (
        <View className="mx-auto w-6 h-6 rounded-full animate-spin border-y border-solid border-primary border-t-transparent"></View>
      ) : null}
      {productsReq.isPending ? (
        <View className="mx-auto w-6 h-6 rounded-full animate-spin border-y border-solid border-primary border-t-transparent"></View>
      ) : null}

      {productsSearchReq.data?.data.data.length > 0 ? (
        <ScrollView
          className="mx-4 mt-5"
        >
          {productsSearchReq.data?.data.data.map((product: Product) => (
            <Card key={product.id} className="p-5 mb-3">
              <CardTitle>{product.name}</CardTitle>
              <CardHeader className="w-full flex-row justify-between py-0">
                <Text>{product.subcategory_name}</Text>
                <Text>{product.stock_quantity} in stock</Text>
              </CardHeader>
              <CardContent className="p-0 items-center mt-2">
                <PlacerHolderImage height={200} />
              </CardContent>
              <CardFooter className="flex-row justify-between mt-4 mb-0 p-0">
                <Text>${product.price}</Text>
                <Button>
                  <Text>Add to cart</Text>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </ScrollView>
      ) : (
        <ScrollView
          className="mx-4 mt-5"
          onMomentumScrollEnd={debouncedProductLimitByUpdate}
        >
          {productsReq.data?.data.data.length > 1 &&
            productsReq.data?.data.data.map((product: Product) => (
              <Card key={product.id} className="p-5 mb-3">
                <CardTitle>{product.name}</CardTitle>
                <CardHeader className="w-full flex-row justify-between py-0">
                  <Text>{product.subcategory_name}</Text>
                  <Text>{product.stock_quantity} in stock</Text>
                </CardHeader>
                <CardContent className="p-0 items-center mt-2">
                  <PlacerHolderImage height={200} />
                </CardContent>
                <CardFooter className="flex-row justify-between mt-4 mb-0 p-0">
                  <Text>${product.price}</Text>
                  <Button>
                    <Text>Add to cart</Text>
                  </Button>
                </CardFooter>
              </Card>
            ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
