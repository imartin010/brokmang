import { z } from "zod";

export const inputsSchema = z.object({
  agents: z.number().min(1, "At least 1 agent required"),
  team_leaders: z.number().min(0, "Cannot be negative"),
  rent: z.number().min(0, "Cannot be negative"),
  salary: z.number().min(0, "Cannot be negative"),
  team_leader_share: z.number().min(0, "Cannot be negative"),
  others: z.number().min(0, "Cannot be negative"),
  marketing: z.number().min(0, "Cannot be negative"),
  sim: z.number().min(0, "Cannot be negative"),
  franchise_owner_salary: z.number().min(0, "Cannot be negative"),
  gross_rate: z.number().min(0).max(1, "Must be between 0 and 1"),
  agent_comm_per_1m: z.number().min(0, "Cannot be negative"),
  tl_comm_per_1m: z.number().min(0, "Cannot be negative"),
  withholding: z.number().min(0).max(1, "Must be between 0 and 1"), // Fixed at 5% (0.05)
  vat: z.number().min(0).max(1, "Must be between 0 and 1"), // Fixed at 14% (0.14)
  income_tax: z
    .number()
    .min(0.07, "Income tax must be at least 7%")
    .max(0.12, "Income tax cannot exceed 12%"),
});

export const DEFAULT_INPUTS = {
  agents: 0,
  team_leaders: 0,
  rent: 0,
  salary: 0,
  team_leader_share: 0,
  others: 0,
  marketing: 0,
  sim: 0,
  franchise_owner_salary: 0,
  gross_rate: 0,
  agent_comm_per_1m: 0,
  tl_comm_per_1m: 0,
  withholding: 0.05, // Fixed at 5%
  vat: 0.14, // Fixed at 14%
  income_tax: 0.07, // Minimum allowed value (7%)
};

