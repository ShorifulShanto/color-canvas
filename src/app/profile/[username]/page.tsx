
"use client";

import { useState, useEffect, useMemo, use } from "react";
import { useAuth } from "@/context/AuthContext";
import { useFirestore } from "@/firebase";
import { Button } from "@/components/ui/button";
import { ArtworkCard } from "@/components/ArtworkCard";
import { User as UserIcon, Settings, Edit2, Grid, Heart, MapPin, Loader2, BarChart3, Sparkles } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { collection, query, where, getDocs, onSnapshot, doc, getDoc } from "firebase/firestore";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Bar, BarChart, XAxis } from "recharts";

export default function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username: rawUsername } = use(params);
  const usernameParam = rawUsername?.toLowerCase();
  const { user: currentUser, profile: currentProfile } = useAuth();
  const { toast } = useToast();
  const db = useFirestore();
  
  const [targetProfile, setTargetProfile] = useState<any>(null);
  const [userPosts, setUserPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  
  const isOwnProfile = currentProfile?.username === usernameParam || currentUser?.uid === usernameParam;

  useEffect(() => {
    if (!db || !usernameParam) return;
    
    let unsubscribePosts: (() => void) | undefined;

    async function fetchProfileAndSubscribe() {
      setLoading(true);
      try {
        const usersRef = collection(db, "users");
        
        // 1. First, try to find by username
        const q = query(usersRef, where("username", "==", usernameParam));
        const querySnapshot = await getDocs(q);
        
        let profileDoc = null;
        
        if (!querySnapshot.empty) {
          profileDoc = querySnapshot.docs[0];
        } else {
          // 2. Fallback: Check if the param is actually a User UID
          const docRef = doc(db, "users", usernameParam);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            profileDoc = docSnap;
          }
        }

        if (profileDoc) {
          const profileId = profileDoc.id;
          const profileData = { id: profileId, ...profileDoc.data() };
          setTargetProfile(profileData);
          
          // Subscribe to posts for this user
          const postsRef = collection(db, "posts");
          const postsQuery = query(
            postsRef, 
            where("userId", "==", profileId)
          );
          
          unsubscribePosts = onSnapshot(postsQuery, (snapshot) => {
            const posts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            // Manual sort for reliability
            const sortedPosts = posts.sort((a: any, b: any) => {
              const dateA = a.createdAt?.seconds || 0;
              const dateB = b.createdAt?.seconds || 0;
              return dateB - dateA;
            });
            setUserPosts(sortedPosts);
          }, (error) => {
            const permissionError = new FirestorePermissionError({
              path: 'posts',
              operation: 'list',
            });
            errorEmitter.emit('permission-error', permissionError);
          });
        } else {
          toast({ 
            title: "Artist not found", 
            description: "We couldn't locate this creator in our gallery.", 
            variant: "destructive" 
          });
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchProfileAndSubscribe();

    return () => {
      if (unsubscribePosts) unsubscribePosts();
    };
  }, [usernameParam, db, toast]);

  const activityData = useMemo(() => {
    const counts: Record<string, number> = {};
    userPosts.forEach(post => {
      if (!post.createdAt) return;
      const dateObj = typeof post.createdAt.toDate === 'function' ? post.createdAt.toDate() : new Date(post.createdAt);
      const date = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      counts[date] = (counts[date] || 0) + 1;
    });
    return Object.entries(counts).map(([date, count]) => ({ date, count })).slice(-7);
  }, [userPosts]);

  const handleFollow = () => {
    if (!currentUser) {
      toast({ title: "Login required", description: "You must be logged in to follow artists." });
      return;
    }
    setIsFollowing(!isFollowing);
    toast({ 
      title: isFollowing ? "Unfollowed" : "Following", 
      description: `You are ${isFollowing ? "no longer" : "now"} following @${targetProfile?.username}` 
    });
  };

  const chartConfig = {
    count: { label: "Artworks", color: "hsl(var(--accent))" }
  } satisfies ChartConfig;

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-accent" size={32} /></div>;

  return (
    <div className="container mx-auto px-4 py-12 space-y-12 min-h-screen">
      {/* Profile Header */}
      <div className="bg-white/60 backdrop-blur-md rounded-3xl p-8 border shadow-sm space-y-8">
        <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
          <div className="relative">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-primary border-4 border-white overflow-hidden shadow-xl flex items-center justify-center">
               {targetProfile?.profileImage ? (
                 <Image src={targetProfile.profileImage} alt="Avatar" width={160} height={160} className="object-cover" />
               ) : (
                 <UserIcon size={64} className="text-white/50" />
               )}
            </div>
            {isOwnProfile && (
              <div className="absolute bottom-2 right-2 p-2 bg-accent text-white rounded-full shadow-lg">
                <Edit2 size={16} />
              </div>
            )}
          </div>
          
          <div className="space-y-4 flex-grow">
            <div className="flex flex-wrap items-center gap-4 justify-between">
              <div>
                <h1 className="font-headline font-bold text-3xl md:text-4xl">@{targetProfile?.username || usernameParam}</h1>
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
                  <Button 
                    onClick={handleFollow}
                    variant={isFollowing ? "outline" : "default"}
                    className={`${!isFollowing ? "bg-accent text-white hover:bg-accent/90" : ""} rounded-full px-8 shadow-md`}
                  >
                    {isFollowing ? "Following" : "Follow Artist"}
                  </Button>
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
            <div className="flex items-center justify-between">
              <TabsList className="bg-white/80 p-1 rounded-full h-12 shadow-sm border">
                <TabsTrigger value="artworks" className="rounded-full px-8 flex items-center gap-2 data-[state=active]:bg-accent data-[state=active]:text-white">
                  <Grid size={18} /> My Art
                </TabsTrigger>
                <TabsTrigger value="liked" className="rounded-full px-8 flex items-center gap-2 data-[state=active]:bg-accent data-[state=active]:text-white">
                  <Heart size={18} /> Liked
                </TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="artworks" className="space-y-8">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles size={20} className="text-accent" />
                <h2 className="font-headline font-bold text-2xl">My Masterpieces</h2>
              </div>
              
              <div className="artwork-grid">
                {userPosts.map(art => (
                  <ArtworkCard 
                    key={art.id} 
                    id={art.id}
                    imageURL={art.imageUrl || art.imageURL}
                    title={art.title}
                    username={art.username}
                    likesCount={art.likesCount || 0}
                    tags={art.tags}
                  />
                ))}
                {userPosts.length === 0 && (
                  <div className="col-span-full py-20 text-center space-y-4">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-muted-foreground">
                      <Grid size={32} />
                    </div>
                    <div className="italic text-muted-foreground">
                      <p className="text-lg font-medium">No artworks shared yet.</p>
                      <p className="text-sm">Start your next vision in the AI Studio and share it with the world!</p>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="liked">
              <div className="py-20 text-center space-y-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-muted-foreground">
                  <Heart size={32} />
                </div>
                <div className="italic text-muted-foreground">
                  <p className="text-lg font-medium">No liked works yet.</p>
                  <p className="text-sm">Explore the discovery portal and spread some creative love!</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar Activity */}
        <div className="space-y-8">
          <div className="bg-white p-6 rounded-3xl border shadow-sm">
            <h3 className="font-bold mb-4 flex items-center gap-2 text-sm uppercase tracking-wider text-muted-foreground">
              <BarChart3 size={18} className="text-accent" /> Creation Activity
            </h3>
            <div className="h-[200px] w-full">
              {activityData.length > 0 ? (
                <ChartContainer config={chartConfig}>
                  <BarChart data={activityData}>
                    <XAxis dataKey="date" hide />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="count" fill="var(--color-count)" radius={4} />
                  </BarChart>
                </ChartContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground text-sm italic border-2 border-dashed rounded-2xl">
                  Not enough activity data.
                </div>
              )}
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
