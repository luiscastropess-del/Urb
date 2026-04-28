"use client";

import { useState, useEffect } from "react";
import { getComments, addComment } from "@/app/actions.comments";
import { Loader2, Send, Star } from "lucide-react";

interface Comment {
  id: string;
  text: string;
  rating: number | null;
  createdAt: Date;
  user: { name: string; avatar: string | null };
}

export function CommentSection({ placeId }: { placeId: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState("");
  const [rating, setRating] = useState(5);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getComments(placeId).then((data) => {
      setComments(data as any);
      setLoading(false);
    });
  }, [placeId]);

  const handleSubmit = async () => {
    if (!text.trim()) return;
    setSubmitting(true);
    try {
      await addComment(placeId, text, rating);
      setText("");
      setRating(5);
      const data = await getComments(placeId);
      setComments(data as any);
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader2 className="animate-spin" />;

  return (
    <div className="mt-6 border-t pt-6">
      <h3 className="font-bold text-lg mb-4">Comentários e Avaliação</h3>
      <div className="flex gap-2 mb-4">
        <textarea
          className="flex-1 border rounded p-2 text-sm"
          placeholder="Escreva um comentário..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <div className="flex flex-col gap-2">
            <select className="border rounded p-2" value={rating} onChange={(e) => setRating(Number(e.target.value))}>
                {[1,2,3,4,5].map(r => <option key={r} value={r}>{r} Estrelas</option>)}
            </select>
            <button
              className="bg-orange-500 text-white p-2 rounded flex items-center justify-center"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
            </button>
        </div>
      </div>
      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="bg-slate-50 p-3 rounded text-sm">
            <div className="flex justify-between">
                <p className="font-bold">{comment.user.name}</p>
                <div className="flex text-orange-500">
                    {[...Array(comment.rating || 0)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
                </div>
            </div>
            <p>{comment.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
