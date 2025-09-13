import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  files: defineTable({
    storageId: v.id("_storage"),
    filename: v.string(),
    size: v.number(),
    mimeType: v.string(),
    ownerId: v.id("users"),
  }).index("by_owner", ["ownerId"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
