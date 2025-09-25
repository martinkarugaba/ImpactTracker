import { handlers } from "@/features/auth/auth";

export const { GET, POST } = handlers;

// Force Node.js runtime to support database connections
export const runtime = "nodejs";
