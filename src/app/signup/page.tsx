
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useAuth, useFirestore, useAuth as useFirebaseInstance } from "@/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Palette, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function SignupPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loadingAction, setLoadingAction] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { user, loading } = useAuth();
  const auth = useFirebaseInstance();
  const db = useFirestore();

  useEffect(() => {
    if (!loading && user) {
      router.push("/");
    }
  }, [user, loading, router]);

  if (loading) return null;

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (username.length < 3) {
      toast({ title: "Invalid username", description: "Username must be at least 3 characters.", variant: "destructive" });
      return;
    }
    setLoadingAction(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const newUser = userCredential.user;

      const userDocRef = doc(db, "users", newUser.uid);
      const userData = {
        username: username.toLowerCase().trim().replace(/\s+/g, '_'),
        email,
        profileImage: "",
        bio: "New creator on ColorCanvas!",
        generationCount: 0,
        createdAt: serverTimestamp(),
      };

      await setDoc(userDocRef, userData);
      
      toast({ title: "Account created!", description: "Welcome to the creative community." });
    } catch (error: any) {
      toast({ title: "Signup failed", description: error.message, variant: "destructive" });
      setLoadingAction(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white/80 backdrop-blur-md">
        <CardHeader className="space-y-4 pt-12 text-center">
          <div className="flex justify-center">
            <div className="p-4 bg-accent rounded-3xl text-white shadow-xl shadow-accent/20">
              <Palette size={40} />
            </div>
          </div>
          <div className="space-y-2">
            <CardTitle className="font-headline text-4xl font-bold">Join ColorCanvas</CardTitle>
            <CardDescription className="text-lg">Start your journey into the world of creative arts</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Username</Label>
              <Input 
                id="username" 
                placeholder="creative_artist" 
                required 
                className="h-14 border-primary/20 rounded-2xl bg-white shadow-sm px-6"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Email Address</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="name@example.com" 
                required 
                className="h-14 border-primary/20 rounded-2xl bg-white shadow-sm px-6"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Password</Label>
              <Input 
                id="password" 
                type="password" 
                placeholder="Secure password"
                required 
                className="h-14 border-primary/20 rounded-2xl bg-white shadow-sm px-6"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button 
              type="submit" 
              className="w-full h-16 text-xl bg-accent text-white hover:bg-accent/90 rounded-full font-bold shadow-xl transition-all"
              disabled={loadingAction}
            >
              {loadingAction ? <Loader2 size={24} className="animate-spin" /> : "Create Artist Account"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="pb-12 pt-6 flex justify-center border-t border-primary/10">
          <p className="text-muted-foreground">
            Already have an account? <Link href="/login" className="text-accent font-bold hover:underline">Sign In</Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
