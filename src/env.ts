import { createEnv } from '@t3-oss/env-core'
import { z } from 'zod'

export const env = createEnv({
  clientPrefix: 'VITE_',

  server: {
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  },

  client: {
    VITE_CONVEX_URL: z.string().url(),
  },

  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    VITE_CONVEX_URL: import.meta.env.VITE_CONVEX_URL,
  },

  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
})
