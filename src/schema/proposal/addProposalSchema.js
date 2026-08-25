import { z } from "zod";

export const addProposalSchema = z.object({
    title: z
        .string()
        .trim()
        .min(1, "Title is required"),

    clientId: z
        .string()
        .trim()
        .min(1, "Client is required"),

    clientUserId: z
        .string()
        .trim()
        .min(1, "Client User is required"),

    proposalStartDate: z
        .string()
        .trim()
        .min(1, "Proposal start date is required"),

    proposalAmount: z
        .string()
        .trim()
        .min(1, "Proposal amount is required")
        .refine(
            (value) => !isNaN(Number(value)) && Number(value) >= 0,
            "Proposal amount must be a valid number"
        ),

    billing: z
        .string()
        .trim()
        .min(1, "Billing is required"),

    startDate: z
        .string()
        .trim()
        .min(1, "Start date is required"),

    endDate: z
        .string()
        .trim()
        .min(1, "End date is required"),

    description: z
        .string()
        .trim()
        .min(1, "Description is required"),
});