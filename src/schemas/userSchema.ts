import { z } from "zod"

export const userSchema = z.object({
  uid: z.string(),
  name: z.string(),
  username: z.string(),
  email: z.string().email(),
  photoURL: z.string().optional(),
  createdAt: z.date(),
})

export type User = z.infer<typeof userSchema>