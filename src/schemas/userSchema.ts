import { z } from "zod"

export const userSchema = z.object({
  uid: z.string(),
  name: z.string(),
  username: z.string(),
  email: z.string().email(),
  photoURL: z.string().optional(),
  createdAt: z.date(),
  streak: z.number().default(1),
  streakDates: z.array(z.string()).default([]),
})

export type User = z.infer<typeof userSchema>