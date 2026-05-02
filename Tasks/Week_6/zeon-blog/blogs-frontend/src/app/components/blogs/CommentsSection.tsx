"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "react-toastify";

import { useAppSelector } from "@/src/app/Redux/customStoreWrapper";
import { selectAuthUser } from "@/src/app/Redux/selector-functions/authSelector";
import {
  BlogComment,
  createComment,
  deleteComment,
  getComments,
  updateComment,
} from "@/src/lib/api/commentsApi";
import { resolveImageUrl } from "@/src/lib/utils/urlUtils";

export function CommentsSection({
  blogId,
  authorId,
}: {
  blogId: string;
  authorId: string;
}) {
  const user = useAppSelector(selectAuthUser);
  const [comments, setComments] = useState<BlogComment[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [content, setContent] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const topLevelComments = useMemo(
    () => comments.filter((comment) => !comment.parentCommentId),
    [comments],
  );

  const repliesByParent = useMemo(() => {
    const map = new Map<string, BlogComment[]>();
    for (const comment of comments) {
      if (!comment.parentCommentId) continue;
      map.set(comment.parentCommentId, [...(map.get(comment.parentCommentId) ?? []), comment]);
    }
    return map;
  }, [comments]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      try {
        const payload = await getComments(blogId, { page: 1, pageSize: 20, sort: "asc" });
        if (!cancelled) {
          setComments(payload.comments);
          setPage(payload.meta.currentPage);
          setTotalPages(payload.meta.totalPages || 1);
        }
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to load comments");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [blogId]);

  const loadMore = async () => {
    const nextPage = page + 1;
    setIsLoading(true);
    try {
      const payload = await getComments(blogId, { page: nextPage, pageSize: 20, sort: "asc" });
      setComments((prev) => [...prev, ...payload.comments]);
      setPage(payload.meta.currentPage);
      setTotalPages(payload.meta.totalPages || 1);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load more comments");
    } finally {
      setIsLoading(false);
    }
  };

  const submit = async (parentCommentId?: string) => {
    if (!user) return;
    const trimmed = content.trim();
    if (!trimmed) {
      toast.error("Comment cannot be empty.");
      return;
    }
    setIsSaving(true);
    try {
      const saved = await createComment(blogId, { content: trimmed, parentCommentId });
      setComments((prev) => [...prev, saved]);
      setContent("");
      toast.success("Comment posted.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to post comment");
    } finally {
      setIsSaving(false);
    }
  };

  const saveEdit = async (commentId: string) => {
    const trimmed = editingContent.trim();
    if (!trimmed) {
      toast.error("Comment cannot be empty.");
      return;
    }
    setIsSaving(true);
    try {
      const saved = await updateComment(commentId, { content: trimmed });
      setComments((prev) => prev.map((comment) => (comment.id === commentId ? saved : comment)));
      setEditingId(null);
      setEditingContent("");
      toast.success("Comment updated.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update comment");
    } finally {
      setIsSaving(false);
    }
  };

  const remove = async (commentId: string) => {
    setIsSaving(true);
    try {
      await deleteComment(commentId);
      setComments((prev) => prev.map((comment) => comment.id === commentId ? { ...comment, isDeleted: true, content: "[deleted]", deletedAt: new Date().toISOString() } : comment));
      toast.success("Comment deleted.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete comment");
    } finally {
      setIsSaving(false);
    }
  };

  const canManage = (comment: BlogComment) => Boolean(user && !comment.isDeleted && (user.id === comment.author?.id || user.role === "admin"));
  const roleBadges = (comment: BlogComment) => {
    const badges: string[] = [];
    if (comment.author?.id === authorId) badges.push("Author");
    if (comment.author?.role === "admin") badges.push("Admin");
    return badges;
  };

  const renderComment = (comment: BlogComment, isReply = false) => (
    <div key={comment.id} className={`rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-950 ${isReply ? "ml-8" : ""}`}>
      <div className="flex items-start gap-3">
        <img src={resolveImageUrl(comment.author?.avatar ?? null)} alt="" className="h-10 w-10 rounded-full object-cover" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <p className="m-0 font-semibold">{comment.author?.name ?? "Deleted user"}</p>
              {roleBadges(comment).map((badge) => (
                <span
                  key={badge}
                  className="rounded-full border border-sky-200 bg-sky-50 px-2 py-0.5 text-[11px] font-semibold text-sky-700 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-200"
                >
                  {badge}
                </span>
              ))}
            </div>
            <p className="m-0 text-xs text-gray-500">{new Date(comment.createdAt).toLocaleString()}</p>
          </div>
          {editingId === comment.id ? (
            <div className="mt-3 space-y-2">
              <textarea className="min-h-24 w-full rounded-xl border border-gray-300 bg-white p-3 text-sm dark:border-gray-700 dark:bg-gray-900" value={editingContent} onChange={(e) => setEditingContent(e.target.value)} />
              <div className="flex gap-2">
                <button className="rounded-lg bg-gray-900 px-3 py-2 text-sm text-white dark:bg-sky-500 dark:text-slate-950" disabled={isSaving} onClick={() => void saveEdit(comment.id)}>Save</button>
                <button className="rounded-lg border px-3 py-2 text-sm" onClick={() => setEditingId(null)}>Cancel</button>
              </div>
            </div>
          ) : (
            <p className={`mt-2 whitespace-pre-wrap ${comment.isDeleted ? "italic text-gray-500" : ""}`}>{comment.content}</p>
          )}
          {canManage(comment) ? (
            <div className="mt-2 flex gap-2 text-xs">
              <button className="underline" onClick={() => { setEditingId(comment.id); setEditingContent(comment.content); }}>Edit</button>
              <button className="text-red-600 underline" disabled={isSaving} onClick={() => void remove(comment.id)}>Delete</button>
            </div>
          ) : null}
        </div>
      </div>
      {(repliesByParent.get(comment.id) ?? []).map((reply) => renderComment(reply, true))}
    </div>
  );

  return (
    <section className="not-prose mt-10 space-y-5 rounded-3xl border border-gray-200 bg-gray-50 p-5 dark:border-gray-800 dark:bg-gray-950/60">
      <div>
        <h2 className="text-2xl font-bold">Comments</h2>
        <p className="text-sm text-gray-500">Join the discussion without reloading the page.</p>
      </div>

      {user ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-950">
          <textarea value={content} onChange={(e) => setContent(e.target.value)} maxLength={2000} placeholder="Write a thoughtful comment..." className="min-h-28 w-full rounded-xl border border-gray-300 bg-white p-3 text-sm dark:border-gray-700 dark:bg-gray-900" />
          <div className="mt-3 flex items-center justify-between gap-3">
            <span className="text-xs text-gray-500">{content.trim().length}/2000</span>
            <button disabled={isSaving || !content.trim()} onClick={() => void submit()} className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50 dark:bg-sky-500 dark:text-slate-950">Post comment</button>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-gray-300 p-5 text-sm dark:border-gray-700">
          <Link className="font-semibold underline" href="/login">Login</Link> to comment on this post.
        </div>
      )}

      {isLoading && comments.length === 0 ? <p className="text-sm text-gray-500">Loading comments...</p> : null}
      <div className="space-y-3">{topLevelComments.map((comment) => renderComment(comment))}</div>
      {comments.length === 0 && !isLoading ? <p className="text-sm text-gray-500">No comments yet. First comment energy is powerful.</p> : null}
      {page < totalPages ? <button className="rounded-xl border px-4 py-2 text-sm" disabled={isLoading} onClick={() => void loadMore()}>Load more comments</button> : null}
    </section>
  );
}
