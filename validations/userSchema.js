import { z } from 'zod';

export const UserSignupSchema = z.object({
  username: z.string()
    .min(3)
    .max(20)
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain alphanumeric characters and underscores"),
  
  email: z.string()
    .email("Invalid email format")
    .transform(val => val.toLowerCase()),
  
  password: z.string()
    .min(8, "Password must be at least 8 characters long"),
  
  displayName: z.string()
    .min(1)
    .max(50),
  
  bio: z.string()
    .max(200)
    .optional()
    .default(""),
  
  avatarUrl: z.string()
    .url("Invalid URL format")
    .max(500)
    .or(z.literal(""))
    .optional()
    .default(""),
  
  acceptingQuestions: z.boolean()
    .default(true),
  
  tags: z.array(
    z.string().regex(/^[a-z0-9-]{2,20}$/, "Tags must be lowercase slugs, 2-20 chars")
  ).max(10, "Maximum of 10 tags allowed").default([])
});
export const UserLoginSchema = z.object({
  email: z.string()
    .email("Invalid email format")
    .transform(val => val.toLowerCase()),
  
  password: z.string()
    .min(8, "Password must be at least 8 characters long"),
})
export const UpdateMeSchema = z.object({
  displayName: z.string()
    .min(1, "Display name must be at least 1 characters")
    .max(50, "Display name cannot exceed 50 characters")
    .trim()
    .optional(),
  
  bio: z.string()
    .max(200, "Bio cannot exceed 200 characters")
    .trim()
    .optional()
    .nullable(),
  
  avatarUrl: z.string()
  .url("Must be a valid URL")
  .max(500, "Avatar URL cannot exceed 500 characters")
  .or(z.literal(""))
  .optional()
  .nullable(),
tags: z.array(
  z.string().regex(/^[a-z0-9-]{2,20}$/, "Tags must be lowercase slugs, 2-20 chars")
).max(10, "Cannot have more than 10 tags")
.optional()
.default([]),
  
  acceptingQuestions: z.boolean()
    .optional(),
  

})
.refine(data => Object.keys(data).length > 0, {
  message: "At least one field must be provided for update"
});

export const ForgotPasswordSchema = z.object({
  email: z.string().email("Invalid email format").transform(val => val.toLowerCase())
});

export const ResetPasswordSchema = z.object({
  token: z.string().min(1, "Token is required"),
  password: z.string().min(8, "Password must be at least 8 characters long")
});

export const RefreshTokenSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required")
});
