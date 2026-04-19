
"use client";

import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { ArtworkCard } from "@/components/ArtworkCard";
import { User, Settings, Edit2, Grid, Heart, MapPin } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ProfilePage({ params }: { params: { username: string } }) {
  const { user, profile } = useAuth();
  
  const isOwnProfile = profile?.username === params.username || user?.uid === params.username;

  const profileData = {
    username: params.username,
    bio: "Digital explorer & creator of abstract wonders. Capturing the beauty of the unseen.",
    location: "Stockholm, Sweden",
    joinedDate: "January 2024",
    followers: 1240,
    following: 450,
    artworks: [
      { id: "p1", title: "Midnight Echo", username: params.username, imageURL: "https://images.pexels.com/photos/2471234/pexels-photo-2471234.jpeg?auto=compress&cs=tinysrgb&w=600", likesCount: 45, tags: ["Abstract"] },
      { id: "p2", title: "Sunbeam", username: params.username, imageURL: "https://images.pexels.com/photos/1646953/pexels-photo-1646953.jpeg?auto=compress&cs=tinysrgb&w=600", likesCount: 12, tags: ["Warm"] },
      { id: "p3", title: "Glass City", username: params.username, imageURL: "https://images.pexels.com/photos/1103970/pexels-photo-1103970.jpeg?auto=compress&cs=tinysrgb&w=600", likesCount: 89, tags: ["Urban"] },
    ]
  };

  return (
    <div className="container mx-auto px-4 py-12 space-y-12 min-h-screen">
      {/* Profile Header */}
      <div className="bg-white/40 backdrop-blur-sm rounded-3xl p-8 border shadow-sm space-y-8">
        <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
          <div className="relative group">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-primary border-4 border-white overflow-hidden shadow-xl">
               <img src={`https://images.pexels.com/photos/1585325/pexels-photo-1585325.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop`} alt="Avatar" className="w-full h-full object-cover" />
            </div>
            {isOwnProfile && (
              <button className="absolute bottom-2 right-2 p-2 bg-accent text-white rounded-full shadow-lg hover:scale-110 transition-transform">
                <Edit2 size={16} />
              </button>
            )}
          </div>
          
          <div className="space-y-4 flex-grow">
            <div className="flex flex-wrap items-center gap-4 justify-between">
              <div>
                <h1 className="font-headline font-bold text-3xl md:text-4xl">@{profileData.username}</h1>
                <p className="text-muted-foreground flex items-center gap-1 mt-1">
                  <MapPin size={14} /> {profileData.location}
                </p>
              </div>
              <div className="flex gap-2">
                {isOwnProfile ? (
                  <>
                    <Button variant="outline" className="rounded-full px-6">Edit Profile</Button>
                    <Button variant="ghost" size="icon" className="rounded-full">
                      <Settings size={20} />
                    </Button>
                  </>
                ) : (
                  <Button className="bg-accent text-white hover:bg-accent/90 rounded-full px-8">Follow Artist</Button>
                )}
              </div>
            </div>
            
            <p className="text-lg max-w-2xl leading-relaxed">{profileData.bio}</p>
            
            <div className="flex gap-8 border-t pt-4">
               <div className="text-center md:text-left">
                  <span className="block font-bold text-xl">{profileData.artworks.length}</span>
                  <span className="text-sm text-muted-foreground">Artworks</span>
               </div>
               <div className="text-center md:text-left">
                  <span className="block font-bold text-xl">{profileData.followers}</span>
                  <span className="text-sm text-muted-foreground">Followers</span>
               </div>
               <div className="text-center md:text-left">
                  <span className="block font-bold text-xl">{profileData.following}</span>
                  <span className="text-sm text-muted-foreground">Following</span>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Content Tabs */}
      <Tabs defaultValue="artworks" className="w-full space-y-8">
        <div className="flex items-center justify-center">
          <TabsList className="bg-primary/10 p-1 rounded-full h-12">
            <TabsTrigger value="artworks" className="rounded-full px-8 flex items-center gap-2">
              <Grid size={18} /> Gallery
            </TabsTrigger>
            <TabsTrigger value="liked" className="rounded-full px-8 flex items-center gap-2">
              <Heart size={18} /> Liked
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="artworks" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {profileData.artworks.length > 0 ? (
            <div className="artwork-grid">
              {profileData.artworks.map(art => (
                <ArtworkCard key={art.id} {...art} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white/30 rounded-3xl border border-dashed">
              <p className="text-muted-foreground">No artworks shared yet.</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="liked">
          <div className="text-center py-20 bg-white/30 rounded-3xl border border-dashed">
            <p className="text-muted-foreground">This collection is currently private.</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
