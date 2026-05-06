"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArtworkCard } from "@/components/ArtworkCard";
import { Search, X, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { useFirestore } from "@/firebase";
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export default function ExplorePage() {
  const db = useFirestore();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [artworks, setArtworks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const tags = ["Abstract", "Landscape", "Digital", "Oil", "Space", "Minimalist", "Neon", "Portrait"];

  useEffect(() => {
    if (!db) return;
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const posts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setArtworks(posts);
      setLoading(false);
    }, async (error) => {
      const permissionError = new FirestorePermissionError({
        path: 'posts',
        operation: 'list',
      });
      errorEmitter.emit('permission-error', permissionError);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [db]);

  const filteredArtworks = artworks.filter(art => {
    const matchesSearch = 
      art.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      art.username?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = selectedTag ? art.tags?.includes(selectedTag) : true;
    return matchesSearch && matchesTag;
  });

  return (
    <div className="container mx-auto px-4 py-12 space-y-12 min-h-screen">
      <div className="space-y-4 max-w-2xl">
        <h1 className="font-headline font-bold text-4xl">Explore Gallery</h1>
        <p className="text-muted-foreground text-lg">
          Discover unique creations from around the world.
        </p>
      </div>

      <div className="sticky top-[4.5rem] z-40 bg-background/95 backdrop-blur-md py-6 border-y space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input 
              className="pl-12 h-12 rounded-full border-primary/20 bg-white focus-visible:ring-accent"
              placeholder="Search artists or titles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
              {tags.map(tag => (
                <Badge 
                  key={tag} 
                  onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                  className={`cursor-pointer px-4 py-1.5 rounded-full transition-all text-sm font-medium border
                    ${selectedTag === tag 
                      ? "bg-accent text-white border-accent" 
                      : "bg-white text-muted-foreground border-primary/20 hover:border-accent"}`}
                >
                  {tag}
                </Badge>
              ))}
            </div>
            {selectedTag && (
              <Button variant="ghost" size="sm" onClick={() => setSelectedTag(null)} className="h-8 w-8 p-0 rounded-full">
                <X size={16} />
              </Button>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <Loader2 className="animate-spin text-accent" size={40} />
          <p className="text-muted-foreground font-medium">Loading masterpieces...</p>
        </div>
      ) : filteredArtworks.length > 0 ? (
        <div className="artwork-grid">
          {filteredArtworks.map((art) => (
            <ArtworkCard 
              key={art.id} 
              id={art.id}
              imageURL={art.imageUrl}
              title={art.title}
              username={art.username}
              likesCount={art.likesCount || 0}
              tags={art.tags}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-32 space-y-4">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-muted-foreground">
            <Search size={32} />
          </div>
          <h3 className="font-headline font-bold text-2xl">No matches found</h3>
          <p className="text-muted-foreground">Try clearing your filters or search terms.</p>
          <Button variant="outline" className="rounded-full" onClick={() => { setSearchQuery(""); setSelectedTag(null); }}>
            Clear All
          </Button>
        </div>
      )}
    </div>
  );
}
