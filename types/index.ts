// Centralized type definitions for the Inkwell platform

export interface Profile {
  id: string;
  name: string;
  email: string;
  bio?: string;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Post {
  id: string;
  user_id: string;
  title: string;
  content?: string;
  cover_image_url?: string;
  cover_image_key?: string;
  is_draft: boolean;
  tags: string[];
  created_at: string;
  updated_at?: string;
  profiles?: Pick<Profile, 'name' | 'avatar_url' | 'bio'>;
}

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  parent_id?: string;
  created_at: string;
  updated_at?: string;
  profiles?: Pick<Profile, 'name' | 'avatar_url'>;
}

export interface Follow {
  follower_id: string;
  following_id: string;
  created_at?: string;
}

export interface Like {
  id: string;
  post_id: string;
  user_id: string;
  created_at?: string;
}

// Available topic tags
export const TOPICS = [
  'Technology',
  'Design',
  'Startups',
  'Culture',
  'Programming',
  'Literature',
  'Poetry',
  'Business',
  'Art',
] as const;

export type Topic = (typeof TOPICS)[number];

// Helper: estimate reading time from HTML content
export function estimateReadingTime(html: string): number {
  const text = html.replace(/<[^>]*>/g, '');
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

// Helper: sanitize HTML (strip script/event handlers)
export function sanitizeHtml(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/on\w+\s*=\s*[^\s>]*/gi, '')
    .replace(/javascript\s*:/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/<embed\b[^>]*>/gi, '');
}
