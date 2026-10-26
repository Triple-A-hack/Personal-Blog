import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button, buttonClasses } from '@/components/ui/Button';
import { FieldShell, SelectField, TextAreaField, TextField } from '@/components/ui/FormFields';
import { useToast } from '@/context/ToastContext';
import { useCategories, useCreatePost, useTags, useUpdatePost } from '@/hooks/queries';
import { POST_STATUSES, type Post, type PostInput } from '@/types/blog';
import { isHtmlEmpty, slugify } from '@/utils/format';
import { TiptapEditor } from '../editor/TiptapEditor';
import { TagMultiSelect } from './TagMultiSelect';

function isHttpUrl(value: string): boolean {
  try {
    const { protocol } = new URL(value);
    return protocol === 'http:' || protocol === 'https:';
  } catch {
    return false;
  }
}

const postFormSchema = z.object({
  title: z.string().trim().min(3, 'Title must be at least 3 characters').max(200, 'Title must be at most 200 characters'),
  excerpt: z.string().trim().max(500, 'Excerpt must be at most 500 characters'),
  coverImage: z.string().trim().refine((v) => v === '' || isHttpUrl(v), 'Enter a valid http(s) image URL'),
  content: z.string().refine((html) => !isHtmlEmpty(html), 'Content is required'),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']),
  categoryId: z.string(),
  tagIds: z.array(z.string()),
});

type PostFormValues = z.infer<typeof postFormSchema>;

export function PostForm({ post }: { post?: Post }) {
  const navigate = useNavigate();
  const toast = useToast();
  const categoriesQuery = useCategories();
  const tagsQuery = useTags();
  const createPost = useCreatePost();
  const updatePost = useUpdatePost();

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<PostFormValues>({
    resolver: zodResolver(postFormSchema),
    defaultValues: {
      title: post?.title ?? '',
      excerpt: post?.excerpt ?? '',
      coverImage: post?.coverImage ?? '',
      content: post?.content ?? '',
      status: post?.status ?? 'DRAFT',
      categoryId: post?.categoryId ?? '',
      tagIds: post?.tags.map((tag) => tag.id) ?? [],
    },
  });

  const title = watch('title');
  const coverImage = watch('coverImage').trim();
  // The server owns the final slug (it adds a suffix on collisions and never changes it afterwards).
  const slugPreview = post ? post.slug : slugify(title);

  const onSubmit = handleSubmit(async (values) => {
    const input: PostInput = {
      title: values.title,
      excerpt: values.excerpt.trim() === '' ? null : values.excerpt.trim(),
      content: values.content,
      coverImage: values.coverImage === '' ? null : values.coverImage,
      status: values.status,
      categoryId: values.categoryId === '' ? null : values.categoryId,
      tagIds: values.tagIds,
    };

    try {
      if (post) {
        await updatePost.mutateAsync({ id: post.id, input });
        toast.success('Post updated.');
      } else {
        await createPost.mutateAsync(input);
        toast.success('Post created.');
      }
      navigate('/admin/posts');
    } catch {
      // Error toast is raised by the global mutation handler.
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="space-y-6">
        <TextField label="Title" placeholder="A headline that earns the click" error={errors.title?.message} {...register('title')} />

        <FieldShell
          id="post-slug"
          label="Slug"
          hint={post ? 'The slug is fixed after creation so existing links keep working.' : 'Generated from the title when you save.'}
        >
          <input
            id="post-slug"
            readOnly
            value={slugPreview || '—'}
            aria-describedby="post-slug-hint"
            className="block w-full cursor-not-allowed rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 font-mono text-sm text-gray-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400"
          />
        </FieldShell>

        <TextAreaField
          label="Excerpt"
          rows={3}
          placeholder="A short summary shown on cards and in search results"
          error={errors.excerpt?.message}
          {...register('excerpt')}
        />

        <FieldShell id="post-content" label="Content" error={errors.content?.message}>
          <Controller
            control={control}
            name="content"
            render={({ field, fieldState }) => (
              <TiptapEditor value={field.value} onChange={field.onChange} onBlur={field.onBlur} invalid={Boolean(fieldState.error)} />
            )}
          />
        </FieldShell>
      </div>

      <aside className="space-y-6 xl:sticky xl:top-8 xl:self-start">
        <div className="space-y-5 rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
          <SelectField label="Status" error={errors.status?.message} {...register('status')}>
            {POST_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status.charAt(0) + status.slice(1).toLowerCase()}
              </option>
            ))}
          </SelectField>

          <SelectField
            label="Category"
            hint={categoriesQuery.isLoading ? 'Loading categories…' : undefined}
            error={errors.categoryId?.message}
            {...register('categoryId')}
          >
            <option value="">No category</option>
            {(categoriesQuery.data ?? []).map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </SelectField>

          <TextField
            label="Cover image URL"
            type="url"
            inputMode="url"
            placeholder="https://…"
            error={errors.coverImage?.message}
            {...register('coverImage')}
          />
          {coverImage !== '' && isHttpUrl(coverImage) && (
            <img src={coverImage} alt="Cover preview" className="aspect-[16/9] w-full rounded-lg border border-gray-200 object-cover dark:border-gray-800" />
          )}
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
          <h2 className="mb-3 text-sm font-medium text-gray-800 dark:text-gray-200">Tags</h2>
          <Controller
            control={control}
            name="tagIds"
            render={({ field }) => (
              <TagMultiSelect tags={tagsQuery.data ?? []} value={field.value} onChange={field.onChange} />
            )}
          />
        </div>

        <div className="flex gap-3">
          <Button type="submit" loading={isSubmitting} className="flex-1">
            {post ? 'Save changes' : 'Create post'}
          </Button>
          <Link to="/admin/posts" className={buttonClasses('secondary')}>
            Cancel
          </Link>
        </div>
      </aside>
    </form>
  );
}
