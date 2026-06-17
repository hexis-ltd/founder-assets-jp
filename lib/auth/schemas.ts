import { z } from "zod";
import { USER_ASSET_STATUS_VALUES } from "@/lib/types";

export const authPayloadSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  password: z.string().min(8).max(128),
});

export const assetStatePayloadSchema = z.object({
  assetId: z.string().min(1).max(120),
  status: z.enum(USER_ASSET_STATUS_VALUES),
});
