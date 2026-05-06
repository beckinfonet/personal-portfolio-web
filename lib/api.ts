import {
  PROFILE,
  PROJECTS,
  EXPERIENCE,
  WRITING,
  SHIPPED,
  STACK
} from "./portfolio-data";
import type {
  Profile,
  Project,
  Experience,
  Writing,
  ShippedApp,
  StackCategory
} from "./types";

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

/**
 * ISR-cached fetch with silent fallback. Existing pattern preserved per DATA-04.
 * Phase 6 / BACKEND-04 will add zod schema validation and URL/scheme guards
 * (the silent catch is the chokepoint where validation will hook in).
 */
async function getJson<T>(path: string, fallback: T): Promise<T> {
  try {
    const response = await fetch(`${baseUrl}${path}`, {
      next: { revalidate: 300 }
    });
    if (!response.ok) return fallback;
    return (await response.json()) as T;
  } catch {
    return fallback;
  }
}

export async function getProfile(): Promise<Profile> {
  return getJson<Profile>("/api/profile", PROFILE);
}

export async function getProjects(): Promise<Project[]> {
  return getJson<Project[]>("/api/projects", PROJECTS);
}

export async function getExperience(): Promise<Experience[]> {
  return getJson<Experience[]>("/api/experience", EXPERIENCE);
}

export async function getWriting(): Promise<Writing[]> {
  return getJson<Writing[]>("/api/posts", WRITING);
}

export async function getShipped(): Promise<ShippedApp[]> {
  return getJson<ShippedApp[]>("/api/apps", SHIPPED);
}

export async function getStack(): Promise<StackCategory[]> {
  return getJson<StackCategory[]>("/api/stack", STACK);
}
