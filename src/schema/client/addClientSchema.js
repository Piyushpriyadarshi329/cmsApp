import { z } from "zod";

export const addClientSchema = z.object({
    name: z
        .string()
        .trim()
        .min(1, "Name is required"),

    mobile: z
        .string()
        .trim()
        .min(1, "Mobile number is required")
        .regex(
            /^[6-9]\d{9}$/,
            "Please enter a valid 10-digit mobile number"
        ),

    pan: z
        .string()
        .trim()
        .min(1, "PAN is required"),

    gst: z
        .string()
        .trim()
        .min(1, "GST is required"),

    address: z
        .string()
        .trim()
        .min(1, "Address is required"),

    email: z
        .string()
        .trim()
        .min(1, "Email is required")
        .email("Please enter a valid email address"),

    city: z
    .string()
    .trim(),

    state: z
    .string()
    .trim(),

    pincode: z
    .string()
    .trim(),

    country: z
    .string()
    .trim(),

});