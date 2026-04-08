"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Markdown } from "@tiptap/markdown";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { Bold, Italic, Heading1, Heading2, List, ListOrdered, Quote, Link as LinkIcon, Image as ImageIcon, Undo, Redo, } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import ImageUploadModal from "../commons/ImageUploadModal";
import { toast } from "react-toastify";

const ToolBarButton = ({
    onClick, isActive2 = false, title, children
}: {
    onClick: () => void;
    isActive2?: boolean;
    title: string;
    children: React.ReactNode;
}) => (
    <button
        type="button" onClick={onClick}
        title={title} className={`rounded-lg p-2 transition-all duration-100 ${isActive2 ?
            "bg-gray-900 text-white shadow-md dark:bg-sky-500 dark:text-slate-950" : "text-gray-600 hover:bg-gray-200 hover:text-black dark:text-gray-300 dark:hover:bg-slate-700 dark:hover:text-sky-100"
            }`}
    >
        {children}
    </button>
)

export default function TrueTextEditor({ content, setContent }: {
    content: string;
    setContent: (content: string) => void;
}) {
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
                    class: "mx-auto block rounded-2xl border border-gray-200 shadow-md w-full max-w-[700px] object-cover my-8",
                },
            }),
            Placeholder.configure({
                placeholder: "Tell your story...",
            }),
        ],
        content: content,
        contentType: 'markdown',
        onUpdate: ({ editor }) => {
            setContent(editor.getMarkdown());
        },
        editorProps: {
            attributes: {
                class:
                    "prose prose-base m-5 max-w-none min-h-[400px] text-base leading-normal focus:outline-none dark:prose-invert",
            },
        }
    });

    useEffect(() => {
        if (editor && content !== editor.getMarkdown()) {
            editor.commands.setContent(content, { contentType: 'markdown' });
        }
    }, [content, editor]);

    const setLink = useCallback(() => {
        if (!editor) return;
        const previousUrl = editor.getAttributes('link').href;
        const url = window.prompt('URL', previousUrl);

        if (url === null || url === undefined) return;
        if (url === "") {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
            return;
        }
        try {
            editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
        } catch {
            toast.error("Invalid URL format!");
        }
    }, [editor]);
    const handleImageUploadSuccess = (url: string) => {
        if (!editor) return;
        editor.chain().focus().setImage({ src: url }).run();
    };

    if (!editor) return null;

    return (
        <div className="flex w-full flex-col overflow-auto rounded-3xl border border-gray-200 bg-white shadow-sm transition-all duration-100 focus-within:border-black/20 focus-within:shadow-xl dark:border-slate-600 dark:bg-[#08162e] dark:focus-within:border-sky-500/40">
            <div className="sticky top-0 z-10 flex flex-wrap items-center justify-center gap-1 border-b border-gray-100 bg-white/60 p-2 backdrop-blur-xl group-focus-within:border-gray-200 dark:border-slate-600 dark:bg-[#08162e]/80">
                <ToolBarButton
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    isActive2={editor.isActive('bold')} title="Bold"
                >
                    <Bold className="h-4 w-4" />
                </ToolBarButton>
                <ToolBarButton
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    isActive2={editor.isActive('italic')} title="Italic"
                >
                    <Italic className="h-4 w-4" />
                </ToolBarButton>
                <ToolBarButton
                    onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                    isActive2={editor.isActive('heading', { level: 1 })} title="Heading 1"
                >
                    <Heading1 className="h-4 w-4" />
                </ToolBarButton>
                <ToolBarButton
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    isActive2={editor.isActive('heading', { level: 2 })} title="Heading 2"
                >
                    <Heading2 className="h-4 w-4" />
                </ToolBarButton>

                <div className="h-6 border-l-2 border-gray-200 dark:border-slate-600"></div>

                <ToolBarButton
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    isActive2={editor.isActive("bulletList")}
                    title="Bullet List"
                >
                    <List className="h-4 w-4" />
                </ToolBarButton>
                <ToolBarButton
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    isActive2={editor.isActive("orderedList")}
                    title="Ordered List"
                >
                    <ListOrdered className="h-4 w-4" />
                </ToolBarButton>
                <ToolBarButton
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                    isActive2={editor.isActive("blockquote")}
                    title="Blockquote"
                >
                    <Quote className="h-4 w-4" />
                </ToolBarButton>

                <div className="h-6 border-l-2 border-gray-200 dark:border-slate-600"></div>

                <ToolBarButton onClick={setLink} isActive2={editor.isActive("link")} title="Link">
                    <LinkIcon className="h-4 w-4" />
                </ToolBarButton>
                <ToolBarButton onClick={() => setIsUploadModalOpen(true)} title="Upload Image">
                    <ImageIcon className="h-4 w-4" />
                </ToolBarButton>

                <div className="flex-grow" />

                <ToolBarButton
                    onClick={() => editor.chain().focus().undo().run()}
                    title="Undo"
                >
                    <Undo className="h-4 w-4" />
                </ToolBarButton>
                <ToolBarButton
                    onClick={() => editor.chain().focus().redo().run()}
                    title="Redo"
                >
                    <Redo className="h-4 w-4" />
                </ToolBarButton>
            </div>
            <div className="h-[75vh] overflow-auto bg-white px-4 py-2 text-base text-gray-900 dark:bg-[#08162e] dark:text-sky-50">
                <EditorContent editor={editor} />
            </div>
            <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50/50 px-6 py-2 dark:border-slate-600 dark:bg-[#0a1b35]">
                <span className="text-[10px] font-medium uppercase tracking-widest text-gray-400 dark:text-slate-300">
                    Markdown Mode
                </span>
                <span className="text-[10px] font-medium text-gray-400 dark:text-slate-300">
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
