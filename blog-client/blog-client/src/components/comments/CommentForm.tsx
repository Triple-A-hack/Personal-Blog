import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { TextAreaField } from '@/components/ui/FormFields';

const commentSchema = z.object({
  content: z.string().trim().min(1, 'Write something before posting').max(2000, 'Comments are limited to 2000 characters'),
});

type CommentFormValues = z.infer<typeof commentSchema>;

interface CommentFormProps {
  label: string;
  submitLabel: string;
  placeholder?: string;
  autoFocus?: boolean;
  onSubmit: (content: string) => Promise<unknown>;
  onCancel?: () => void;
}

export function CommentForm({ label, submitLabel, placeholder, autoFocus, onSubmit, onCancel }: CommentFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CommentFormValues>({ resolver: zodResolver(commentSchema), defaultValues: { content: '' } });

  const submit = handleSubmit(async ({ content }) => {
    try {
      await onSubmit(content);
      reset();
      onCancel?.();
    } catch {
      // The global mutation handler already shows an error toast; keep the text so nothing is lost.
    }
  });

  return (
    <form onSubmit={submit} noValidate className="space-y-3">
      <TextAreaField
        label={label}
        rows={3}
        placeholder={placeholder}
        autoFocus={autoFocus}
        error={errors.content?.message}
        {...register('content')}
      />
      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button variant="ghost" size="sm" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
        )}
        <Button type="submit" size="sm" loading={isSubmitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
