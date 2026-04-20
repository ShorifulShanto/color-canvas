
"use client";

import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Heart, MessageCircle, Share2, User } from "lucide-react";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { doc, updateDoc, increment, setDoc, deleteDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";

interface ArtworkCardProps {
  id: string;
  imageURL: string;
  title: string;
  username: string;
  likesCount: number;
  tags?: string[];
}

export function ArtworkCard({ id, imageURL, title, username, likesCount, tags = [] }: ArtworkCardProps) {
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!user) return;
    const checkLike = async () => {
      const likeRef = doc(db, "posts", id, "likes", user.uid);
      const likeDoc = await getDoc(likeRef);
      setIsLiked(likeDoc.exists());
    };
    checkLike();
  }, [id, user]);

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
      toast({ title: "Login required", description: "Log in to like artwork." });
      return;
    }

    const postRef = doc(db, "posts", id);
    const likeRef = doc(db, "posts", id, "likes", user.uid);

    if (isLiked) {
      setIsLiked(false);
      deleteDoc(likeRef);
      updateDoc(postRef, { likesCount: increment(-1) });
    } else {
      setIsLiked(true);
      setDoc(likeRef, { likedAt: serverTimestamp() });
      updateDoc(postRef, { likesCount: increment(1) });
    }
  };

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
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
          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
            <div className="flex gap-2 flex-wrap">
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
            <span className="text-xs font-medium">{likesCount + (isLiked ? 1 : 0) - (isLiked ? 1 : 0)} {/* Simplified logic */} </span>
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
