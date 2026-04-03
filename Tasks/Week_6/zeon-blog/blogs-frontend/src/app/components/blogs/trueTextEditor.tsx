"use client";

import { useEditor, EditorContent, isActive as isActive2 } from "@tiptap/react";
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
        title={title} className={`p-2 rounded-lg transition-all duration-100 ${isActive2 ?
            "bg-black text-white shadow-md" : "text-grey hover:bg-gray-200 hover:text-black"
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
                    "prose prose-base m-5 focus:outline-none max-w-none min-h-[400px] text-base leading-none",
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
        } catch (e) {
            toast.error("Invalid URL format!");
        }
    }, [editor]);
    const handleImageUploadSuccess = (url: string) => {
        if (!editor) return;
        editor.chain().focus().setImage({ src: url }).run();
    };

    if (!editor) return null;

    return (
        <div className="flex flex-col w-full bg-white rounded-3xl border border-gray-200 overflow-auto shadow-sm transition-all duration-100 focus-within:border-black/20 focus-within:shadow-xl ">
            <div className="flex flex-wrap sticky top-0 z-10 items-center justify-center gap-1 p-2 bg-white/60 backdrop-blur-xl border-black border-gray-100 group-focus-within:border-gray-200">
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
                    isActive2={editor.isActive('Heading', { level: 1 })} title="Heading 1"
                >
                    <Heading1 className="h-4 w-4" />
                </ToolBarButton>
                <ToolBarButton
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    isActive2={editor.isActive('Heading', { level: 2 })} title="Heading 2"
                >
                    <Heading2 className="h-4 w-4" />
                </ToolBarButton>

                <div className="border-l-2 border-gray-200 h-6"></div>

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

                <div className="border-l-2 border-gray-200 h-6"></div>

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
            <div className="bg-white px-4 py-2 overflow-auto h-[75vh] text-base">
                <EditorContent editor={editor} />
            </div>
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