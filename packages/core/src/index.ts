import { z } from "zod";

export const contentModes = ["general", "adult", "hybrid"] as const;
export type ContentMode = (typeof contentModes)[number];

export const contentMode: ContentMode = (() => {
  const value =
    typeof process !== "undefined"
      ? process.env.NEXT_PUBLIC_CONTENT_MODE
      : undefined;
  return contentModes.includes(value as ContentMode)
    ? (value as ContentMode)
    : "hybrid";
})();

export const loginSchema = z.object({
  identifier: z.string().min(3).max(120),
  password: z.string().min(6).max(120),
});

export const registerSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.email(),
  password: z.string().min(6).max(120),
  role: z.enum(["fan", "creator"]),
});

export const checkoutSchema = z.object({
  kind: z.enum(["subscription", "post", "message"]),
  itemId: z.string().min(1),
  amountCents: z.coerce.number().int().positive(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;

export type TokenPair = {
  accessToken: string;
  accessExpiresAt: string;
  refreshToken: string;
  refreshExpiresAt: string;
};

export const DEMO_ACCOUNTS = {
  fan: { email: "fan@mimelux.com.br", password: "mimelux123" },
  creator: { email: "criadora@mimelux.com.br", password: "mimelux123" },
} as const;
