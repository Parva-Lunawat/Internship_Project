"use client";

import { useEditor, EditorContent, isActive } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Markdown } from "@tiptap/markdown";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon,
  Image as ImageIcon,
  Undo,
  Redo,
} from "lucide-react";
import { useCallback, useState } from "react";
import ImageUploadModal from "../commons/ImageUploadModal";

interface RichTextEditorProps {
  content: string;
  setContent: (content: string) => void;
}

const ToolbarButton = ({
  onClick,
  isActive = false,
  children,
  title,
}: {
  onClick: () => void;
  isActive?: boolean;
  children: React.ReactNode;
  title: string;
}) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    className={`p-2 rounded-lg transition-all duration-200 ${
      isActive
        ? "bg-black text-white shadow-inner"
        : "text-gray-600 hover:bg-gray-100/80 hover:text-black"
    }`}
  >
    {children}
  </button>
);

export default function RichTextEditor({ content, setContent }: RichTextEditorProps) {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Markdown,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-500 underline underline-offset-4 cursor-pointer",
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: "mx-auto block rounded-2xl border border-gray-200 shadow-md w-full max-w-[700px] aspect-video object-cover my-8",
        },
      }),
      Placeholder.configure({
        placeholder: "Tell your story...",
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      // Return the markdown content
      setContent(editor.getMarkdown());
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose-base lg:prose-lg xl:prose-2xl m-5 focus:outline-none max-w-none min-h-[400px]",
      },
    },
  });

  const setLink = useCallback(() => {
    if (!editor) return;

    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("URL", previousUrl);

    // cancelled
    if (url === null) {
      return;
    }

    // empty
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    // update link
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  const handleImageUploadSuccess = (url: string) => {
    if (!editor) return;
    editor.chain().focus().setImage({ src: url }).run();
  };

  if (!editor) {
    return (
      <div className="w-full h-[400px] bg-gray-50 rounded-3xl border border-gray-200 animate-pulse" />
    );
  }

  return (
    <div className="flex flex-col w-full bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm transition-all duration-300 focus-within:border-black/20 focus-within:shadow-xl group">
      {/* Premium Glassmorphic Toolbar */}
      <div className="sticky top-0 z-20 flex flex-wrap items-center gap-1 p-2 bg-white/60 backdrop-blur-xl border-b border-gray-100 group-focus-within:border-gray-200">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive("bold")}
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive("italic")}
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </ToolbarButton>
        
        <div className="w-[1px] h-6 bg-gray-200 mx-1" />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          isActive={editor.isActive("heading", { level: 1 })}
          title="Heading 1"
        >
          <Heading1 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive("heading", { level: 2 })}
          title="Heading 2"
        >
          <Heading2 className="h-4 w-4" />
        </ToolbarButton>

        <div className="w-[1px] h-6 bg-gray-200 mx-1" />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive("bulletList")}
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive("orderedList")}
          title="Ordered List"
        >
          <ListOrdered className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive("blockquote")}
          title="Blockquote"
        >
          <Quote className="h-4 w-4" />
        </ToolbarButton>

        <div className="w-[1px] h-6 bg-gray-200 mx-1" />

        <ToolbarButton onClick={setLink} isActive={editor.isActive("link")} title="Link">
          <LinkIcon className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => setIsUploadModalOpen(true)} title="Upload Image">
          <ImageIcon className="h-4 w-4" />
        </ToolbarButton>

        <div className="flex-grow" />

        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          title="Undo"
        >
          <Undo className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          title="Redo"
        >
          <Redo className="h-4 w-4" />
        </ToolbarButton>
      </div>

      {/* Editor Content Area */}
      <div className="bg-white px-4 py-2 overflow-auto h-[75vh]">
        <EditorContent editor={editor} />
      </div>
      
      {/* Subtle Status Bar */}
      <div className="px-6 py-2 bg-gray-50/50 border-t border-gray-100 flex justify-between items-center">
        <span className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">
            Markdown Mode
        </span>
        <span className="text-[10px] text-gray-400 font-medium">
            {/* {editor.storage.markdown?.getMarkdown()?.split(/\s+/)?.filter(Boolean)?.length || 0} words */}
        </span>
      </div>
      <ImageUploadModal 
        isOpen={isUploadModalOpen} 
        onClose={() => setIsUploadModalOpen(false)} 
        onUploadSuccess={handleImageUploadSuccess}
      />
    </div>
  );
}
