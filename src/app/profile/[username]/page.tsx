
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { ArtworkCard } from "@/components/ArtworkCard";
import { User as UserIcon, Settings, Edit2, Grid, Heart, MapPin, Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { collection, query, where, getDocs, onSnapshot, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Image from "next/image";

export default function ProfilePage({ params }: { params: { username: string } }) {
  const { user: currentUser, profile: currentProfile } = useAuth();
  const [targetProfile, setTargetProfile] = useState<any>(null);
  const [userPosts, setUserPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const isOwnProfile = currentProfile?.username === params.username;

  useEffect(() => {
    async function fetchProfile() {
      setLoading(true);
      try {
        // Find user by username
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("username", "==", params.username));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const profileDoc = querySnapshot.docs[0];
          const profileData = { id: profileDoc.id, ...profileDoc.data() };
          setTargetProfile(profileData);
          
          // Subscribe to user's posts
          const postsRef = collection(db, "posts");
          const postsQuery = query(
            postsRef, 
            where("userId", "==", profileDoc.id),
            orderBy("createdAt", "desc")
          );
          
          const unsubscribe = onSnapshot(postsQuery, (snapshot) => {
            const posts = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }));
            setUserPosts(posts);
          });
          
          return () => unsubscribe();
        } else {
          setTargetProfile(null);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchProfile();
  }, [params.username]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin text-accent" size={48} />
      </div>
    );
  }

  if (!targetProfile) {
    return (
      <div className="container mx-auto px-4 py-32 text-center space-y-4">
        <h1 className="text-4xl font-bold font-headline">Artist not found</h1>
        <p className="text-muted-foreground">The creator @{params.username} does not exist in our studio.</p>
        <Button onClick={() => window.history.back()}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 space-y-12 min-h-screen">
      <div className="bg-white/40 backdrop-blur-sm rounded-3xl p-8 border shadow-sm space-y-8">
        <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
          <div className="relative group">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-primary border-4 border-white overflow-hidden shadow-xl flex items-center justify-center relative">
               {targetProfile.profileImage ? (
                 <Image src={targetProfile.profileImage} alt="Avatar" fill className="object-cover" />
               ) : (
                 <UserIcon size={64} className="text-white/50" />
               )}
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
                <h1 className="font-headline font-bold text-3xl md:text-4xl">@{targetProfile.username}</h1>
                <p className="text-muted-foreground flex items-center gap-1 mt-1">
                  <MapPin size={14} /> Creative Studio
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
                  <Button className="bg-accent text-white hover:bg-accent/90 rounded-full px-8 shadow-md">Follow Artist</Button>
                )}
              </div>
            </div>
            
            <p className="text-lg max-w-2xl leading-relaxed">
              {targetProfile.bio || "No bio available yet."}
            </p>
            
            <div className="flex gap-8 border-t pt-4">
               <div>
                  <span className="block font-bold text-xl">{userPosts.length}</span>
                  <span className="text-sm text-muted-foreground">Artworks</span>
               </div>
               <div>
                  <span className="block font-bold text-xl">0</span>
                  <span className="text-sm text-muted-foreground">Followers</span>
               </div>
               <div>
                  <span className="block font-bold text-xl">0</span>
                  <span className="text-sm text-muted-foreground">Following</span>
               </div>
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="artworks" className="w-full space-y-8">
        <div className="flex items-center justify-center">
          <TabsList className="bg-white/80 p-1 rounded-full h-12 shadow-sm border">
            <TabsTrigger value="artworks" className="rounded-full px-8 flex items-center gap-2 data-[state=active]:bg-accent data-[state=active]:text-white">
              <Grid size={18} /> Gallery
            </TabsTrigger>
            <TabsTrigger value="liked" className="rounded-full px-8 flex items-center gap-2 data-[state=active]:bg-accent data-[state=active]:text-white">
              <Heart size={18} /> Liked
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="artworks" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {userPosts.length > 0 ? (
            <div className="artwork-grid">
              {userPosts.map(art => (
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
            <div className="text-center py-20 bg-white/30 rounded-3xl border border-dashed flex flex-col items-center justify-center space-y-4">
              <Grid className="text-muted-foreground/30" size={48} />
              <p className="text-muted-foreground font-medium">No artworks shared by this artist yet.</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="liked">
          <div className="text-center py-20 bg-white/30 rounded-3xl border border-dashed flex flex-col items-center justify-center space-y-4">
            <Heart className="text-muted-foreground/30" size={48} />
            <p className="text-muted-foreground font-medium">This collection is currently private.</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
