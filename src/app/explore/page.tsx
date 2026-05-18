
"use client";
export const dynamic = 'force-dynamic';
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArtworkCard } from "@/components/ArtworkCard";
import { Search, X, Loader2, Globe, Users, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { collection, query, orderBy } from "firebase/firestore";
import { useFirestore, useUser, useMemoFirebase, useCollection } from "@/firebase";
import { searchPexels, PexelsPhoto } from "@/lib/pexels";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function ExplorePage() {
  const db = useFirestore();
  const router = useRouter();
  const { user } = useUser();
  
  // Pexels State
  const [pexelsQuery, setPexelsQuery] = useState("");
  const [pexelsPhotos, setPexelsPhotos] = useState<PexelsPhoto[]>([]);
  const [isPexelsLoading, setIsPexelsLoading] = useState(false);

  // Community State
  const [communitySearch, setCommunitySearch] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  
  const communityTags = ["Abstract", "Landscape", "Digital", "Oil", "Space", "Minimalist", "Neon", "Portrait"];

  // Fetch Pexels on mount
  useEffect(() => {
    handlePexelsSearch("art artistic");
  }, []);

  // Community Query using specialized hooks for real-time and stability
  const communityQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, "posts"), orderBy("createdAt", "desc"));
  }, [db]);

  const { data: communityArtworks = [], isLoading: isCommunityLoading } = useCollection(communityQuery);

  const handlePexelsSearch = async (term: string) => {
    setIsPexelsLoading(true);
    try {
      const results = await searchPexels(term || "art", 24);
      setPexelsPhotos(results);
    } finally {
      setIsPexelsLoading(false);
    }
  };

  const filteredCommunity = communityArtworks.filter(art => {
    const matchesSearch = 
      art.title?.toLowerCase().includes(communitySearch.toLowerCase()) || 
      art.username?.toLowerCase().includes(communitySearch.toLowerCase());
    const matchesTag = selectedTag ? art.tags?.includes(selectedTag) : true;
    return matchesSearch && matchesTag;
  });

  const handleCaptureImage = (url: string) => {
    const encodedUrl = encodeURIComponent(url);
    router.push(`/upload?source=${encodedUrl}`);
  };

  return (
    <div className="container mx-auto px-4 py-12 space-y-12 min-h-screen">
      <div className="space-y-4 max-w-3xl">
        <h1 className="font-headline font-bold text-4xl md:text-5xl">Discovery Engine</h1>
        <p className="text-muted-foreground text-lg">
          Explore millions of high-quality inspirations or browse community masterpieces.
        </p>
      </div>

      <Tabs defaultValue="discovery" className="space-y-10">
        <div className="flex flex-col md:flex-row gap-6 items-center justify-between sticky top-[4.5rem] z-40 bg-background/95 backdrop-blur-md py-6 border-y">
          <TabsList className="bg-white/80 p-1 rounded-full h-12 shadow-sm border w-full max-w-xs md:max-w-md shrink-0">
            <TabsTrigger value="discovery" className="rounded-full px-6 flex items-center gap-2 data-[state=active]:bg-accent data-[state=active]:text-white flex-1">
              <Globe size={18} /> Global Portal
            </TabsTrigger>
            <TabsTrigger value="community" className="rounded-full px-6 flex items-center gap-2 data-[state=active]:bg-accent data-[state=active]:text-white flex-1">
              <Users size={18} /> Community
            </TabsTrigger>
          </TabsList>

          <div className="relative w-full max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input 
              className="pl-12 h-12 rounded-full border-primary/20 bg-white focus-visible:ring-accent shadow-sm"
              placeholder="Search global discovery or community tags..."
              value={pexelsQuery || communitySearch}
              onChange={(e) => {
                const val = e.target.value;
                setPexelsQuery(val);
                setCommunitySearch(val);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handlePexelsSearch(pexelsQuery);
              }}
            />
          </div>
        </div>

        <TabsContent value="discovery" className="space-y-8 focus-visible:outline-none">
          {isPexelsLoading ? (
            <div className="flex flex-col items-center justify-center py-32 space-y-4">
              <Loader2 className="animate-spin text-accent" size={40} />
              <p className="text-muted-foreground font-medium">Connecting to Pexels Global...</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {pexelsPhotos.map((photo) => (
                <div key={photo.id} className="group relative aspect-[3/4] rounded-3xl overflow-hidden bg-white shadow-sm transition-all hover:shadow-xl hover:-translate-y-1">
                  <Image 
                    src={photo.src.large} 
                    alt={photo.photographer} 
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6 space-y-4">
                    <div className="space-y-1">
                      <p className="text-white font-bold text-sm truncate">{photo.photographer}</p>
                      <p className="text-white/70 text-xs">Pexels Curator</p>
                    </div>
                    <Button 
                      size="sm" 
                      className="w-full rounded-full bg-white text-black hover:bg-accent hover:text-white font-bold transition-colors"
                      onClick={() => handleCaptureImage(photo.src.large2x)}
                    >
                      <Plus size={16} className="mr-2" /> Capture Inspiration
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="community" className="space-y-12 focus-visible:outline-none">
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider mr-2">Quick Filters:</span>
            {communityTags.map(tag => (
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
            {selectedTag && (
              <Button variant="ghost" size="sm" onClick={() => setSelectedTag(null)} className="h-8 w-8 p-0 rounded-full">
                <X size={16} />
              </Button>
            )}
          </div>

          {isCommunityLoading ? (
            <div className="flex flex-col items-center justify-center py-32 space-y-4">
              <Loader2 className="animate-spin text-accent" size={40} />
              <p className="text-muted-foreground font-medium">Loading community works...</p>
            </div>
          ) : filteredCommunity.length > 0 ? (
            <div className="artwork-grid">
              {filteredCommunity.map((art) => (
                <ArtworkCard 
                  key={art.id} 
                  id={art.id}
                  imageURL={art.imageUrl || art.imageURL}
                  title={art.title}
                  username={art.username}
                  likesCount={art.likesCount || 0}
                  tags={art.tags}
                  showDelete={user?.uid === art.userId}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-32 space-y-4">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-muted-foreground">
                <Users size={32} />
              </div>
              <h3 className="font-headline font-bold text-2xl">No community matches</h3>
              <p className="text-muted-foreground">Try clearing your filters or browse the global discovery portal.</p>
              <Button variant="outline" className="rounded-full" onClick={() => { setCommunitySearch(""); setSelectedTag(null); }}>
                Clear Filters
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
