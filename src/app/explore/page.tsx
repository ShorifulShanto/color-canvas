
"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArtworkCard } from "@/components/ArtworkCard";
import { Search, SlidersHorizontal, Grid, List } from "lucide-react";

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState("");
  
  // Curated Pexels Art Imagery
  const artworks = [
    { id: "e1", title: "Midnight Resonance", username: "SonicPainter", imageURL: "https://images.pexels.com/photos/1585325/pexels-photo-1585325.jpeg?auto=compress&cs=tinysrgb&w=600", likesCount: 452, tags: ["Abstract", "Vivid"] },
    { id: "e2", title: "Golden Hour", username: "LightCatcher", imageURL: "https://images.pexels.com/photos/1619317/pexels-photo-1619317.jpeg?auto=compress&cs=tinysrgb&w=600", likesCount: 321, tags: ["Landscape", "Warm"] },
    { id: "e3", title: "Fragmented Identity", username: "CubeMaster", imageURL: "https://images.pexels.com/photos/2471235/pexels-photo-2471235.jpeg?auto=compress&cs=tinysrgb&w=600", likesCount: 890, tags: ["Digital", "Cubit"] },
    { id: "e4", title: "The Silent Forest", username: "NatureLover", imageURL: "https://images.pexels.com/photos/102127/pexels-photo-102127.jpeg?auto=compress&cs=tinysrgb&w=600", likesCount: 156, tags: ["Oil", "Forest"] },
    { id: "e5", title: "Cosmic Dance", username: "StellarEye", imageURL: "https://images.pexels.com/photos/1274260/pexels-photo-1274260.jpeg?auto=compress&cs=tinysrgb&w=600", likesCount: 742, tags: ["Space", "Glow"] },
    { id: "e6", title: "Sculpted Silence", username: "OrigamiFan", imageURL: "https://images.pexels.com/photos/134402/pexels-photo-134402.jpeg?auto=compress&cs=tinysrgb&w=600", likesCount: 233, tags: ["Sculpture", "3D"] },
    { id: "e7", title: "Urban Decay", username: "CityGrim", imageURL: "https://images.pexels.com/photos/1647121/pexels-photo-1647121.jpeg?auto=compress&cs=tinysrgb&w=600", likesCount: 112, tags: ["Street", "B&W"] },
    { id: "e8", title: "Floral Whisper", username: "PetalPush", imageURL: "https://images.pexels.com/photos/1166644/pexels-photo-1166644.jpeg?auto=compress&cs=tinysrgb&w=600", likesCount: 655, tags: ["Floral", "Soft"] },
  ];

  const filteredArtworks = artworks.filter(art => 
    art.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    art.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-12 space-y-12 min-h-screen">
      <div className="space-y-4 max-w-2xl">
        <h1 className="font-headline font-bold text-4xl">Explore Gallery</h1>
        <p className="text-muted-foreground text-lg">
          Discover unique creations from around the world. Filter by style, medium, or artist.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between sticky top-[4.5rem] z-40 bg-background/80 backdrop-blur-md py-4 border-b">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <Input 
            className="pl-10 h-12 rounded-full border-primary/20 focus-visible:ring-accent"
            placeholder="Search artworks, artists, or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Button variant="outline" className="rounded-full h-12 px-6 flex items-center gap-2">
            <SlidersHorizontal size={18} /> Filters
          </Button>
          <div className="hidden sm:flex border rounded-full p-1 bg-primary/10">
            <Button size="icon" variant="ghost" className="h-10 w-10 rounded-full bg-white shadow-sm">
              <Grid size={18} />
            </Button>
            <Button size="icon" variant="ghost" className="h-10 w-10 rounded-full">
              <List size={18} />
            </Button>
          </div>
        </div>
      </div>

      {filteredArtworks.length > 0 ? (
        <div className="artwork-grid">
          {filteredArtworks.map((art) => (
            <ArtworkCard key={art.id} {...art} />
          ))}
        </div>
      ) : (
        <div className="text-center py-32 space-y-4">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-muted-foreground">
            <Search size={32} />
          </div>
          <h3 className="font-headline font-bold text-2xl">No results found</h3>
          <p className="text-muted-foreground">Try adjusting your search terms or filters.</p>
          <Button variant="outline" onClick={() => setSearchQuery("")}>Clear Search</Button>
        </div>
      )}
    </div>
  );
}
