import {
  fallbackApps,
  fallbackExperience,
  fallbackPosts,
  fallbackProfile,
  fallbackSkills
} from "./fallback-data";
import type { BlogPost, Experience, MobileApp, Profile, Skill } from "./types";

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

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
  return getJson<Profile>("/api/profile", fallbackProfile);
}

export async function getSkills(): Promise<Skill[]> {
  return getJson<Skill[]>("/api/skills", fallbackSkills);
}

export async function getExperience(): Promise<Experience[]> {
  return getJson<Experience[]>("/api/experience", fallbackExperience);
}

export async function getApps(): Promise<MobileApp[]> {
  return getJson<MobileApp[]>("/api/apps", fallbackApps);
}

export async function getPosts(limit = 3): Promise<BlogPost[]> {
  return getJson<BlogPost[]>(`/api/posts?limit=${limit}`, fallbackPosts);
}
