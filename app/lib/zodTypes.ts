import {z} from "zod";

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

