import { useEffect, useState } from "react";
import api from "../../services/api";
import "./CommentSection.css";

interface Props {
  contentId: string;
}

interface Comment {
  _id: string;
  message: string;
  likes: number;
  createdAt: string;
  user: {
    _id: string;
    name: string;
  };
}

export default function CommentSection({ contentId }: Props) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [message, setMessage] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editMessage, setEditMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const currentUser = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || sessionStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  })();

  useEffect(() => {
    fetchComments();
  }, [contentId]);

  const fetchComments = async () => {
    try {
      const res = await api.get(`/comments/${contentId}`);
      setComments(res.data.comments || []);
    } catch (err) {
      console.error("Failed to fetch comments", err);
      setComments([]);
    }
  };

  const addComment = async () => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage || submitting) return;

    setSubmitting(true);
    try {
      await api.post("/comments", {
        contentId,
        message: trimmedMessage,
      });

      setMessage("");
      await fetchComments();
    } catch (err) {
      console.error("Failed to add comment", err);
    } finally {
      setSubmitting(false);
    }
  };

  const likeComment = async (id: string) => {
    try {
      await api.patch(`/comments/like/${id}`);
      await fetchComments();
    } catch (err) {
      console.error("Failed to like comment", err);
    }
  };

  const deleteComment = async (id: string) => {
    try {
      await api.delete(`/comments/${id}`);
      await fetchComments();
    } catch (err) {
      console.error("Failed to delete comment", err);
    }
  };

  const editComment = async (id: string) => {
    const trimmedMessage = editMessage.trim();
    if (!trimmedMessage) return;

    try {
      await api.patch(`/comments/${id}`, { message: trimmedMessage });
      setEditingCommentId(null);
      setEditMessage("");
      await fetchComments();
    } catch (err) {
      console.error("Failed to edit comment", err);
    }
  };

  return (
    <div className="comments-section">
      <div className="comments-header">
        <div>
          <p className="comments-kicker">Community</p>
          <h2>{comments.length} Comment{comments.length === 1 ? "" : "s"}</h2>
        </div>
      </div>

      <div className="comment-input-panel">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Share your thoughts..."
          rows={3}
        />
        <div className="comment-input-actions">
          <span className="comment-hint">Be respectful and concise.</span>
          <button type="button" className="comment-submit-btn" onClick={addComment} disabled={submitting || !message.trim()}>
            {submitting ? "Posting..." : "Post Comment"}
          </button>
        </div>
      </div>

      {comments.length === 0 ? (
        <div className="comments-empty">
          <p>No comments yet.</p>
          <span>Start the conversation for this video.</span>
        </div>
      ) : (
        <div className="comments-list">
          {comments.map((comment) => {
            const isOwner = currentUser && comment.user?._id === currentUser._id;
            const isEditing = editingCommentId === comment._id;
            const timestamp = comment.createdAt ? new Date(comment.createdAt).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              year: "numeric",
            }) : "Recently";

            return (
              <article key={comment._id} className={`comment-card ${isOwner ? "owner-comment" : ""}`}>
                <div className="comment-avatar">{comment.user?.name?.charAt(0)?.toUpperCase() || "U"}</div>

                <div className="comment-body">
                  <div className="comment-meta">
                    <div className="comment-author-wrap">
                      <h4>{comment.user?.name || "Unknown user"}</h4>
                      <span className="comment-timestamp">{timestamp}</span>
                    </div>
                    {isOwner && <span className="comment-owner-badge">You</span>}
                  </div>

                  {isEditing ? (
                    <div className="comment-edit-box">
                      <textarea
                        value={editMessage}
                        onChange={(e) => setEditMessage(e.target.value)}
                        rows={3}
                        autoFocus
                      />
                      <div className="comment-edit-actions">
                        <button type="button" className="comment-action secondary" onClick={() => setEditingCommentId(null)}>
                          Cancel
                        </button>
                        <button type="button" className="comment-action primary" onClick={() => editComment(comment._id)}>
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p>{comment.message}</p>
                  )}

                  {!isEditing && (
                    <div className="comment-actions">
                      <button type="button" className="comment-action ghost" onClick={() => likeComment(comment._id)}>
                        👍 {comment.likes || 0}
                      </button>

                      {isOwner && (
                        <>
                          <button
                            type="button"
                            className="comment-action secondary"
                            onClick={() => {
                              setEditingCommentId(comment._id);
                              setEditMessage(comment.message);
                            }}
                          >
                            Edit
                          </button>
                          <button type="button" className="comment-action danger" onClick={() => deleteComment(comment._id)}>
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}