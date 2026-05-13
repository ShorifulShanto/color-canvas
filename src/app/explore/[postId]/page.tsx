
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { doc, getDoc, collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, deleteDoc, updateDoc } from "firebase/firestore";
import { useAuth, useFirestore } from "@/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, MessageCircle, Heart, Share2, Loader2, Send, Trash2, Edit2, Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export default function ArtworkDetailPage() {
  const { postId } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const db = useFirestore();
  const { toast } = useToast();
  
  const [post, setPost] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");

  useEffect(() => {
    if (!postId || !db) return;

    const fetchPost = async () => {
      const docRef = doc(db, "posts", postId as string);
      try {
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setPost({ id: docSnap.id, ...data });
          setEditTitle(data.title || "");
          setEditDesc(data.description || "");
        } else {
          toast({ title: "Not found", description: "Artwork does not exist.", variant: "destructive" });
          router.push("/explore");
        }
      } catch (err) {
        console.error("Error fetching post:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();

    const commentsRef = collection(db, "posts", postId as string, "comments");
    const q = query(commentsRef, orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setComments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, async (error) => {
      const permissionError = new FirestorePermissionError({
        path: commentsRef.path,
        operation: 'list',
      });
      errorEmitter.emit('permission-error', permissionError);
    });

    return () => unsubscribe();
  }, [postId, router, toast, db]);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim() || !db) return;

    setIsSubmitting(true);
    const commentData = {
      userId: user.uid,
      username: user.displayName || "Anonymous",
      text: newComment,
      createdAt: serverTimestamp(),
    };

    const commentRef = collection(db, "posts", postId as string, "comments");
    addDoc(commentRef, commentData)
      .then(() => {
        setNewComment("");
      })
      .catch(async (error) => {
        const permissionError = new FirestorePermissionError({
          path: commentRef.path,
          operation: 'create',
          requestResourceData: commentData,
        });
        errorEmitter.emit('permission-error', permissionError);
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  const handleDelete = async () => {
    if (!db || !postId || !user) return;
    if (!confirm("Are you sure you want to delete this masterpiece forever?")) return;

    setIsDeleting(true);
    const docRef = doc(db, "posts", postId as string);
    deleteDoc(docRef)
      .then(() => {
        toast({ title: "Deleted", description: "Your artwork has been removed." });
        router.push("/explore");
      })
      .catch(async (error) => {
        const permissionError = new FirestorePermissionError({
          path: docRef.path,
          operation: 'delete',
        });
        errorEmitter.emit('permission-error', permissionError);
      })
      .finally(() => {
        setIsDeleting(false);
      });
  };

  const handleUpdate = async () => {
    if (!db || !postId || !editTitle.trim()) return;

    setIsSubmitting(true);
    const docRef = doc(db, "posts", postId as string);
    const updateData = {
      title: editTitle,
      description: editDesc,
    };

    updateDoc(docRef, updateData)
      .then(() => {
        setPost({ ...post, ...updateData });
        setIsEditing(false);
        toast({ title: "Updated", description: "Changes saved successfully." });
      })
      .catch(async (error) => {
        const permissionError = new FirestorePermissionError({
          path: docRef.path,
          operation: 'update',
          requestResourceData: updateData,
        });
        errorEmitter.emit('permission-error', permissionError);
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-accent" /></div>;
  if (!post) return null;

  const isOwner = user?.uid === post.userId;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl space-y-8">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.back()} className="rounded-full">
          <ArrowLeft className="mr-2" size={18} /> Back
        </Button>
        {isOwner && (
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="rounded-full gap-2 border-accent text-accent hover:bg-accent hover:text-white"
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? <X size={18} /> : <Edit2 size={18} />}
              {isEditing ? "Cancel" : "Edit"}
            </Button>
            <Button 
              variant="destructive" 
              className="rounded-full gap-2"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
              Delete
            </Button>
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-6">
          <div className="relative aspect-[4/5] w-full rounded-3xl overflow-hidden shadow-2xl border bg-white">
            <Image 
              src={post.imageUrl || post.imageURL} 
              alt={post.title} 
              fill 
              className="object-contain" 
              priority
            />
          </div>
          
          <div className="p-8 bg-white rounded-3xl border shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="h-14 w-14 border-2 border-accent/20">
                  <AvatarFallback>{post.username?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  {isEditing ? (
                    <Input 
                      value={editTitle} 
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="text-xl font-bold h-10 min-w-[200px]"
                      placeholder="Title"
                    />
                  ) : (
                    <h2 className="font-bold text-2xl">{post.title}</h2>
                  )}
                  <p className="text-muted-foreground text-sm">by <span className="text-accent font-semibold">@{post.username}</span></p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" className="rounded-full gap-2 h-12 px-6">
                  <Heart size={20} /> {post.likesCount || 0}
                </Button>
                <Button variant="outline" size="icon" className="rounded-full h-12 w-12">
                  <Share2 size={20} />
                </Button>
              </div>
            </div>

            {isEditing ? (
              <div className="space-y-4">
                <Textarea 
                  value={editDesc} 
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="min-h-[150px] resize-none"
                  placeholder="Tell us about your masterpiece..."
                />
                <Button onClick={handleUpdate} disabled={isSubmitting} className="rounded-full w-full bg-accent text-white h-12 gap-2">
                  {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                  Save Updates
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-accent/5 p-6 rounded-2xl">
                  <h4 className="font-bold text-xs uppercase tracking-widest text-accent mb-3">The Story</h4>
                  <p className="text-lg leading-relaxed">
                    {post.description || "The artist left no notes for this piece."}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {post.tags?.map((tag: string) => (
                    <Badge key={tag} variant="secondary" className="bg-primary/10 text-xs px-4 py-1.5 rounded-full">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
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
                  placeholder={user ? "Share a thought..." : "Login to join"} 
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  disabled={!user || isSubmitting}
                  className="rounded-full border-primary/20 h-12 pl-6"
                />
                <Button 
                  type="submit" 
                  size="icon" 
                  disabled={!user || isSubmitting || !newComment.trim()}
                  className="rounded-full bg-accent text-white h-12 w-12 flex-shrink-0"
                >
                  <Send size={18} />
                </Button>
              </form>

              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3 animate-in fade-in slide-in-from-top-1">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="text-xs">{comment.username?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="bg-primary/5 rounded-2xl rounded-tl-none p-4 flex-grow">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold">@{comment.username}</span>
                        <span className="text-[10px] text-muted-foreground">
                          {comment.createdAt ? formatDistanceToNow(comment.createdAt.toDate(), { addSuffix: true }) : 'just now'}
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed text-foreground/80">{comment.text}</p>
                    </div>
                  </div>
                ))}
                {comments.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground italic text-sm">
                    No notes yet. Be the first to share your vision!
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
