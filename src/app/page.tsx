
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { ArtworkCard } from "@/components/ArtworkCard";
import { Sparkles, ArrowRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function Home() {
  const { user } = useAuth();
  
  // High quality Pexels art imagery
  const latestArtworks = [
    { id: "1", title: "Neon Dreams", username: "DigitalArtisan", imageURL: "https://images.pexels.com/photos/2832382/pexels-photo-2832382.jpeg?auto=compress&cs=tinysrgb&w=600", likesCount: 124, tags: ["Digital", "Vibrant"] },
    { id: "2", title: "Serenity", username: "NatureLover", imageURL: "https://images.pexels.com/photos/1646953/pexels-photo-1646953.jpeg?auto=compress&cs=tinysrgb&w=600", likesCount: 89, tags: ["Minimalist", "Calm"] },
    { id: "3", title: "Urban Jungle", username: "StreetLens", imageURL: "https://images.pexels.com/photos/20967/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=600", likesCount: 256, tags: ["Photography", "City"] },
    { id: "4", title: "Midnight Echo", username: "AbstractSoul", imageURL: "https://images.pexels.com/photos/2471234/pexels-photo-2471234.jpeg?auto=compress&cs=tinysrgb&w=600", likesCount: 67, tags: ["Abstract", "Dark"] },
  ];

  const heroImage = PlaceHolderImages.find(img => img.id === "hero")?.imageUrl;

  return (
    <div className="flex flex-col gap-16 pb-16">
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src={heroImage} 
            alt="Hero Background" 
            className="w-full h-full object-cover opacity-60 mix-blend-multiply"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/10 via-background/40 to-background" />
        </div>
        
        <div className="container relative z-10 px-4 text-center space-y-8 max-w-4xl">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 text-accent border border-accent/20 text-sm font-medium animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <Sparkles size={16} />
            <span>Discover the next generation of art</span>
          </div>
          <h1 className="font-headline font-bold text-5xl md:text-7xl lg:text-8xl tracking-tight leading-none animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
            Your vision, <br />
            <span className="text-accent">digitally mastered.</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300">
            Join the global community of creatives. Explore breathtaking artwork, share your own masterpieces, and find inspiration in every stroke.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 animate-in fade-in slide-in-from-bottom-16 duration-1000 delay-500">
            <Link href={user ? "/upload" : "/signup"}>
              <Button size="lg" className="bg-accent text-white hover:bg-accent/90 px-8 text-lg h-14 rounded-full shadow-lg shadow-accent/20">
                {user ? "Share Your Work" : "Join ColorCanvas"} <ArrowRight size={20} className="ml-2" />
              </Button>
            </Link>
            <Link href="/explore">
              <Button size="lg" variant="ghost" className="px-8 text-lg h-14 rounded-full hover:bg-white/50 border border-transparent hover:border-accent/20">
                Explore Gallery
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Section */}
      <section className="container mx-auto px-4 space-y-12">
        <div className="flex items-end justify-between">
          <div className="space-y-2">
            <h2 className="font-headline font-bold text-3xl">Featured Artists</h2>
            <p className="text-muted-foreground">Handpicked excellence from our creative community.</p>
          </div>
          <Link href="/explore" className="text-accent font-medium hover:underline hidden sm:block">
            View all artworks
          </Link>
        </div>
        
        <div className="artwork-grid">
          {latestArtworks.map((artwork) => (
            <ArtworkCard key={artwork.id} {...artwork} />
          ))}
        </div>
      </section>

      {/* Latest Section */}
      <section className="container mx-auto px-4 space-y-12">
        <div className="space-y-2">
          <h2 className="font-headline font-bold text-3xl">Latest Uploads</h2>
          <p className="text-muted-foreground">Fresh perspectives added by artists just moments ago.</p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="group relative aspect-square bg-primary/20 rounded-xl overflow-hidden shadow-sm">
               <img 
                 src={`https://images.pexels.com/photos/1103970/pexels-photo-1103970.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop&random=${i}`} 
                 alt={`Art ${i}`} 
                 className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
               />
               <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                  <span className="text-white font-medium">Inspiration #{i + 1}</span>
                  <span className="text-white/70 text-xs">@creative_mind</span>
               </div>
            </div>
          ))}
        </div>
        <div className="text-center pt-8">
           <Link href="/explore">
              <Button variant="outline" size="lg" className="rounded-full px-12">Load More Inspiration</Button>
           </Link>
        </div>
      </section>
    </div>
  );
}
