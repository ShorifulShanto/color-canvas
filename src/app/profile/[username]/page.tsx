
"use client";

import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { ArtworkCard } from "@/components/ArtworkCard";
import { User as UserIcon, Settings, Edit2, Grid, Heart, MapPin, Loader2, BarChart3 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { collection, query, where, getDocs, onSnapshot, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Image from "next/image";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Bar, BarChart, XAxis, YAxis, ResponsiveContainer } from "recharts";

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
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("username", "==", params.username));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const profileDoc = querySnapshot.docs[0];
          const profileData = { id: profileDoc.id, ...profileDoc.data() };
          setTargetProfile(profileData);
          
          const postsRef = collection(db, "posts");
          const postsQuery = query(
            postsRef, 
            where("userId", "==", profileDoc.id),
            orderBy("createdAt", "desc")
          );
          
          const unsubscribe = onSnapshot(postsQuery, (snapshot) => {
            setUserPosts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
          });
          
          return () => unsubscribe();
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchProfile();
  }, [params.username]);

  const activityData = useMemo(() => {
    const counts: Record<string, number> = {};
    userPosts.forEach(post => {
      if (!post.createdAt) return;
      const date = post.createdAt.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      counts[date] = (counts[date] || 0) + 1;
    });
    return Object.entries(counts).map(([date, count]) => ({ date, count })).slice(-7);
  }, [userPosts]);

  const chartConfig = {
    count: { label: "Artworks", color: "hsl(var(--accent))" }
  } satisfies ChartConfig;

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-accent" /></div>;

  return (
    <div className="container mx-auto px-4 py-12 space-y-12 min-h-screen">
      <div className="bg-white/60 backdrop-blur-md rounded-3xl p-8 border shadow-sm space-y-8">
        <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
          <div className="relative">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-primary border-4 border-white overflow-hidden shadow-xl flex items-center justify-center">
               {targetProfile?.profileImage ? (
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
                <h1 className="font-headline font-bold text-3xl md:text-4xl">@{targetProfile?.username}</h1>
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
              {targetProfile?.bio || "Exploring the boundaries of digital and traditional art."}
            </p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Tabs defaultValue="artworks" className="w-full space-y-8">
            <TabsList className="bg-white/80 p-1 rounded-full h-12 shadow-sm border">
              <TabsTrigger value="artworks" className="rounded-full px-8 flex items-center gap-2 data-[state=active]:bg-accent data-[state=active]:text-white">
                <Grid size={18} /> Gallery
              </TabsTrigger>
              <TabsTrigger value="liked" className="rounded-full px-8 flex items-center gap-2 data-[state=active]:bg-accent data-[state=active]:text-white">
                <Heart size={18} /> Liked
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="artworks">
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
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-8">
          <div className="bg-white p-6 rounded-3xl border shadow-sm">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <BarChart3 size={18} className="text-accent" /> Creation Activity
            </h3>
            <div className="h-[200px] w-full">
              <ChartContainer config={chartConfig}>
                <BarChart data={activityData}>
                  <XAxis dataKey="date" hide />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" fill="var(--color-count)" radius={4} />
                </BarChart>
              </ChartContainer>
            </div>
            <p className="text-xs text-muted-foreground mt-4 text-center">Your artistic momentum over the last few uploads.</p>
          </div>

          <div className="bg-white p-6 rounded-3xl border shadow-sm flex flex-col items-center gap-4">
             <div className="flex gap-8 text-center w-full">
               <div className="flex-1">
                 <span className="block font-bold text-2xl">{userPosts.length}</span>
                 <span className="text-xs text-muted-foreground uppercase tracking-widest">Works</span>
               </div>
               <div className="flex-1 border-x">
                 <span className="block font-bold text-2xl">0</span>
                 <span className="text-xs text-muted-foreground uppercase tracking-widest">Followers</span>
               </div>
               <div className="flex-1">
                 <span className="block font-bold text-2xl">0</span>
                 <span className="text-xs text-muted-foreground uppercase tracking-widest">Following</span>
               </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
