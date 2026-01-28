import { httpRouter } from "convex/server"
import { httpAction } from "./_generated/server"
import { createAuth } from "./auth"

const http = httpRouter()

/**
 * Auth handler - handles Better Auth requests with custom adapter
 */
const authRequestHandler = httpAction(async (ctx, request) => {
  try {
    const auth = createAuth(ctx)
    const response = await auth.handler(request)
    return response
  } catch (error) {
    console.error("❌ Auth error:", error)
    return new Response("Auth error", { status: 500 })
  }
})

// Register auth routes with pathPrefix (matches all paths under /api/auth/)
http.route({
  pathPrefix: "/api/auth/",
  method: "GET",
  handler: authRequestHandler,
})

http.route({
  pathPrefix: "/api/auth/",
  method: "POST",
  handler: authRequestHandler,
})

// Optional: OpenID well-known configuration redirect
http.route({
  path: "/.well-known/openid-configuration",
  method: "GET",
  handler: httpAction(async () => {
    const url = `${process.env.SITE_URL}/api/auth/convex/.well-known/openid-configuration`
    return Response.redirect(url)
  }),
})

export default http
