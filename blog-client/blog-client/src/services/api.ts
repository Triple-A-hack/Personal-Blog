import type { AxiosResponse } from 'axios';
import type {
  AdminPostListParams,
  ApiResponse,
  AuthResult,
  Category,
  Comment,
  CommentInput,
  LoginInput,
  Paginated,
  Post,
  PostInput,
  PostListParams,
  PostSummary,
  RegisterInput,
  Tag,
} from '@/types/blog';
import { ApiError, apiClient } from './apiClient';

async function unwrap<T>(request: Promise<AxiosResponse<ApiResponse<T>>>): Promise<T> {
  const response = await request;
  const body = response.data;
  if (!body.success) throw new ApiError(body.error.message, response.status);
  return body.data;
}

/* --------------------------------- Auth --------------------------------- */

export const login = (input: LoginInput): Promise<AuthResult> =>
  unwrap(apiClient.post<ApiResponse<AuthResult>>('/auth/login', input));

export const register = (input: RegisterInput): Promise<AuthResult> =>
  unwrap(apiClient.post<ApiResponse<AuthResult>>('/auth/register', input));

/* --------------------------------- Posts -------------------------------- */

export const getPosts = (params: PostListParams): Promise<Paginated<PostSummary>> =>
  unwrap(apiClient.get<ApiResponse<Paginated<PostSummary>>>('/posts', { params }));

export const getAdminPosts = (params: AdminPostListParams): Promise<Paginated<PostSummary>> =>
  unwrap(apiClient.get<ApiResponse<Paginated<PostSummary>>>('/admin/posts', { params }));

export const getPostBySlug = (slug: string): Promise<Post> =>
  unwrap(apiClient.get<ApiResponse<Post>>(`/posts/${encodeURIComponent(slug)}`));

export const createPost = (input: PostInput): Promise<Post> =>
  unwrap(apiClient.post<ApiResponse<Post>>('/posts', input));

export const updatePost = (id: string, input: Partial<PostInput>): Promise<Post> =>
  unwrap(apiClient.put<ApiResponse<Post>>(`/posts/${id}`, input));

export const deletePost = (id: string): Promise<{ id: string }> =>
  unwrap(apiClient.delete<ApiResponse<{ id: string }>>(`/posts/${id}`));

/* ------------------------------- Taxonomy ------------------------------- */

export const getCategories = (): Promise<Category[]> =>
  unwrap(apiClient.get<ApiResponse<Category[]>>('/categories'));

export const createCategory = (name: string): Promise<Category> =>
  unwrap(apiClient.post<ApiResponse<Category>>('/categories', { name }));

export const getTags = (): Promise<Tag[]> => unwrap(apiClient.get<ApiResponse<Tag[]>>('/tags'));

export const createTag = (name: string): Promise<Tag> =>
  unwrap(apiClient.post<ApiResponse<Tag>>('/tags', { name }));

/* -------------------------------- Comments ------------------------------ */

export const getCommentsByPost = (postId: string): Promise<Comment[]> =>
  unwrap(apiClient.get<ApiResponse<Comment[]>>(`/posts/${postId}/comments`));

export const addComment = (postId: string, input: CommentInput): Promise<Comment> =>
  unwrap(apiClient.post<ApiResponse<Comment>>(`/posts/${postId}/comments`, input));
