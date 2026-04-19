
"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { ArtworkCard } from "@/components/ArtworkCard";
import { Sparkles, ArrowRight, Upload } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function Home() {
  const { user } = useAuth();
  
  const featuredArtworks = [
    { id: "1", title: "Neon Dreams", username: "DigitalArtisan", imageURL: "https://images.pexels.com/photos/2832382/pexels-photo-2832382.jpeg?auto=compress&cs=tinysrgb&w=600", likesCount: 124, tags: ["Digital", "Vibrant"] },
    { id: "2", title: "Serenity", username: "NatureLover", imageURL: "https://images.pexels.com/photos/1646953/pexels-photo-1646953.jpeg?auto=compress&cs=tinysrgb&w=600", likesCount: 89, tags: ["Minimalist", "Calm"] },
    { id: "3", title: "Urban Jungle", username: "StreetLens", imageURL: "https://images.pexels.com/photos/20967/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=600", likesCount: 256, tags: ["Photography", "City"] },
    { id: "4", title: "Midnight Echo", username: "AbstractSoul", imageURL: "https://images.pexels.com/photos/2471234/pexels-photo-2471234.jpeg?auto=compress&cs=tinysrgb&w=600", likesCount: 67, tags: ["Abstract", "Dark"] },
  ];

  const latestUploads = PlaceHolderImages.filter(img => img.id.startsWith("art-")).slice(0, 8);

  return (
    <div className="flex flex-col gap-16 pb-16">
      {/* Hero Section */}
      <section className="relative h-[85vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image 
            src="https://images.pexels.com/photos/1585325/pexels-photo-1585325.jpeg?auto=compress&cs=tinysrgb&w=1200" 
            alt="Hero Background" 
            fill
            className="object-cover opacity-70"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/40 to-background" />
        </div>
        
        <div className="container relative z-10 px-4 text-center space-y-8 max-w-4xl">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/80 backdrop-blur-md text-accent border border-accent/20 text-sm font-bold shadow-sm">
            <Sparkles size={16} />
            <span>Artistic Vision Unleashed</span>
          </div>
          <h1 className="font-headline font-bold text-5xl md:text-7xl lg:text-8xl tracking-tight leading-none">
            Your vision, <br />
            <span className="text-accent">digitally mastered.</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto font-medium">
            Join the global community of creatives. Explore breathtaking artwork, share your own masterpieces, and find inspiration.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href={user ? "/create" : "/signup"}>
              <Button size="lg" className="bg-accent text-white hover:bg-accent/90 px-10 text-lg h-14 rounded-full shadow-xl shadow-accent/20">
                {user ? "Enter Studio" : "Get Started"} <ArrowRight size={20} className="ml-2" />
              </Button>
            </Link>
            <Link href="/explore">
              <Button size="lg" variant="outline" className="px-10 text-lg h-14 rounded-full bg-white/50 border-primary/20 hover:bg-white transition-all">
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
            <h2 className="font-headline font-bold text-3xl">Curated Excellence</h2>
            <p className="text-muted-foreground">Handpicked favorites from our creative community.</p>
          </div>
          <Link href="/explore">
            <Button variant="ghost" className="text-accent font-bold gap-2">
              Explore All <ArrowRight size={16} />
            </Button>
          </Link>
        </div>
        
        <div className="artwork-grid">
          {featuredArtworks.map((artwork) => (
            <ArtworkCard key={artwork.id} {...artwork} />
          ))}
        </div>
      </section>

      {/* Latest Section */}
      <section className="container mx-auto px-4 space-y-12 bg-white/40 py-16 rounded-[3rem] border shadow-sm">
        <div className="text-center space-y-2">
          <h2 className="font-headline font-bold text-3xl">Recent Inspirations</h2>
          <p className="text-muted-foreground">Fresh perspectives from artists around the globe.</p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {latestUploads.map((art) => (
            <Link key={art.id} href="/explore" className="group relative aspect-square bg-white rounded-2xl overflow-hidden shadow-sm transition-all hover:shadow-xl">
               <Image 
                 src={art.imageUrl} 
                 alt={art.description} 
                 fill
                 className="object-cover group-hover:scale-110 transition-transform duration-700"
                 sizes="(max-width: 768px) 50vw, 25vw"
               />
               <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                  <span className="text-white font-bold text-sm truncate">{art.description}</span>
                  <span className="text-white/70 text-xs">@creative_mind</span>
               </div>
            </Link>
          ))}
        </div>
        <div className="text-center pt-8">
           <Link href="/explore">
              <Button variant="outline" size="lg" className="rounded-full px-12 border-primary/30 h-14 text-lg">
                View Full Gallery
              </Button>
           </Link>
        </div>
      </section>
    </div>
  );
}
