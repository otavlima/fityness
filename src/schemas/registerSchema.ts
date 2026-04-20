import { z } from "zod"

export const registerSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required.')
    .min(3, 'Name must be at least 3 characters.')
    .max(24, 'Name cannot exceed 24 characters.'),
  username: z
    .string()
    .min(1, 'Username is required.')
    .min(3, 'Username must be at least 3 characters.')
    .max(16, 'Username cannot exceed 16 characters.')
    .regex(/^[a-zA-Z0-9_]+$/, "Only letters, numbers and underscore"),
  email: z
    .string()
    .min(1, 'Email is required.')
    .email('Invalid email.'),
  password: z
    .string()
    .min(1, 'Password is required.')
    .min(6, 'Password must be at least 6 characters.'),
  confirmPassword: z
    .string()
    .min(1, 'Please confirm your password.'),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match.',
  path: ['confirmPassword'],
})

export type RegisterSchema = z.infer<typeof registerSchema>