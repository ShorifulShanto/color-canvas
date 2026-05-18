
"use client";

import { useState, useEffect, useMemo, use } from "react";
import { useAuth } from "@/context/AuthContext";
import { useFirestore, useCollection, useMemoFirebase, useUser } from "@/firebase";
import { Button } from "@/components/ui/button";
import { ArtworkCard } from "@/components/ArtworkCard";
import { User as UserIcon, Edit2, Grid, Heart, MapPin, Loader2, BarChart3, Sparkles, Check, X, Trash2, AlertTriangle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { collection, query, where, getDocs, doc, getDoc, updateDoc, writeBatch } from "firebase/firestore";
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
  const { user: currentUser } = useUser();
  const { profile: currentProfile } = useAuth();
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
        
        // 1. First check if it's a direct UID
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

        // 2. Then check if it's a username (Usernames are stored lowercase)
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
          setTargetProfile(null);
        }
      } catch (error) {
        console.error("Profile fetch error:", error);
        setTargetProfile(null);
      } finally {
        setLoading(false);
      }
    }
    
    fetchTargetProfile();
  }, [usernameParam, db]);

  // Query works strictly by the internal userId for stability and real-time "stacking"
  const postsQuery = useMemoFirebase(() => {
    if (!db || !targetProfile?.id) return null;
    return query(
      collection(db, "posts"),
      where("userId", "==", targetProfile.id)
    );
  }, [db, targetProfile?.id]);

  const { data: userPosts = [], isLoading: postsLoading } = useCollection(postsQuery);

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
        username: editUsername.toLowerCase().trim().replace(/\s+/g, '_'),
        bio: editBio,
        profileImage: editImage,
      };
      await updateDoc(userDocRef, updatedData);
      setTargetProfile({ ...targetProfile, ...updatedData });
      setIsEditDialogOpen(false);
      toast({ title: "Profile updated!", description: "Your artist identity has been refreshed." });
    } catch (error: any) {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetGallery = async () => {
    if (!db || !currentUser) return;
    if (!confirm("Are you sure? This will delete all your masterpieces from the community forever!")) return;
    
    setIsSaving(true);
    try {
      const q = query(collection(db, "posts"), where("userId", "==", currentUser.uid));
      const snap = await getDocs(q);
      const batch = writeBatch(db);
      
      snap.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });
      
      await batch.commit();
      toast({ title: "Fresh Start!", description: "All your uploads have been removed." });
    } catch (error: any) {
      toast({ title: "Reset failed", description: error.message, variant: "destructive" });
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

  if (!targetProfile) {
    return (
      <div className="container mx-auto px-4 py-32 text-center space-y-6">
        <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-muted-foreground">
          <X size={48} />
        </div>
        <h1 className="text-3xl font-headline font-bold">Artist Not Found</h1>
        <p className="text-muted-foreground max-w-md mx-auto">The gallery you are looking for is unavailable or has been moved.</p>
        <Button onClick={() => window.location.href = "/"} variant="outline" className="rounded-full px-8">Back Home</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 space-y-12 min-h-screen">
      <div className="bg-white/60 backdrop-blur-md rounded-[3rem] p-8 md:p-12 border shadow-sm space-y-8">
        <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
          <div className="relative">
            <div className="w-32 h-32 md:w-48 md:h-48 rounded-[2.5rem] bg-primary border-4 border-white overflow-hidden shadow-2xl flex items-center justify-center bg-gradient-to-br from-primary to-accent/20">
               {(targetProfile?.profileImage || targetProfile?.profileImageUrl) ? (
                 <Image src={targetProfile.profileImage || targetProfile.profileImageUrl} alt="Avatar" width={192} height={192} className="object-cover" />
               ) : (
                 <UserIcon size={64} className="text-white/50" />
               )}
            </div>
            {isOwnProfile && (
              <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="icon" className="absolute -bottom-2 -right-2 h-12 w-12 rounded-2xl bg-accent text-white shadow-xl hover:scale-110 transition-transform">
                    <Edit2 size={20} />
                  </Button>
                </DialogTrigger>
                <DialogContent className="rounded-3xl max-w-md">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-headline">Edit Your Profile</DialogTitle>
                    <DialogDescription>Define your creative identity for the world to see.</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-6 py-6">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Username</Label>
                      <Input value={editUsername} onChange={(e) => setEditUsername(e.target.value)} placeholder="creative_artist" className="h-12 rounded-xl" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Profile Image URL</Label>
                      <Input value={editImage} onChange={(e) => setEditImage(e.target.value)} placeholder="https://unsplash.com/photo-..." className="h-12 rounded-xl" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Short Bio</Label>
                      <Textarea value={editBio} onChange={(e) => setEditBio(e.target.value)} className="resize-none min-h-[100px] rounded-xl" placeholder="Tell your story..." />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleUpdateProfile} disabled={isSaving} className="w-full h-14 rounded-full bg-accent text-white text-lg font-bold shadow-lg">
                      {isSaving ? <Loader2 className="animate-spin" /> : <Check className="mr-2" size={20} />}
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
                <h1 className="font-headline font-bold text-4xl md:text-5xl">@{targetProfile?.username || "Artist"}</h1>
                <p className="text-muted-foreground flex items-center gap-1 mt-2 text-lg">
                  <MapPin size={18} className="text-accent" /> Creative Studio
                </p>
              </div>
              <div className="flex gap-3">
                {isOwnProfile && (
                  <Button 
                    variant="destructive" 
                    onClick={handleResetGallery}
                    className="rounded-full px-6 h-14 font-bold gap-2"
                  >
                    <Trash2 size={18} /> Fresh Start
                  </Button>
                )}
                {!isOwnProfile && (
                  <Button 
                    onClick={() => setIsFollowing(!isFollowing)}
                    variant={isFollowing ? "outline" : "default"}
                    className={`${!isFollowing ? "bg-accent text-white hover:bg-accent/90" : ""} rounded-full px-10 h-14 text-lg font-bold shadow-xl transition-all`}
                  >
                    {isFollowing ? "Following" : "Follow Artist"}
                  </Button>
                )}
              </div>
            </div>
            
            <p className="text-xl max-w-3xl leading-relaxed text-foreground/80 italic">
              "{targetProfile?.bio || "Exploring the boundaries of digital and traditional art."}"
            </p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-8">
          <Tabs defaultValue="artworks" className="w-full space-y-8">
            <TabsList className="bg-white/80 p-1.5 rounded-full h-14 shadow-sm border inline-flex">
              <TabsTrigger value="artworks" className="rounded-full px-10 h-11 flex items-center gap-2 data-[state=active]:bg-accent data-[state=active]:text-white font-bold transition-all">
                <Grid size={20} /> My Gallery
              </TabsTrigger>
              <TabsTrigger value="liked" className="rounded-full px-10 h-11 flex items-center gap-2 data-[state=active]:bg-accent data-[state=active]:text-white font-bold transition-all">
                <Heart size={20} /> Liked
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="artworks" className="space-y-8 outline-none animate-in fade-in slide-in-from-bottom-2">
              <div className="flex items-center gap-2">
                <Sparkles size={24} className="text-accent" />
                <h2 className="font-headline font-bold text-3xl">Masterpieces</h2>
              </div>
              
              {postsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {[1, 2, 3, 4].map(i => <div key={i} className="aspect-[4/5] bg-white/40 rounded-[3rem] animate-pulse" />)}
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
                <div className="py-24 text-center space-y-6 bg-white/40 rounded-[3rem] border-2 border-dashed border-primary/30">
                  <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-muted-foreground">
                    <Grid size={40} />
                  </div>
                  <div className="space-y-2">
                    <p className="text-2xl font-bold">No artworks shared yet</p>
                    <p className="text-muted-foreground max-w-sm mx-auto">Start your next vision and share it with the community!</p>
                  </div>
                  {isOwnProfile && (
                    <Button onClick={() => window.location.href = "/upload"} className="rounded-full bg-accent text-white px-8 h-12 shadow-lg">
                      Upload Your First Work
                    </Button>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="liked" className="outline-none">
              <div className="py-24 text-center space-y-6 bg-white/40 rounded-[3rem] border-2 border-dashed border-primary/30">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-muted-foreground">
                  <Heart size={40} />
                </div>
                <div className="space-y-2">
                  <p className="text-2xl font-bold">No liked works yet</p>
                  <p className="text-muted-foreground">Explore the discovery portal and spread some creative love!</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-8">
          <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm space-y-6">
            <h3 className="font-bold flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
              <BarChart3 size={20} className="text-accent" /> Creation Momentum
            </h3>
            <div className="h-[250px] w-full">
              {activityData.length > 0 ? (
                <ChartContainer config={chartConfig}>
                  <BarChart data={activityData}>
                    <XAxis dataKey="date" hide />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="count" fill="var(--color-count)" radius={8} />
                  </BarChart>
                </ChartContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground text-sm italic border-2 border-dashed rounded-[2rem]">
                  Not enough activity data.
                </div>
              )}
            </div>
            <p className="text-sm text-muted-foreground text-center">Your artistic productivity over the last few sessions.</p>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm">
             <div className="flex gap-4 text-center">
               <div className="flex-1 space-y-1">
                 <span className="block font-bold text-3xl">{sortedPosts.length}</span>
                 <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Creations</span>
               </div>
               <div className="flex-1 border-x space-y-1">
                 <span className="block font-bold text-3xl">0</span>
                 <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Fans</span>
               </div>
               <div className="flex-1 space-y-1">
                 <span className="block font-bold text-3xl">0</span>
                 <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Inspiring</span>
               </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
