export type Role = 'ADMIN' | 'AUTHOR' | 'READER';
export type PostStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export const POST_STATUSES: readonly PostStatus[] = ['DRAFT', 'PUBLISHED', 'ARCHIVED'];

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  role: Role;
  createdAt: string;
}

/** Public subset of a user embedded in posts and comments. */
export interface AuthorSummary {
  id: string;
  name: string;
  avatarUrl: string | null;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
}

/** Post as returned by list endpoints (no body content). */
export interface PostSummary {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImage: string | null;
  status: PostStatus;
  authorId: string;
  categoryId: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  author: AuthorSummary;
  category: Category | null;
  tags: Tag[];
}

export interface Post extends PostSummary {
  content: string;
}

export interface Comment {
  id: string;
  postId: string;
  parentId: string | null;
  content: string;
  createdAt: string;
  user: AuthorSummary;
  replies: Comment[];
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface Paginated<T> {
  items: T[];
  pagination: Pagination;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiFailure {
  success: false;
  error: { message: string; details?: unknown };
}

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

/* ------------------------------ Inputs ---------------------------------- */

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export interface AuthResult {
  user: User;
  token: string;
}

export interface PostListParams {
  page?: number;
  limit?: number;
  category?: string;
  tag?: string;
  search?: string;
}

export interface AdminPostListParams {
  page?: number;
  limit?: number;
  status?: PostStatus;
  search?: string;
}

export interface PostInput {
  title: string;
  excerpt?: string | null;
  content: string;
  coverImage?: string | null;
  status: PostStatus;
  categoryId?: string | null;
  tagIds: string[];
}

export interface CommentInput {
  content: string;
  parentId?: string | null;
}
