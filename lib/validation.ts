import { z } from "zod";
import { TRAININGS } from "./content";

export const EDUCATION_LEVELS = [
  "Below SEE",
  "SEE passed",
  "+2 / Intermediate",
  "Diploma / Technical (CTEVT)",
  "Bachelor's or above",
] as const;

type TrainingValue = (typeof TRAININGS)[number]["value"];
const trainingValues = TRAININGS.map((t) => t.value) as [
  TrainingValue,
  ...TrainingValue[],
];

export const registrationSchema = z.object({
  training: z.enum(trainingValues, { message: "Select a training" }),

  fullName: z.string().trim().min(3, "Enter your full name").max(120),

  phone: z
    .string()
    .trim()
    .regex(
      /^9[78]\d{8}$/,
      "Enter a 10-digit mobile number starting with 97 or 98",
    ),

  email: z
    .string()
    .trim()
    .email("Enter a valid email address")
    .max(191)
    .optional()
    .or(z.literal("")),

  age: z.coerce
    .number({ invalid_type_error: "Enter your age" })
    .int("Enter a whole number")
    .min(16, "You must be at least 16 years old")
    .max(60, "Enter an age of 60 or below"),

  gender: z.enum(["MALE", "FEMALE", "OTHER"], {
    message: "Select your gender",
  }),

  province: z.string().min(1, "Select your province"),
  district: z.string().min(1, "Select your district"),
  municipality: z.string().min(1, "Select your municipality"),

  address: z
    .string()
    .trim()
    .min(2, "Enter your tole, street or ward no.")
    .max(255)
    .optional(),

  education: z.enum(EDUCATION_LEVELS, {
    message: "Select your education level",
  }),

  referralSource: z.string().trim().max(150).optional(),

  hasExperience: z.boolean(),

  experienceNote: z
    .string()
    .trim()
    .max(500, "Keep this under 500 characters")
    .optional(),

  consent: z.literal(true, {
    message: "Confirm that your details are correct",
  }),

  website: z.string().max(0).optional(),
  captchaToken: z.string().min(1, "Please complete CAPTCHA"),
});

export type RegistrationInput = z.infer<typeof registrationSchema>;

export function toFieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};

  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!out[key]) out[key] = issue.message;
  }

  return out;
}
