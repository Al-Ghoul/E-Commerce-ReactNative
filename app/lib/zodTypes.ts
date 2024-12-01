import { z } from "zod";

export const RegisterInputSchema = z.object({
  email: z
    .string({
      required_error: "Email is required",
      invalid_type_error: "Email must be a string",
    })
    .email(),
  password: z
    .string({
      required_error: "Password is required",
      invalid_type_error: "Password must be a string",
    })
    .min(8, "Password must be at least 8 characters"),
});

export const RegisterInputClientSchema = RegisterInputSchema.extend({
  confirmPassword: z
    .string({
      required_error: "Confirm Password is required",
      invalid_type_error: "Confirm Password must be a string",
    })
    .min(8, "Password must be at least 8 characters"),
}).superRefine((val, ctx) => {
  if (val.password !== val.confirmPassword)
    ctx.addIssue({
      code: "custom",
      message: "Passwords do NOT match.",
      path: ["confirmPassword"],
    });
});

export type RegisterInputClientSchemaType = z.infer<
  typeof RegisterInputClientSchema
>;

export type LoginInputClientSchemaType = z.infer<typeof RegisterInputSchema>;

export const CartItemInputSchema = z.object({
  product_id: z.string(),
  quantity: z.number(),
});

export type CartItemInputSchemaType = z.infer<typeof CartItemInputSchema>;

export const ShippingAddressInputSchema = z.object({
  full_name: z.string().min(3, "Full name must be at least 3 characters"),
  address: z.string().min(3, "Address must be at least 3 characters"),
  city: z.string().min(3, "City must be at least 3 characters"),
  country: z.string().min(3, "Country must be at least 3 characters"),
  postal_code: z.string().min(3, "Postal code must be at least 3 characters"),
});

export type ShippingAddressInputSchemaType = z.infer<
  typeof ShippingAddressInputSchema
>;

export const PaymentInputSchema = z.object({
  amount: z.number(),
  payment_method: z.enum(["cod", "paypal", "credit_card"]),
});

export type PaymentInputSchemaType = z.infer<typeof PaymentInputSchema>;

export const CreditCardInputSchema = z.object({
  card_number: z.string().min(16, "Card number must be at least 16 characters"),
  card_holder: z.string().min(3, "Card holder must be at least 3 characters"),
  card_expiry: z.string().min(3, "Card expiry must be at least 3 characters"),
  card_cvv: z.string().min(3, "Card cvv must be at least 3 characters"),
});

export type CreditCardInputSchemaType = z.infer<typeof CreditCardInputSchema>;
