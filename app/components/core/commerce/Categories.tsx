import { xiorInstance } from "@/lib/fetcher";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Dispatch, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { FlatList, Pressable, View } from "react-native";
import { Text } from "@/components/ui/text";

export default function Categories({
  selectedCategory,
  setSelectedCategory,
  onCategoryPress,
}: {
  selectedCategory: number;
  setSelectedCategory: Dispatch<React.SetStateAction<number>>;
  onCategoryPress: () => void;
}) {
  const categoriesOffset = 0;
  const [categoriesLimitBy, setCategoriesLimitBy] = useState(8);
  const fetchCategories = (offset: number, limitBy: number) =>
    xiorInstance
      .get(`/categories/?limit=${limitBy}&offset=${offset}`)
      .then((res) => Promise.resolve(res.data))
      .catch((error) => Promise.reject(error));
  const categoriesReq = useQuery({
    queryKey: ["categories", categoriesOffset, categoriesLimitBy],
    queryFn: () => fetchCategories(categoriesOffset, categoriesLimitBy),
    placeholderData: keepPreviousData,
  });

  const categoriesLimitByUpdate = useDebouncedCallback(() => {
    if (categoriesReq.data?.meta.total > categoriesLimitBy) {
      setCategoriesLimitBy((prevLimitBy) => prevLimitBy * 2);
    }
  }, 2000);

  return (
    <View className="my-2">
      {categoriesReq.isPending ? (
        <View className="mx-auto w-6 h-6 rounded-full animate-spin border-y border-solid border-primary border-t-transparent"></View>
      ) : (
        <FlatList
          onMomentumScrollEnd={categoriesLimitByUpdate}
          showsHorizontalScrollIndicator={false}
          horizontal
          data={[{ id: -1, name: "All" }, ...(categoriesReq.data?.data || [])]}
          renderItem={({ item }) => (
            <CategoryItem
              key={item.id}
              category={item}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              onPress={onCategoryPress}
            />
          )}
        />
      )}
    </View>
  );
}

function CategoryItem({
  category,
  selectedCategory,
  setSelectedCategory,
  onPress: onPress,
}: {
  category: Category;
  selectedCategory: number;
  setSelectedCategory: Dispatch<React.SetStateAction<number>>;
  onPress: () => void;
}) {
  return (
    <Pressable
      key={category.id}
      onPress={() => {
        onPress();
        setSelectedCategory(category.id);
      }}
      className={
        (selectedCategory === category.id ? "bg-foreground" : "bg-background") +
        " text-background items-center rounded-full self-center border border-border h-8 ml-2 px-2.5 py-0.5"
      }
    >
      <Text
        className={
          selectedCategory === category.id
            ? "text-background"
            : "text-foreground"
        }
      >
        {category.name}
      </Text>
    </Pressable>
  );
}
