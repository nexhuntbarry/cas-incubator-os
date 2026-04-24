import { auth, currentUser } from "@clerk/nextjs/server";

export type UserRole =
  | "super_admin"
  | "teacher"
  | "mentor"
  | "student"
  | "parent";

/**
 * Returns the role stored in Clerk publicMetadata, or null if unset.
 */
export async function getUserRole(): Promise<UserRole | null> {
  const user = await currentUser();
  if (!user) return null;
  const role = user.publicMetadata?.role as string | undefined;
  if (isValidRole(role)) return role;
  return null;
}

export function isValidRole(role: string | undefined): role is UserRole {
  return (
    role === "super_admin" ||
    role === "teacher" ||
    role === "mentor" ||
    role === "student" ||
    role === "parent"
  );
}

export async function isSuperAdmin(): Promise<boolean> {
  const role = await getUserRole();
  return role === "super_admin";
}

export async function isTeacher(): Promise<boolean> {
  const role = await getUserRole();
  return role === "teacher" || role === "super_admin";
}

export async function isMentor(): Promise<boolean> {
  const role = await getUserRole();
  return role === "mentor" || role === "teacher" || role === "super_admin";
}

export async function isStudent(): Promise<boolean> {
  const role = await getUserRole();
  return role === "student";
}

export async function isParent(): Promise<boolean> {
  const role = await getUserRole();
  return role === "parent";
}

/**
 * Returns the Clerk userId or throws if not authenticated.
 */
export async function requireAuth(): Promise<string> {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthenticated");
  return userId;
}

/**
 * Returns the Clerk userId or null if not authenticated.
 */
export async function getAuthUserId(): Promise<string | null> {
  const { userId } = await auth();
  return userId;
}
