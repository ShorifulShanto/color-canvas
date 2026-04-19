
"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArtworkCard } from "@/components/ArtworkCard";
import { Search, SlidersHorizontal, Grid, List, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  
  const tags = ["Abstract", "Landscape", "Digital", "Oil", "Space", "Minimalist", "Neon", "Portrait"];

  const artworks = [
    { id: "e1", title: "Midnight Resonance", username: "SonicPainter", imageURL: "https://images.pexels.com/photos/1585325/pexels-photo-1585325.jpeg?auto=compress&cs=tinysrgb&w=600", likesCount: 452, tags: ["Abstract", "Vivid"] },
    { id: "e2", title: "Golden Hour", username: "LightCatcher", imageURL: "https://images.pexels.com/photos/1619317/pexels-photo-1619317.jpeg?auto=compress&cs=tinysrgb&w=600", likesCount: 321, tags: ["Landscape", "Warm"] },
    { id: "e3", title: "Fragmented Identity", username: "CubeMaster", imageURL: "https://images.pexels.com/photos/2471235/pexels-photo-2471235.jpeg?auto=compress&cs=tinysrgb&w=600", likesCount: 890, tags: ["Digital", "Geometric"] },
    { id: "e4", title: "The Silent Forest", username: "NatureLover", imageURL: "https://images.pexels.com/photos/102127/pexels-photo-102127.jpeg?auto=compress&cs=tinysrgb&w=600", likesCount: 156, tags: ["Oil", "Forest"] },
    { id: "e5", title: "Cosmic Dance", username: "StellarEye", imageURL: "https://images.pexels.com/photos/1274260/pexels-photo-1274260.jpeg?auto=compress&cs=tinysrgb&w=600", likesCount: 742, tags: ["Space", "Glow"] },
    { id: "e6", title: "Sculpted Silence", username: "OrigamiFan", imageURL: "https://images.pexels.com/photos/134402/pexels-photo-134402.jpeg?auto=compress&cs=tinysrgb&w=600", likesCount: 233, tags: ["Sculpture", "3D"] },
    { id: "e7", title: "Urban Decay", username: "CityGrim", imageURL: "https://images.pexels.com/photos/1647121/pexels-photo-1647121.jpeg?auto=compress&cs=tinysrgb&w=600", likesCount: 112, tags: ["Street", "B&W"] },
    { id: "e8", title: "Floral Whisper", username: "PetalPush", imageURL: "https://images.pexels.com/photos/1166644/pexels-photo-1166644.jpeg?auto=compress&cs=tinysrgb&w=600", likesCount: 655, tags: ["Floral", "Soft"] },
    { id: "e9", title: "Oceanic Bliss", username: "WaveRider", imageURL: "https://images.pexels.com/photos/1103970/pexels-photo-1103970.jpeg?auto=compress&cs=tinysrgb&w=600", likesCount: 210, tags: ["Abstract", "Blue"] },
    { id: "e10", title: "Chromatic Chaos", username: "PrismArt", imageURL: "https://images.pexels.com/photos/1193742/pexels-photo-1193742.jpeg?auto=compress&cs=tinysrgb&w=600", likesCount: 543, tags: ["Vibrant", "Expressionist"] },
    { id: "e11", title: "Ethereal Layers", username: "TextureKing", imageURL: "https://images.pexels.com/photos/1572386/pexels-photo-1572386.jpeg?auto=compress&cs=tinysrgb&w=600", likesCount: 332, tags: ["Impasto", "Textured"] },
    { id: "e12", title: "Morning Mist", username: "PastelDreams", imageURL: "https://images.pexels.com/photos/1646953/pexels-photo-1646953.jpeg?auto=compress&cs=tinysrgb&w=600", likesCount: 445, tags: ["Pastel", "Minimalist"] },
    { id: "e13", title: "Cyberpunk Alley", username: "NeonVision", imageURL: "https://images.pexels.com/photos/2832382/pexels-photo-2832382.jpeg?auto=compress&cs=tinysrgb&w=600", likesCount: 988, tags: ["Neon", "Digital"] },
    { id: "e14", title: "City Pulse", username: "Metropolis", imageURL: "https://images.pexels.com/photos/20967/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=600", likesCount: 125, tags: ["Architecture", "Modern"] },
    { id: "e17", title: "Swirling Skies", username: "GoghForward", imageURL: "https://images.pexels.com/photos/161154/pexels-photo-161154.jpeg?auto=compress&cs=tinysrgb&w=600", likesCount: 1540, tags: ["Classic", "Impressionism"] },
    { id: "e18", title: "Fluidity", username: "AquaArt", imageURL: "https://images.pexels.com/photos/1070527/pexels-photo-1070527.jpeg?auto=compress&cs=tinysrgb&w=600", likesCount: 290, tags: ["Watercolour", "Flow"] },
    { id: "e19", title: "Ancient Gaze", username: "HistoryBuff", imageURL: "https://images.pexels.com/photos/1266808/pexels-photo-1266808.jpeg?auto=compress&cs=tinysrgb&w=600", likesCount: 411, tags: ["Statue", "Classic"] },
    { id: "e20", title: "Canvas Playground", username: "CreativeFlow", imageURL: "https://images.pexels.com/photos/1670044/pexels-photo-1670044.jpeg?auto=compress&cs=tinysrgb&w=600", likesCount: 560, tags: ["Acrylic", "Modern"] },
  ];

  const filteredArtworks = artworks.filter(art => {
    const matchesSearch = art.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          art.username.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = selectedTag ? art.tags.includes(selectedTag) : true;
    return matchesSearch && matchesTag;
  });

  return (
    <div className="container mx-auto px-4 py-12 space-y-12 min-h-screen">
      <div className="space-y-4 max-w-2xl">
        <h1 className="font-headline font-bold text-4xl">Explore Gallery</h1>
        <p className="text-muted-foreground text-lg">
          Discover unique creations. Filter by style, medium, or artist.
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
