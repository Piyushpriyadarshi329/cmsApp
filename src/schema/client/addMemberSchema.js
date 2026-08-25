import { z } from "zod";

export const addMemberSchema = z.object({
    firstname: z
        .string()
        .trim()
        .min(1, "First Name is required"),

    lastname: z
        .string()
        .trim()
        .min(1, "Last Name is required"),

    mobile: z
        .string()
        .trim()
        .min(1, "Mobile number is required")
        .regex(
            /^[6-9]\d{9}$/,
            "Please enter a valid 10-digit mobile number"
        ),
    email: z
        .string()
        .trim()
        .min(1, "Email is required")
        .email("Please enter a valid email address"),

    active: z.boolean(),
});