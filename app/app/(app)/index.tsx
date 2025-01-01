import { xiorInstance } from "@/lib/fetcher";
import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { RefreshControl, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "@/components/ui/text";
import { useDebouncedCallback } from "use-debounce";
import Toast from "react-native-root-toast";
import { CartItemInputSchemaType } from "@/lib/zodTypes";
import { useSession } from "@/components/AuthContext";
import { FlatList } from "react-native-gesture-handler";
import ProductCard from "@/components/ProductCard";
import Categories from "@/components/core/commerce/Categories";
import SearchBar from "@/components/core/commerce/SearchBar";
import SortBy from "@/components/core/commerce/SortBy";

export default function IndexPage() {
  const { session } = useSession();

  const [productsKeyword, setProductsKeyword] = useState("");
  const fetchCategoriesByKeyword = (q: string) =>
    xiorInstance
      .get(`/products/search?q=${q}`)
      .then((res) => Promise.resolve(res.data))
      .catch((error) => Promise.reject(error));
  const productsSearchReq = useQuery({
    queryKey: ["products", productsKeyword],
    queryFn: () => fetchCategoriesByKeyword(productsKeyword),
    enabled: productsKeyword.length > 0,
  });

  const productsOffset = 0;
  const [sortBy, setSortBy] = useState("name");
  const [productsLimitBy, setProductsLimitBy] = useState(8);
  const [selectedCategory, setSelectedCategory] = useState(-1);

  const fetchProducts = (
    offset: number,
    category_id: number,
    sortBy: string,
    limitBy: number,
  ) =>
    xiorInstance
      .get(
        `/products?limit=${limitBy}&offset=${offset}&category=${category_id}&sortBy=${sortBy === "priceHigh" ? "price" : sortBy === "priceLow" ? "price" : sortBy}&orderBy=${sortBy === "priceHigh" ? "desc" : sortBy === "priceLow" ? "asc" : "asc"}`,
      )
      .then((res) => Promise.resolve(res.data))
      .catch((error) => Promise.reject(error));
  const productsReq = useQuery({
    queryKey: [
      "categories",
      productsOffset,
      selectedCategory,
      sortBy,
      productsLimitBy,
    ],
    queryFn: () =>
      fetchProducts(productsOffset, selectedCategory, sortBy, productsLimitBy),
    placeholderData: keepPreviousData,
  });

  const productsLimitByUpdate = useDebouncedCallback(() => {
    if (productsReq.data?.meta.total > productsLimitBy) {
      setProductsLimitBy((prevLimitBy) => prevLimitBy * 2);
    } else
      Toast.show("No more products", {
        duration: Toast.durations.LONG,
      });
  }, 1000);

  const cartReq = useQuery({
    queryKey: ["userCart", session?.userId],
    queryFn: () =>
      xiorInstance
        .get(`/users/${session?.userId}/carts`)
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
    <SafeAreaView>
      <Categories
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        onCategoryPress={() => setProductsKeyword("")}
      />

      <SortBy
        sortBy={sortBy}
        setSortBy={setSortBy}
        onSortByChange={() => setProductsLimitBy(8)}
      />

      <SearchBar
        searchKeyword={productsKeyword}
        setSearchKeyword={setProductsKeyword}
        isLoading={productsSearchReq.isFetching}
        isError={productsSearchReq.isError}
        placeHolder="products"
      />

      {productsReq.isPending ? (
        <View className="mx-auto w-6 h-6 rounded-full animate-spin border-y border-solid border-primary border-t-transparent"></View>
      ) : null}

      {productsSearchReq.data?.data?.length > 0 ? (
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
          showsVerticalScrollIndicator={false}
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
