
"use client";

import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Heart, MessageCircle, Share2, User } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    navigator.clipboard.writeText(`${window.location.origin}/artwork/${id}`);
    toast({
      title: "Link copied!",
      description: "Artwork link has been copied to your clipboard.",
    });
  };

  return (
    <Card className="group overflow-hidden border-none shadow-none bg-transparent transition-all duration-300">
      <Link href={`/explore`}>
        <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-primary/20">
          <Image
            src={imageURL}
            alt={title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
            <div className="flex gap-2 flex-wrap">
              {tags.slice(0, 3).map(tag => (
                <Badge key={tag} variant="secondary" className="bg-white/90 text-black border-none text-[10px] font-bold">
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
          <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center overflow-hidden text-accent">
             <User size={12} />
          </div>
          <span className="hover:text-accent transition-colors">@{username}</span>
        </div>
      </CardContent>
      <CardFooter className="px-0 py-2 flex justify-between items-center text-muted-foreground border-t border-primary/10 mt-2">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsLiked(!isLiked)}
            className={`flex items-center gap-1.5 transition-colors hover:text-red-500 ${isLiked ? 'text-red-500' : ''}`}
          >
            <Heart size={18} fill={isLiked ? "currentColor" : "none"} />
            <span className="text-xs font-medium">{likesCount + (isLiked ? 1 : 0)}</span>
          </button>
          <button className="flex items-center gap-1.5 transition-colors hover:text-accent">
            <MessageCircle size={18} />
            <span className="text-xs font-medium">0</span>
          </button>
        </div>
        <button onClick={handleShare} className="hover:text-accent transition-colors p-1 rounded-full hover:bg-accent/5">
          <Share2 size={18} />
        </button>
      </CardFooter>
    </Card>
  );
}
