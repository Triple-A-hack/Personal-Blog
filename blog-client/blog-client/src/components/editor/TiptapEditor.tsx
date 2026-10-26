import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { EditorContent, useEditor, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {
  Bold,
  Code2,
  Heading2,
  Heading3,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Quote,
  Redo2,
  Strikethrough,
  Undo2,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/utils/cn';

interface TiptapEditorProps {
  value: string;
  onChange: (html: string) => void;
  onBlur?: () => void;
  invalid?: boolean;
  placeholder?: string;
}

interface ToolbarButtonProps {
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
}

function ToolbarButton({ label, icon: Icon, onClick, active = false, disabled = false }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      aria-pressed={active}
      className={cn(
        'inline-flex h-8 w-8 items-center justify-center rounded-md transition-colors disabled:opacity-40',
        active
          ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
          : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800',
      )}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}

function Divider() {
  return <span className="mx-1 h-5 w-px bg-gray-200 dark:bg-gray-700" aria-hidden="true" />;
}

function promptForLink(editor: Editor): void {
  const previous = editor.getAttributes('link').href as string | undefined;
  const url = window.prompt('Link URL (https://…)', previous ?? 'https://');
  if (url === null) return;

  const trimmed = url.trim();
  if (trimmed === '') {
    editor.chain().focus().extendMarkRange('link').unsetLink().run();
    return;
  }
  if (!/^(https?:\/\/|mailto:)/i.test(trimmed)) {
    window.alert('Links must start with http://, https:// or mailto:');
    return;
  }
  editor.chain().focus().extendMarkRange('link').setLink({ href: trimmed }).run();
}

function Toolbar({ editor }: { editor: Editor }) {
  const chain = () => editor.chain().focus();
  return (
    <div
      role="toolbar"
      aria-label="Formatting"
      className="flex flex-wrap items-center gap-0.5 border-b border-gray-200 p-1.5 dark:border-gray-700"
    >
      <ToolbarButton label="Bold" icon={Bold} active={editor.isActive('bold')} onClick={() => chain().toggleBold().run()} />
      <ToolbarButton label="Italic" icon={Italic} active={editor.isActive('italic')} onClick={() => chain().toggleItalic().run()} />
      <ToolbarButton label="Strikethrough" icon={Strikethrough} active={editor.isActive('strike')} onClick={() => chain().toggleStrike().run()} />
      <Divider />
      <ToolbarButton label="Heading 2" icon={Heading2} active={editor.isActive('heading', { level: 2 })} onClick={() => chain().toggleHeading({ level: 2 }).run()} />
      <ToolbarButton label="Heading 3" icon={Heading3} active={editor.isActive('heading', { level: 3 })} onClick={() => chain().toggleHeading({ level: 3 }).run()} />
      <Divider />
      <ToolbarButton label="Bulleted list" icon={List} active={editor.isActive('bulletList')} onClick={() => chain().toggleBulletList().run()} />
      <ToolbarButton label="Numbered list" icon={ListOrdered} active={editor.isActive('orderedList')} onClick={() => chain().toggleOrderedList().run()} />
      <ToolbarButton label="Quote" icon={Quote} active={editor.isActive('blockquote')} onClick={() => chain().toggleBlockquote().run()} />
      <ToolbarButton label="Code block" icon={Code2} active={editor.isActive('codeBlock')} onClick={() => chain().toggleCodeBlock().run()} />
      <ToolbarButton label="Link" icon={LinkIcon} active={editor.isActive('link')} onClick={() => promptForLink(editor)} />
      <Divider />
      <ToolbarButton label="Undo" icon={Undo2} disabled={!editor.can().undo()} onClick={() => chain().undo().run()} />
      <ToolbarButton label="Redo" icon={Redo2} disabled={!editor.can().redo()} onClick={() => chain().redo().run()} />
    </div>
  );
}

/** Tiptap rich-text editor that reads/writes an HTML string (drop-in for react-hook-form's Controller). */
export function TiptapEditor({ value, onChange, onBlur, invalid = false, placeholder = 'Start writing your story…' }: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      Link.configure({ openOnClick: false, autolink: true, HTMLAttributes: { rel: 'noopener noreferrer nofollow' } }),
      Placeholder.configure({ placeholder }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class:
          'prose prose-sm sm:prose-base dark:prose-invert max-w-none min-h-[18rem] px-4 py-3 focus:outline-none',
        'aria-label': 'Post content',
        role: 'textbox',
        'aria-multiline': 'true',
      },
    },
    onUpdate: ({ editor: instance }) => onChange(instance.isEmpty ? '' : instance.getHTML()),
    onBlur: () => onBlur?.(),
  });

  return (
    <div
      className={cn(
        'overflow-hidden rounded-lg border bg-white shadow-sm focus-within:border-indigo-500 dark:bg-gray-900',
        invalid ? 'border-red-500' : 'border-gray-300 dark:border-gray-700',
      )}
    >
      {editor && <Toolbar editor={editor} />}
      <EditorContent editor={editor} />
    </div>
  );
}
