/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as http from "../http.js";
import type * as lib_permissions from "../lib/permissions.js";
import type * as mission_reports from "../mission_reports.js";
import type * as permissions from "../permissions.js";
import type * as roles from "../roles.js";
import type * as seed from "../seed.js";
import type * as system_logs from "../system_logs.js";
import type * as telemetry_data from "../telemetry_data.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  http: typeof http;
  "lib/permissions": typeof lib_permissions;
  mission_reports: typeof mission_reports;
  permissions: typeof permissions;
  roles: typeof roles;
  seed: typeof seed;
  system_logs: typeof system_logs;
  telemetry_data: typeof telemetry_data;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
