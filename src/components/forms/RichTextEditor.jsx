'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEffect } from 'react';

const RichTextEditor = ({ content, onChange, placeholder = 'Write your task description...' }) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
    ],
    content: content || '',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // Update content if changed from outside
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content || '');
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }

  const toolbarButtons = [
    {
      name: 'Bold',
      icon: 'B',
      command: () => editor.chain().focus().toggleBold().run(),
      isActive: editor.isActive('bold'),
    },
    {
      name: 'Italic',
      icon: 'I',
      command: () => editor.chain().focus().toggleItalic().run(),
      isActive: editor.isActive('italic'),
    },
    {
      name: 'Strike',
      icon: 'S',
      command: () => editor.chain().focus().toggleStrike().run(),
      isActive: editor.isActive('strike'),
    },
    {
      name: 'Code',
      icon: '</>',
      command: () => editor.chain().focus().toggleCode().run(),
      isActive: editor.isActive('code'),
    },
    {
      name: 'Heading',
      icon: 'H',
      command: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      isActive: editor.isActive('heading', { level: 2 }),
    },
    {
      name: 'Bullet List',
      icon: '• List',
      command: () => editor.chain().focus().toggleBulletList().run(),
      isActive: editor.isActive('bulletList'),
    },
    {
      name: 'Ordered List',
      icon: '1. List',
      command: () => editor.chain().focus().toggleOrderedList().run(),
      isActive: editor.isActive('orderedList'),
    },
    {
      name: 'Blockquote',
      icon: '"',
      command: () => editor.chain().focus().toggleBlockquote().run(),
      isActive: editor.isActive('blockquote'),
    },
    {
      name: 'Code Block',
      icon: '{ }',
      command: () => editor.chain().focus().toggleCodeBlock().run(),
      isActive: editor.isActive('codeBlock'),
    },
  ];

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 p-2 bg-gray-50 border-b">
        {toolbarButtons.map((btn, index) => (
          <button
            key={index}
            type="button"
            onClick={btn.command}
            className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
              btn.isActive
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-200 border border-gray-300'
            }`}
            title={btn.name}
          >
            {btn.icon}
          </button>
        ))}
      </div>

      {/* Editor */}
      <EditorContent
        editor={editor}
        className="ProseMirror prose prose-sm max-w-none p-4 focus:outline-none"
      />
    </div>
  );
};

export default RichTextEditor;
