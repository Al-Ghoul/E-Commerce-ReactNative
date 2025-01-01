import { xiorInstance } from "@/lib/fetcher";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Dispatch, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { FlatList, Pressable, View } from "react-native";
import { Text } from "@/components/ui/text";

export default function SubCategories({
  categoryId,
  selectedSubCategory,
  setSelectedSubCategory,
  onSubCategoryPress,
}: {
  categoryId: string;
  selectedSubCategory: number;
  setSelectedSubCategory: Dispatch<React.SetStateAction<number>>;
  onSubCategoryPress: () => void;
}) {
  const subCategoriesOffset = 0;
  const [subCategoriesLimitBy, setSubCategoriesLimitBy] = useState(8);
  const fetchSubCategories = (id: string, offset: number, limitBy: number) =>
    xiorInstance
      .get(`/categories/${id}/subcategories/?limit=${limitBy}&offset=${offset}`)
      .then((res) => Promise.resolve(res.data))
      .catch((error) => Promise.reject(error));
  const subCategoriesReq = useQuery({
    queryKey: [
      "subCategories",
      categoryId,
      subCategoriesOffset,
      subCategoriesLimitBy,
    ],
    queryFn: () =>
      fetchSubCategories(categoryId, subCategoriesOffset, subCategoriesLimitBy),
    placeholderData: keepPreviousData,
  });

  const subCategoriesLimitByUpdate = useDebouncedCallback(() => {
    if (subCategoriesReq.data?.meta.total > subCategoriesLimitBy) {
      setSubCategoriesLimitBy((prevLimitBy) => prevLimitBy * 2);
    }
  }, 1000);

  return (
    <View className="my-2">
      {subCategoriesReq.isPending ? (
        <View className="mx-auto w-6 h-6 rounded-full animate-spin border-y border-solid border-primary border-t-transparent"></View>
      ) : (
        <FlatList
          onMomentumScrollEnd={subCategoriesLimitByUpdate}
          showsHorizontalScrollIndicator={false}
          horizontal
          data={[
            { id: -1, name: "All" },
            ...(subCategoriesReq.data?.data || []),
          ]}
          renderItem={({ item }) => (
            <SubCategoryItem
              key={item.id}
              subCategory={item}
              selectedSubCategory={selectedSubCategory}
              setSelectedSubCategory={setSelectedSubCategory}
              onPress={onSubCategoryPress}
            />
          )}
        />
      )}
    </View>
  );
}

function SubCategoryItem({
  subCategory,
  selectedSubCategory,
  setSelectedSubCategory,
  onPress: onPress,
}: {
  subCategory: Category;
  selectedSubCategory: number;
  setSelectedSubCategory: Dispatch<React.SetStateAction<number>>;
  onPress: () => void;
}) {
  return (
    <Pressable
      key={subCategory.id}
      onPress={() => {
        onPress();
        setSelectedSubCategory(subCategory.id);
      }}
      className={
        (selectedSubCategory === subCategory.id
          ? "bg-foreground"
          : "bg-background") +
        " text-background items-center rounded-full self-center border border-border h-8 ml-2 px-2.5 py-0.5"
      }
    >
      <Text
        className={
          selectedSubCategory === subCategory.id
            ? "text-background"
            : "text-foreground"
        }
      >
        {subCategory.name}
      </Text>
    </Pressable>
  );
}
