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

export default function CommentSection({
  contentId,
}: Props) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [message, setMessage] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editMessage, setEditMessage] = useState("");

  const currentUser = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
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
      setComments(res.data.comments);
    } catch (err) {
      console.log(err);
    }
  };

  const addComment = async () => {
    if (!message.trim()) return;

    try {
      await api.post("/comments", {
        contentId,
        message,
      });

      setMessage("");
      fetchComments();
    } catch (err) {
      console.log(err);
    }
  };

  const likeComment = async (id: string) => {
    try {
      await api.patch(`/comments/like/${id}`);
      fetchComments();
    } catch (err) {
      console.log(err);
    }
  };

  const deleteComment = async (id: string) => {
    try {
      await api.delete(`/comments/${id}`);
      fetchComments();
    } catch (err) {
      console.log(err);
    }
  };

  const editComment = async (id: string) => {
    if (!editMessage.trim()) return;
    try {
      await api.patch(`/comments/${id}`, { message: editMessage });
      setEditingCommentId(null);
      fetchComments();
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="comments">

      <h2>{comments.length} Comments</h2>

      <div className="comment-input">

        <textarea
          placeholder="Add a comment..."
          value={message}
          onChange={(e) =>
            setMessage(e.target.value)
          }
        />

        <button onClick={addComment}>
          Comment
        </button>

      </div>

      {comments.map((comment) => {
        const isOwner = currentUser && comment.user._id === currentUser._id;
        const isEditing = editingCommentId === comment._id;

        return (
          <div
            key={comment._id}
            className="comment-card"
          >
            <div className="avatar">
              {comment.user.name.charAt(0)}
            </div>

            <div className="comment-body">
              <h4>{comment.user.name}</h4>

              {isEditing ? (
                <div className="comment-edit-input">
                  <textarea
                    value={editMessage}
                    onChange={(e) => setEditMessage(e.target.value)}
                    autoFocus
                  />
                  <div className="comment-edit-actions">
                    <button onClick={() => editComment(comment._id)}>Save</button>
                    <button onClick={() => setEditingCommentId(null)}>Cancel</button>
                  </div>
                </div>
              ) : (
                <p>{comment.message}</p>
              )}

              {!isEditing && (
                <div className="comment-actions">
                  {!isOwner ? (
                    <button onClick={() => likeComment(comment._id)}>
                      👍 {comment.likes}
                    </button>
                  ) : (
                    <>
                      <button onClick={() => {
                        setEditingCommentId(comment._id);
                        setEditMessage(comment.message);
                      }}>
                        ✏️ Edit
                      </button>
                      <button onClick={() => deleteComment(comment._id)}>
                        🗑 Delete
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}

    </div>
  );
}