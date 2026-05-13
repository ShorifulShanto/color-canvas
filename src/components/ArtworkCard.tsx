
"use client";

import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Heart, MessageCircle, Share2, User, Trash2, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { doc, updateDoc, increment, setDoc, deleteDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { useAuth, useFirestore } from "@/firebase";
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { Button } from "@/components/ui/button";

interface ArtworkCardProps {
  id: string;
  imageURL: string;
  title: string;
  username: string;
  likesCount: number;
  tags?: string[];
  showDelete?: boolean;
}

export function ArtworkCard({ id, imageURL, title, username, likesCount, tags = [], showDelete = false }: ArtworkCardProps) {
  const { user } = useAuth();
  const db = useFirestore();
  const [isLiked, setIsLiked] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!user || !db) return;
    const checkLike = async () => {
      const likeRef = doc(db, "posts", id, "likes", user.uid);
      try {
        const likeDoc = await getDoc(likeRef);
        setIsLiked(likeDoc.exists());
      } catch (err) {
        // Silently fail for list/get in summary view
      }
    };
    checkLike();
  }, [id, user, db]);

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast({ title: "Login required", description: "Log in to like artwork." });
      return;
    }

    const postRef = doc(db, "posts", id);
    const likeRef = doc(db, "posts", id, "likes", user.uid);

    if (isLiked) {
      setIsLiked(false);
      deleteDoc(likeRef).catch(async () => {
        const error = new FirestorePermissionError({ path: likeRef.path, operation: 'delete' });
        errorEmitter.emit('permission-error', error);
      });
      updateDoc(postRef, { likesCount: increment(-1) }).catch(async () => {
        const error = new FirestorePermissionError({ path: postRef.path, operation: 'update' });
        errorEmitter.emit('permission-error', error);
      });
    } else {
      setIsLiked(true);
      const likeData = { likedAt: serverTimestamp() };
      setDoc(likeRef, likeData).catch(async () => {
        const error = new FirestorePermissionError({ path: likeRef.path, operation: 'write', requestResourceData: likeData });
        errorEmitter.emit('permission-error', error);
      });
      updateDoc(postRef, { likesCount: increment(1) }).catch(async () => {
        const error = new FirestorePermissionError({ path: postRef.path, operation: 'update' });
        errorEmitter.emit('permission-error', error);
      });
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!db || !id) return;

    if (!confirm("Are you sure you want to delete this masterpiece? This action cannot be undone.")) return;

    setIsDeleting(true);
    const postRef = doc(db, "posts", id);
    
    deleteDoc(postRef)
      .then(() => {
        toast({ title: "Artwork deleted", description: "It has been removed from your gallery." });
      })
      .catch(async (error) => {
        const permissionError = new FirestorePermissionError({
          path: postRef.path,
          operation: 'delete',
        });
        errorEmitter.emit('permission-error', permissionError);
      })
      .finally(() => {
        setIsDeleting(false);
      });
  };

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (typeof window === 'undefined') return;
    const url = `${window.location.origin}/explore/${id}`;
    navigator.clipboard.writeText(url);
    toast({ title: "Link copied!", description: "Share your discovery." });
  };

  return (
    <Card className="group overflow-hidden border-none shadow-none bg-transparent hover:-translate-y-1 transition-transform duration-300">
      <Link href={`/explore/${id}`}>
        <div className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl bg-white shadow-sm border">
          <Image
            src={imageURL}
            alt={title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-start justify-end p-4">
            {showDelete && (
              <Button 
                variant="destructive" 
                size="icon" 
                onClick={handleDelete} 
                className="rounded-full shadow-lg"
                disabled={isDeleting}
              >
                {isDeleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
              </Button>
            )}
            <div className="absolute bottom-6 left-6 flex gap-2 flex-wrap">
              {tags?.slice(0, 2).map(tag => (
                <Badge key={tag} className="bg-white/90 text-black border-none text-[10px] font-bold px-3">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </Link>
      <CardContent className="pt-4 px-0 pb-2">
        <h3 className="font-headline font-semibold text-lg line-clamp-1">{title}</h3>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
          <div className="w-5 h-5 rounded-full bg-accent/10 flex items-center justify-center text-accent">
             <User size={10} />
          </div>
          <span className="hover:text-accent transition-colors">@{username}</span>
        </div>
      </CardContent>
      <CardFooter className="px-0 py-2 flex justify-between items-center text-muted-foreground mt-1">
        <div className="flex items-center gap-5">
          <button 
            onClick={handleLike}
            className={`flex items-center gap-1.5 transition-colors hover:text-red-500 ${isLiked ? 'text-red-500' : ''}`}
          >
            <Heart size={18} fill={isLiked ? "currentColor" : "none"} />
            <span className="text-xs font-medium">{likesCount}</span>
          </button>
          <Link href={`/explore/${id}`} className="flex items-center gap-1.5 transition-colors hover:text-accent">
            <MessageCircle size={18} />
          </Link>
        </div>
        <button onClick={handleShare} className="hover:text-accent transition-colors">
          <Share2 size={18} />
        </button>
      </CardFooter>
    </Card>
  );
}
