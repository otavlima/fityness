import { z } from "zod"

export const scheduleSchema = z
  .object({
    workoutId: z.string().min(1, "Select a workout"),
    time: z.string().min(1, "Time is required"),
    notes: z.string().optional(),
    isRecurring: z.boolean(),
    date: z.string().optional(),
    recurrence: z
      .object({
        type: z.enum(["weekly", "biweekly", "specific_days"]),
        weekdays: z.array(z.number()),
        startDate: z.string().optional(),
        endCondition: z.enum(["after_x", "on_date", "never"]),
        occurrences: z.string().optional().refine(val => !val || !isNaN(Number(val)), { message: "Must be a number" }),
        endDate: z.string().optional(),
      })
      .optional(),
  })
  .refine(data => !(!data.isRecurring && !data.date), { message: "Date is required", path: ["date"] })
  .refine(data => !(data.isRecurring && !data.recurrence), { message: "Recurrence is required", path: ["recurrence"] })
  .refine(data => !(data.isRecurring && data.recurrence?.type === "specific_days" && (!data.recurrence.weekdays || data.recurrence.weekdays.length === 0)), { message: "Pick at least one weekday", path: ["recurrence", "weekdays"] })

export type ScheduleFormData = z.infer<typeof scheduleSchema>