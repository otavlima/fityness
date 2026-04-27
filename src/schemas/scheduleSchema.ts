import { z } from "zod"

export const scheduleSchema = z
  .object({
    title: z.string().min(1, "Required"),
    date: z.string().optional(),
    status: z.enum(["completed", "scheduled", "rest"]),
    isRecurring: z.boolean(),
    recurrence: z
      .object({
        type: z.enum(["weekly", "biweekly", "specific_days"]),
        weekdays: z
          .array(z.number())
          .min(1, "Select at least one day"),
        startDate: z.string(),
        endCondition: z.enum(["after_x", "on_date", "never"]),
        occurrences: z
            .string()
            .optional()
            .refine((val) => !val || !isNaN(Number(val)), {
                message: "Must be a number",
            }),
        endDate: z.string().optional(),
      })
      .optional(),
  })
  .refine((data) => {
    if (!data.isRecurring && !data.date) return false
    return true
  }, {
    message: "Date is required",
    path: ["date"],
  })
  .refine((data) => {
    if (data.isRecurring && !data.recurrence) return false
    return true
  }, {
    message: "Recurrence is required",
    path: ["recurrence"],
  })
  .refine((data) => {
    if (data.isRecurring && data.recurrence?.weekdays.length === 0) return false
    return true
  }, {
    message: "Pick at least one weekday",
    path: ["recurrence", "weekdays"],
  })
  .refine((data) => {
    if (
        data.isRecurring &&
        data.recurrence?.type === "specific_days" &&
        data.recurrence.weekdays.length === 0
    ) return false
    return true
    }, {
        message: "Pick at least one weekday",
        path: ["recurrence", "weekdays"],
    })

export type ScheduleFormData = z.infer<typeof scheduleSchema>