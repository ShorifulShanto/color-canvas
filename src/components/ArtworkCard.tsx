"use client";

import Link from "next/link";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Heart, MessageCircle, Share2, User } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";

interface ArtworkCardProps {
  id: string;
  imageURL: string;
  title: string;
  username: string;
  likesCount: number;
  tags?: string[];
}

export function ArtworkCard({ id, imageURL, title, username, likesCount, tags = [] }: ArtworkCardProps) {
  const [isLiked, setIsLiked] = useState(false);

  return (
    <Card className="group overflow-hidden border-none shadow-none bg-transparent">
      <Link href={`/artwork/${id}`}>
        <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl bg-primary/20">
          <img
            src={imageURL}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
            <div className="flex gap-2 flex-wrap">
              {tags.slice(0, 3).map(tag => (
                <Badge key={tag} variant="secondary" className="bg-white/80 text-black border-none text-[10px]">
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
          <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center overflow-hidden">
             <User size={10} />
          </div>
          <span>{username}</span>
        </div>
      </CardContent>
      <CardFooter className="px-0 py-2 flex justify-between items-center text-muted-foreground">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsLiked(!isLiked)}
            className={`flex items-center gap-1 transition-colors hover:text-red-500 ${isLiked ? 'text-red-500' : ''}`}
          >
            <Heart size={18} fill={isLiked ? "currentColor" : "none"} />
            <span className="text-xs">{likesCount + (isLiked ? 1 : 0)}</span>
          </button>
          <button className="flex items-center gap-1 transition-colors hover:text-accent">
            <MessageCircle size={18} />
            <span className="text-xs">0</span>
          </button>
        </div>
        <button className="hover:text-accent transition-colors">
          <Share2 size={18} />
        </button>
      </CardFooter>
    </Card>
  );
}