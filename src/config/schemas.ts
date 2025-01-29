import { Network } from "@verida/types"
import { z } from "zod"

export const CommonConfigSchema = z.object({
  BASE_URL: z.string().url(),
  DEV_MODE: z
    .string()
    .optional()
    .transform((value) => value === "true"),
  VERIDA_NETWORK: z
    .enum(["myrtle", "banksia", "devnet", "local"])
    .default("banksia")
    .transform((value) => {
      return value === "myrtle"
        ? Network.MYRTLE
        : value === "banksia"
          ? Network.BANKSIA
          : value === "devnet"
            ? Network.DEVNET
            : value === "local"
              ? Network.LOCAL
              : Network.BANKSIA
    }),
  VERIDA_RPC_URL: z
    .union([z.string().url(), z.literal("")])
    .optional()
    .transform((value) => (value === "" ? undefined : value)),
  isClient: z.boolean(),
  appVersion: z.string(),
})

export const ServerConfigSchema = z.object({
  // ... any server-specific properties
})
