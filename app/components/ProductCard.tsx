import Toast from "react-native-root-toast";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Text } from "./ui/text";
import { XiorResponse } from "xior";
import { type UseMutationResult } from "@tanstack/react-query";
import PlaceHolderImage from "@/assets/images/placeholder.svg";
import { Image } from "react-native";

export default function ProductCard ({
  product,
  createCartItemReq,
}: {
  product: Product;
  createCartItemReq: UseMutationResult<
    XiorResponse<any>,
    Error,
    {
      product_id: string;
      quantity: number;
    },
    unknown
  >;
}) {
  return (
    <Card key={product.id} className="p-5 mb-3">
      <CardTitle>{product.name}</CardTitle>
      <CardHeader className="w-full flex-row justify-between py-0">
        <Text>{product.subcategory_name}</Text>
        <Text>{product.stock_quantity} in stock</Text>
      </CardHeader>
      <CardContent className="p-0 items-center mt-2">
        {product.image ? (
          <Image src={product.image} className="w-full h-40" />
        ) : (
          <PlaceHolderImage />
        )}
      </CardContent>
      <CardFooter className="flex-row justify-between mt-4 mb-0 p-0">
        <Text>${product.price}</Text>
        <Button
          disabled={createCartItemReq.isPending || product.stock_quantity === 0}
          onPress={() => {
            createCartItemReq
              .mutateAsync({
                product_id: product.id.toString(),
                quantity: 1,
              })
              .then(() => {
                Toast.show(`${product.name} added to cart`);
              })
              .catch((err) => {
                const data = err.response.data;
                Toast.show(data.message || data.detail);
              });
          }}
        >
          <Text>Add to cart</Text>
        </Button>
      </CardFooter>
    </Card>
  );
}
