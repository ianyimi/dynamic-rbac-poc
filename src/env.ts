import { createEnv } from '@t3-oss/env-core'
import { z } from 'zod'

/**
 * Environment variable validation for TanStack Start + Convex
 *
 * This uses the T3 env validation pattern adapted for TanStack Start.
 *
 * Server vars: Only available server-side, never exposed to client
 * Client vars: Must be prefixed with VITE_, exposed to browser
 */
export const env = createEnv({
  /**
   * Client-side environment variable prefix
   * All client vars must start with this prefix
   */
  clientPrefix: 'VITE_',

  /**
   * Server-side environment variables
   * These are only available on the server and are never sent to the client
   */
  server: {
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),

    SITE_URL: z.string().url().optional(),
    // OpenAI API Key (for AI agents in Lambda)
    OPENAI_API_KEY: z.string().min(1).optional(),

    // Better Auth secrets (for authentication)
    BETTER_AUTH_SECRET: z.string().min(32).optional(),

    // AWS credentials (for Lambda, SQS, S3 - Phase 5+)
    AWS_REGION: z.string().optional(),
    AWS_ACCESS_KEY_ID: z.string().optional(),
    AWS_SECRET_ACCESS_KEY: z.string().optional(),

    // Convex deployment URL (server-side operations)
    CONVEX_URL: z.string().url().optional(),

  },

  /**
   * Client-side environment variables
   * These MUST be prefixed with VITE_ to be exposed to the browser
   */
  client: {
    // Convex public URL (client-side SDK) - .convex.cloud for queries/mutations
    VITE_CONVEX_URL: z.string().url().optional(),
    // Convex HTTP URL - .convex.site for HTTP routes (Better Auth)
    VITE_CONVEX_SITE_URL: z.string().url().optional(),
    VITE_SITE_URL: z.string().url().optional(),
  },

  /**
   * Runtime environment variable mapping
   * You must manually destructure `process.env` here to work with:
   * - Edge runtimes (Cloudflare Workers, Vercel Edge)
   * - Build-time validation
   */
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    SITE_URL: process.env.SITE_URL,

    // Server vars
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    AWS_REGION: process.env.AWS_REGION,
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
    CONVEX_URL: process.env.CONVEX_URL,


    // Client vars (Vite exposes these automatically to import.meta.env)
    VITE_CONVEX_URL: process.env.VITE_CONVEX_URL,
    VITE_CONVEX_SITE_URL: process.env.VITE_CONVEX_SITE_URL,
    VITE_SITE_URL: process.env.VITE_SITE_URL,
  },

  /**
   * Skip validation during build if this is set to "1"
   * Useful for CI/CD pipelines where env vars may not be available
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,

  /**
   * Treat empty strings as undefined
   * This prevents accidentally passing empty strings as valid values
   */
  emptyStringAsUndefined: true,
})
