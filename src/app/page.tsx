
"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArtworkCard } from "@/components/ArtworkCard";
import { Sparkles, ArrowRight, Palette } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function Home() {
  const { user } = useAuth();
  
  const featuredArtworks = [
    { id: "art-1", title: "Midnight Resonance", username: "DigitalArtisan", imageURL: "https://images.pexels.com/photos/1585325/pexels-photo-1585325.jpeg", likesCount: 124, tags: ["Abstract", "Vivid"] },
    { id: "art-2", title: "Golden Hour", username: "NatureLover", imageURL: "https://images.pexels.com/photos/1619317/pexels-photo-1619317.jpeg", likesCount: 89, tags: ["Landscape", "Warm"] },
    { id: "art-3", title: "Fragmented Identity", username: "CubeMaster", imageURL: "https://images.pexels.com/photos/2471235/pexels-photo-2471235.jpeg", likesCount: 256, tags: ["Digital", "Cubit"] },
    { id: "art-4", title: "The Silent Forest", username: "NatureLover", imageURL: "https://images.pexels.com/photos/1166644/pexels-photo-1166644.jpeg", likesCount: 67, tags: ["Oil", "Forest"] },
  ];

  return (
    <div className="flex flex-col gap-24 pb-24">
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image 
            src="https://images.pexels.com/photos/1585325/pexels-photo-1585325.jpeg" 
            alt="Artistic Hero" 
            fill
            className="object-cover opacity-80"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/20 to-background" />
        </div>
        
        <div className="container relative z-10 px-4 text-center space-y-8 max-w-4xl">
          <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-white/90 backdrop-blur-md text-accent border shadow-sm text-sm font-bold">
            <Sparkles size={16} />
            <span>Artistic Vision Unleashed</span>
          </div>
          <h1 className="font-headline font-bold text-6xl md:text-8xl tracking-tight leading-tight">
            Color<span className="text-accent">Canvas.</span>
          </h1>
          <p className="text-xl md:text-2xl text-[#1D1616] max-w-2xl mx-auto font-medium">
            A minimal creative studio to generate AI art, discover inspiration, and share your vision with the world.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href={user ? "/create" : "/signup"}>
              <Button size="lg" className="bg-accent text-white hover:bg-accent/90 px-12 h-16 rounded-full shadow-2xl text-lg">
                {user ? "Enter Studio" : "Join the Community"} <ArrowRight size={20} className="ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Section */}
      <section className="container mx-auto px-4 space-y-12">
        <div className="flex items-end justify-between border-b pb-8">
          <div className="space-y-2">
            <h2 className="font-headline font-bold text-4xl">Curated Excellence</h2>
            <p className="text-muted-foreground text-lg">Handpicked favorites from our creative community.</p>
          </div>
          <Link href="/explore">
            <Button variant="ghost" className="text-accent font-bold gap-2 text-lg">
              Explore All <ArrowRight size={20} />
            </Button>
          </Link>
        </div>
        
        <div className="artwork-grid">
          {featuredArtworks.map((artwork) => (
            <ArtworkCard key={artwork.id} {...artwork} />
          ))}
        </div>
      </section>

      {/* Discovery CTA */}
      <section className="container mx-auto px-4">
        <div className="bg-accent rounded-[3rem] p-12 md:p-24 text-center space-y-8 text-white shadow-2xl relative overflow-hidden">
           <div className="absolute top-0 right-0 p-24 opacity-10">
              <Palette size={300} />
           </div>
           <h2 className="font-headline font-bold text-4xl md:text-6xl max-w-3xl mx-auto">Ready to start your next masterpiece?</h2>
           <p className="text-white/80 text-xl max-w-xl mx-auto">Use our AI canvas to render your wildest imaginations in seconds.</p>
           <Link href="/create" className="inline-block">
              <Button size="lg" variant="secondary" className="px-12 h-16 rounded-full text-lg font-bold">
                Start Creating Now
              </Button>
           </Link>
        </div>
      </section>
    </div>
  );
}
