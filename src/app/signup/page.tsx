"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
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
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (username.length < 3) {
      toast({ title: "Invalid username", description: "Username must be at least 3 characters.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Create profile in Firestore
      await setDoc(doc(db, "users", user.uid), {
        username,
        email,
        profileImage: "",
        bio: "New creator on ColorCanvas!",
        createdAt: serverTimestamp(),
      });

      toast({ title: "Account created!", description: "Welcome to the ColorCanvas community." });
      router.push("/");
    } catch (error: any) {
      toast({ title: "Signup failed", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md border-none shadow-2xl rounded-2xl overflow-hidden">
        <CardHeader className="space-y-4 pt-12 text-center">
          <div className="flex justify-center">
            <div className="p-3 bg-accent rounded-2xl text-white shadow-lg shadow-accent/20">
              <Palette size={32} />
            </div>
          </div>
          <div className="space-y-2">
            <CardTitle className="font-headline text-3xl font-bold">Join ColorCanvas</CardTitle>
            <CardDescription className="text-base">Start your journey into the world of creative arts</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input 
                id="username" 
                placeholder="creative_artist" 
                required 
                className="h-12 border-primary/30 rounded-lg focus-visible:ring-accent"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="name@example.com" 
                required 
                className="h-12 border-primary/30 rounded-lg focus-visible:ring-accent"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                placeholder="At least 6 characters"
                required 
                className="h-12 border-primary/30 rounded-lg focus-visible:ring-accent"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button 
              type="submit" 
              className="w-full h-12 text-lg bg-accent text-white hover:bg-accent/90 rounded-full"
              disabled={loading}
            >
              {loading ? <Loader2 size={20} className="animate-spin" /> : "Create Account"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="pb-12 pt-6 flex justify-center">
          <p className="text-muted-foreground">
            Already have an account? <Link href="/login" className="text-accent font-semibold hover:underline">Sign In</Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}