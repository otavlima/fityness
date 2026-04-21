import { z } from "zod"

export const workoutSchema = z.object({
  name: z
    .string()
    .min(3, "Workout name must have at least 3 characters")
    .max(12, "The training name cannot exceed 12 characters."),

  category: z.enum([
    "upper-body",
    "lower-body",
    "push",
    "pull",
    "full-body"
  ]),

  notes: z.string().optional(),

  exercises: z.array(
    z.object({
      id: z.string(),

      name: z
        .string()
        .min(1, "Exercise name is required"),

      sets: z
        .string()
        .min(1, "Sets required"),

      reps: z
        .string()
        .min(1, "Reps required"),

      rest: z
        .string()
        .min(1, "Rest required"),
    })
  ).min(1, "Add at least one exercise"),
})

export type Workout = z.infer<typeof workoutSchema>