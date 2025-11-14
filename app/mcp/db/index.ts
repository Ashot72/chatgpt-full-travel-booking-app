import prisma from "@/lib/prisma";

type EnsureUserResult =
  | { success: true; created: boolean; user: { id: string; email: string } }
  | { success: false; error: string };

export async function ensureUser(email: string): Promise<EnsureUserResult> {
  try {
    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: { email },
      select: { id: true, email: true },
    });

    return { success: true, created: false, user };
  } catch (error) {
    console.error("Failed to ensure user", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
