import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from '@tanstack/react-query';
import {
  addComment,
  createCategory,
  createPost,
  createTag,
  deletePost,
  getAdminPosts,
  getCategories,
  getCommentsByPost,
  getPostBySlug,
  getPosts,
  getTags,
  updatePost,
} from '@/services/api';
import type {
  AdminPostListParams,
  Category,
  Comment,
  CommentInput,
  Paginated,
  Post,
  PostInput,
  PostListParams,
  PostSummary,
  Tag,
} from '@/types/blog';

export const queryKeys = {
  posts: (params: PostListParams) => ['posts', params] as const,
  adminPosts: (params: AdminPostListParams) => ['admin-posts', params] as const,
  post: (slug: string) => ['post', slug] as const,
  categories: ['categories'] as const,
  tags: ['tags'] as const,
  comments: (postId: string) => ['comments', postId] as const,
};

/* --------------------------------- Queries ------------------------------- */

export function usePosts(params: PostListParams): UseQueryResult<Paginated<PostSummary>> {
  return useQuery({
    queryKey: queryKeys.posts(params),
    queryFn: () => getPosts(params),
    placeholderData: keepPreviousData,
  });
}

export function useAdminPosts(params: AdminPostListParams): UseQueryResult<Paginated<PostSummary>> {
  return useQuery({
    queryKey: queryKeys.adminPosts(params),
    queryFn: () => getAdminPosts(params),
    placeholderData: keepPreviousData,
    staleTime: 0,
  });
}

export function usePost(slug: string): UseQueryResult<Post> {
  return useQuery({
    queryKey: queryKeys.post(slug),
    queryFn: () => getPostBySlug(slug),
    enabled: slug.length > 0,
  });
}

export function useCategories(): UseQueryResult<Category[]> {
  return useQuery({ queryKey: queryKeys.categories, queryFn: getCategories, staleTime: 5 * 60_000 });
}

export function useTags(): UseQueryResult<Tag[]> {
  return useQuery({ queryKey: queryKeys.tags, queryFn: getTags, staleTime: 5 * 60_000 });
}

export function useComments(postId: string): UseQueryResult<Comment[]> {
  return useQuery({
    queryKey: queryKeys.comments(postId),
    queryFn: () => getCommentsByPost(postId),
    enabled: postId.length > 0,
  });
}

/* -------------------------------- Mutations ------------------------------ */

export function useCreatePost(): UseMutationResult<Post, Error, PostInput> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createPost,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['posts'] }),
        queryClient.invalidateQueries({ queryKey: ['admin-posts'] }),
      ]);
    },
  });
}

export function useUpdatePost(): UseMutationResult<Post, Error, { id: string; input: Partial<PostInput> }> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }) => updatePost(id, input),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['posts'] }),
        queryClient.invalidateQueries({ queryKey: ['admin-posts'] }),
        queryClient.invalidateQueries({ queryKey: ['post'] }),
      ]);
    },
  });
}

export function useDeletePost(): UseMutationResult<{ id: string }, Error, string> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deletePost,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['posts'] }),
        queryClient.invalidateQueries({ queryKey: ['admin-posts'] }),
        queryClient.invalidateQueries({ queryKey: ['post'] }),
      ]);
    },
  });
}

export function useAddComment(postId: string): UseMutationResult<Comment, Error, CommentInput> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input) => addComment(postId, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.comments(postId) }),
  });
}

export function useCreateCategory(): UseMutationResult<Category, Error, string> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createCategory,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.categories }),
  });
}

export function useCreateTag(): UseMutationResult<Tag, Error, string> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createTag,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.tags }),
  });
}
