import { Text } from "@/components/ui/text";
import { xiorInstance } from "@/lib/fetcher";
import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {  FlatList, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link, Tabs, useLocalSearchParams } from "expo-router";
import { useColorScheme } from "@/lib/useColorScheme";
import { useDebouncedCallback } from "use-debounce";
import { ThemeToggle } from "@/components/ThemeToggle";
import FontAwesome from "@expo/vector-icons/FontAwesome5";
import { useSession } from "@/components/AuthContext";
import { CartItemInputSchemaType } from "@/lib/zodTypes";
import ProductCard from "@/components/ProductCard";
import SubCategories from "@/components/core/commerce/SubCategories";
import SortBy from "@/components/core/commerce/SortBy";
import SearchBar from "@/components/core/commerce/SearchBar";

export default function Category() {
  const { id, categoryName } = useLocalSearchParams();
  const { session } = useSession();
  const { isDarkColorScheme } = useColorScheme();

  const [selectedSubCategory, setSelectedSubCategory] = useState(-1);

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
      .then((res) => Promise.resolve(res.data))
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
      .then((res) => Promise.resolve(res.data))
      .catch((error) => Promise.reject(error));
  const productsSearchReq = useQuery({
    queryKey: ["products", searchQuery],
    queryFn: () => fetchCategoriesProducts(searchQuery),
    enabled: searchQuery.length > 0,
  });

  const productsLimitByUpdate = useDebouncedCallback(() => {
    if (productsReq.data?.meta.total > productsLimitBy) {
      setProductsLimitBy((prevLimitBy) => prevLimitBy * 2);
    } 
  }, 1000);

  const cartReq = useQuery({
    queryKey: ["userCart", session?.userId],
    queryFn: () => xiorInstance.get(`/users/${session?.userId}/carts`)
    .then((res) => Promise.resolve(res.data))
    .catch((error) => Promise.reject(error)),
    enabled: !!session?.userId,
  });

  const createCartItemReq = useMutation({
    mutationKey: ["userCart", cartReq.data?.data?.id],
    mutationFn: (ItemData: CartItemInputSchemaType) =>
      xiorInstance.post(`/carts/${cartReq.data?.data?.id}/items`, ItemData),
  });

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

      <SubCategories
        categoryId={id as string}
        selectedSubCategory={selectedSubCategory}
        setSelectedSubCategory={setSelectedSubCategory}
        onSubCategoryPress={() => {
          setSearchQuery("");
        }}
      />

      <SortBy
        sortBy={sortBy}
        setSortBy={setSortBy}
        onSortByChange={() => setProductsLimitBy(8)}
      />

      <SearchBar
        searchKeyword={searchQuery}
        setSearchKeyword={setSearchQuery}
        isLoading={productsSearchReq.isFetching}
        isError={productsSearchReq.isError}
        placeHolder="products"
      />

      {productsSearchReq.data?.data.length > 0 ? (
        <>
          <Text className="text-center">Search Results:</Text>
          <FlatList
            refreshControl={
              <RefreshControl
                refreshing={productsSearchReq.isFetching}
                onRefresh={productsSearchReq.refetch}
              />
            }
            onEndReachedThreshold={0.5}
            onEndReached={productsLimitByUpdate}
            data={productsSearchReq.data?.data}
            renderItem={({ item }) => (
              <ProductCard
                product={item}
                createCartItemReq={createCartItemReq}
              />
            )}
            className="mx-2"
          />
        </>
      ) : (
        <FlatList
          refreshControl={
            <RefreshControl
              refreshing={productsReq.isFetching}
              onRefresh={productsReq.refetch}
            />
          }
          onEndReachedThreshold={0.5}
          onEndReached={productsLimitByUpdate}
          data={productsReq.data?.data}
          renderItem={({ item }) => (
            <ProductCard product={item} createCartItemReq={createCartItemReq} />
          )}
          className="mx-2"
        />
      )}
    </SafeAreaView>
  );
}
