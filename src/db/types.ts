import { Doc, Id } from "@convex/_generated/dataModel";
import { TABLE_SLUG_USERS } from "./constants";

export type User = Doc<typeof TABLE_SLUG_USERS>
export type UserID = Id<typeof TABLE_SLUG_USERS>
