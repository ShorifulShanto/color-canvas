
"use client";

import { useState, useEffect, useMemo, use } from "react";
import { useAuth } from "@/context/AuthContext";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { Button } from "@/components/ui/button";
import { ArtworkCard } from "@/components/ArtworkCard";
import { User as UserIcon, Edit2, Grid, Heart, MapPin, Loader2, BarChart3, Sparkles, Check, X } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { collection, query, where, getDocs, doc, getDoc, updateDoc, orderBy } from "firebase/firestore";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Bar, BarChart, XAxis } from "recharts";

export default function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username: rawUsername } = use(params);
  const usernameParam = decodeURIComponent(rawUsername).trim(); 
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const db = useFirestore();
  
  const [targetProfile, setTargetProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  
  // Edit Profile State
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editUsername, setEditUsername] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editImage, setEditImage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!db || !usernameParam) return;
    
    async function fetchTargetProfile() {
      setLoading(true);
      try {
        const usersRef = collection(db, "users");
        
        // 1. Try Document ID lookup (UID lookup)
        const docRef = doc(db, "users", usernameParam);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = { id: docSnap.id, ...docSnap.data() };
          setTargetProfile(data);
          setEditUsername(data.username || "");
          setEditBio(data.bio || "");
          setEditImage(data.profileImage || data.profileImageUrl || "");
          setLoading(false);
          return;
        }

        // 2. Try Username Field lookup (Lowercase)
        const q = query(usersRef, where("username", "==", usernameParam.toLowerCase()));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const profileDoc = querySnapshot.docs[0];
          const data = { id: profileDoc.id, ...profileDoc.data() };
          setTargetProfile(data);
          setEditUsername(data.username || "");
          setEditBio(data.bio || "");
          setEditImage(data.profileImage || data.profileImageUrl || "");
        } else {
          // If viewing own profile by username link but it's not indexed yet
          if (currentUser && (usernameParam.toLowerCase() === currentUser.uid.toLowerCase())) {
             // Handle UID case mismatch in URL
             const selfRef = doc(db, "users", currentUser.uid);
             const selfSnap = await getDoc(selfRef);
             if (selfSnap.exists()) {
                const data = { id: selfSnap.id, ...selfSnap.data() };
                setTargetProfile(data);
             }
          } else {
            toast({ title: "Artist not found", description: "The gallery for this artist is currently unavailable.", variant: "destructive" });
          }
        }
      } catch (error) {
        console.error("Profile lookup error:", error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchTargetProfile();
  }, [usernameParam, db, toast, currentUser]);

  // Stable query for artworks - Critical for stacking
  const postsQuery = useMemoFirebase(() => {
    if (!db || !targetProfile?.id) return null;
    // We query by userId to ensure all works by this specific UID are "stacked"
    return query(
      collection(db, "posts"),
      where("userId", "==", targetProfile.id)
    );
  }, [db, targetProfile?.id]);

  const { data: userPosts = [], isLoading: postsLoading } = useCollection(postsQuery);

  // Client-side sorting ensures latest works appear top even without complex indexes
  const sortedPosts = useMemo(() => {
    if (!userPosts) return [];
    return [...userPosts].sort((a, b) => {
      const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt || 0);
      const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt || 0);
      return dateB.getTime() - dateA.getTime();
    });
  }, [userPosts]);

  const isOwnProfile = currentUser?.uid === targetProfile?.id;

  const handleUpdateProfile = async () => {
    if (!db || !currentUser || !targetProfile) return;
    setIsSaving(true);
    try {
      const userDocRef = doc(db, "users", currentUser.uid);
      const updatedData = {
        username: editUsername.toLowerCase().trim(),
        bio: editBio,
        profileImage: editImage,
      };
      await updateDoc(userDocRef, updatedData);
      setTargetProfile({ ...targetProfile, ...updatedData });
      setIsEditDialogOpen(false);
      toast({ title: "Profile updated!", description: "Your creative identity has been refreshed." });
    } catch (error: any) {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const activityData = useMemo(() => {
    const counts: Record<string, number> = {};
    sortedPosts.forEach(post => {
      if (!post.createdAt) return;
      const dateObj = typeof post.createdAt.toDate === 'function' ? post.createdAt.toDate() : new Date(post.createdAt);
      const date = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      counts[date] = (counts[date] || 0) + 1;
    });
    return Object.entries(counts).map(([date, count]) => ({ date, count })).slice(-7);
  }, [sortedPosts]);

  const chartConfig = {
    count: { label: "Artworks", color: "hsl(var(--accent))" }
  } satisfies ChartConfig;

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-accent" size={32} /></div>;

  return (
    <div className="container mx-auto px-4 py-12 space-y-12 min-h-screen">
      <div className="bg-white/60 backdrop-blur-md rounded-3xl p-8 border shadow-sm space-y-8">
        <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
          <div className="relative group">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-primary border-4 border-white overflow-hidden shadow-xl flex items-center justify-center">
               {(targetProfile?.profileImage || targetProfile?.profileImageUrl) ? (
                 <Image src={targetProfile.profileImage || targetProfile.profileImageUrl} alt="Avatar" width={160} height={160} className="object-cover" />
               ) : (
                 <UserIcon size={64} className="text-white/50" />
               )}
            </div>
            {isOwnProfile && (
              <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="icon" className="absolute bottom-2 right-2 rounded-full bg-accent text-white shadow-lg hover:scale-110 transition-transform">
                    <Edit2 size={16} />
                  </Button>
                </DialogTrigger>
                <DialogContent className="rounded-3xl max-w-md">
                  <DialogHeader>
                    <DialogTitle>Edit Your Identity</DialogTitle>
                    <DialogDescription>Your username is how others find your gallery.</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Username</Label>
                      <Input value={editUsername} onChange={(e) => setEditUsername(e.target.value)} placeholder="artist_name" />
                    </div>
                    <div className="space-y-2">
                      <Label>Profile Image URL</Label>
                      <Input value={editImage} onChange={(e) => setEditImage(e.target.value)} placeholder="https://..." />
                    </div>
                    <div className="space-y-2">
                      <Label>Bio</Label>
                      <Textarea value={editBio} onChange={(e) => setEditBio(e.target.value)} className="resize-none" />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleUpdateProfile} disabled={isSaving} className="w-full rounded-full bg-accent text-white">
                      {isSaving ? <Loader2 className="animate-spin" /> : <Check className="mr-2" size={18} />}
                      Save Profile
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
          
          <div className="space-y-4 flex-grow">
            <div className="flex flex-wrap items-center gap-4 justify-between">
              <div>
                <h1 className="font-headline font-bold text-3xl md:text-4xl">@{targetProfile?.username || "Artist"}</h1>
                <p className="text-muted-foreground flex items-center gap-1 mt-1">
                  <MapPin size={14} /> Creative Studio
                </p>
              </div>
              {!isOwnProfile && (
                <Button 
                  onClick={() => setIsFollowing(!isFollowing)}
                  variant={isFollowing ? "outline" : "default"}
                  className={`${!isFollowing ? "bg-accent text-white hover:bg-accent/90" : ""} rounded-full px-8 shadow-md`}
                >
                  {isFollowing ? "Following" : "Follow Artist"}
                </Button>
              )}
            </div>
            
            <p className="text-lg max-w-2xl leading-relaxed text-foreground/80">
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
                <Grid size={18} /> My Art
              </TabsTrigger>
              <TabsTrigger value="liked" className="rounded-full px-8 flex items-center gap-2 data-[state=active]:bg-accent data-[state=active]:text-white">
                <Heart size={18} /> Liked
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="artworks" className="space-y-8 outline-none">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles size={20} className="text-accent" />
                <h2 className="font-headline font-bold text-2xl">My Masterpieces</h2>
              </div>
              
              {postsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {[1, 2].map(i => <div key={i} className="aspect-[4/5] bg-white rounded-3xl animate-pulse" />)}
                </div>
              ) : sortedPosts.length > 0 ? (
                <div className="artwork-grid">
                  {sortedPosts.map(art => (
                    <ArtworkCard 
                      key={art.id} 
                      id={art.id}
                      imageURL={art.imageUrl || art.imageURL}
                      title={art.title}
                      username={art.username}
                      likesCount={art.likesCount || 0}
                      tags={art.tags}
                      showDelete={isOwnProfile}
                    />
                  ))}
                </div>
              ) : (
                <div className="col-span-full py-20 text-center space-y-4 bg-white/40 rounded-[3rem] border border-dashed border-primary/40">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-muted-foreground">
                    <Grid size={32} />
                  </div>
                  <div className="italic text-muted-foreground px-6">
                    <p className="text-lg font-medium">No artworks shared yet.</p>
                    <p className="text-sm">Start your next vision in the Studio and share it with the world!</p>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="liked" className="outline-none">
              <div className="py-20 text-center space-y-4 bg-white/40 rounded-[3rem] border border-dashed border-primary/40">
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
                 <span className="block font-bold text-2xl">{sortedPosts.length}</span>
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
