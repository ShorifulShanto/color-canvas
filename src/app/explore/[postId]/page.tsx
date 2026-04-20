
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { doc, getDoc, collection, addDoc, onSnapshot, query, orderBy, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, MessageCircle, Heart, Share2, Loader2, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

export default function ArtworkDetailPage() {
  const { postId } = useParams();
  const router = useRouter();
  const { user, profile } = useAuth();
  const { toast } = useToast();
  
  const [post, setPost] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!postId) return;

    const fetchPost = async () => {
      const docRef = doc(db, "posts", postId as string);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setPost({ id: docSnap.id, ...docSnap.data() });
      } else {
        toast({ title: "Not found", description: "Artwork does not exist.", variant: "destructive" });
        router.push("/explore");
      }
      setLoading(false);
    };

    fetchPost();

    // Real-time comments
    const commentsRef = collection(db, "posts", postId as string, "comments");
    const q = query(commentsRef, orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setComments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsubscribe();
  }, [postId, router, toast]);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim()) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "posts", postId as string, "comments"), {
        userId: user.uid,
        username: profile?.username || "Anonymous",
        text: newComment,
        createdAt: serverTimestamp(),
      });
      setNewComment("");
    } catch (error) {
      toast({ title: "Failed to comment", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-accent" /></div>;
  if (!post) return null;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl space-y-8">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="mr-2" size={18} /> Back to Gallery
      </Button>

      <div className="grid lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-6">
          <div className="relative aspect-[4/5] w-full rounded-3xl overflow-hidden shadow-2xl border bg-white">
            <Image 
              src={post.imageUrl} 
              alt={post.title} 
              fill 
              className="object-contain" 
              priority
            />
          </div>
          
          <div className="flex items-center justify-between p-6 bg-white rounded-3xl border shadow-sm">
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12 border-2 border-accent/20">
                <AvatarFallback>{post.username?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <h2 className="font-bold text-xl">{post.title}</h2>
                <p className="text-muted-foreground text-sm">by <span className="text-accent font-semibold">@{post.username}</span></p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" className="rounded-full gap-2">
                <Heart size={18} /> {post.likesCount || 0}
              </Button>
              <Button variant="outline" size="icon" className="rounded-full">
                <Share2 size={18} />
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <Card className="rounded-3xl border-none shadow-xl">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageCircle size={20} className="text-accent" /> Discussion
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleAddComment} className="flex gap-2">
                <Input 
                  placeholder={user ? "Write a note..." : "Log in to comment"} 
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  disabled={!user || isSubmitting}
                  className="rounded-full border-primary/20"
                />
                <Button 
                  type="submit" 
                  size="icon" 
                  disabled={!user || isSubmitting || !newComment.trim()}
                  className="rounded-full bg-accent text-white flex-shrink-0"
                >
                  <Send size={18} />
                </Button>
              </form>

              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3 animate-in fade-in slide-in-from-top-1">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-[10px]">{comment.username?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="bg-primary/5 rounded-2xl rounded-tl-none p-3 flex-grow">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-bold">@{comment.username}</span>
                        <span className="text-[10px] text-muted-foreground">
                          {comment.createdAt ? formatDistanceToNow(comment.createdAt.toDate(), { addSuffix: true }) : 'just now'}
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed">{comment.text}</p>
                    </div>
                  </div>
                ))}
                {comments.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground italic text-sm">
                    No notes yet. Be the first to share your thoughts!
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-none shadow-sm bg-accent/5">
            <CardContent className="p-6 space-y-4">
              <h4 className="font-bold text-sm uppercase tracking-wider text-accent">About the piece</h4>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {post.description || "The artist left no description for this masterpiece."}
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                {post.tags?.map((tag: string) => (
                  <Badge key={tag} variant="secondary" className="bg-white text-xs px-3">
                    #{tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
