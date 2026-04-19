"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Palette, LogOut, User, Upload, Search, Home, Wand2 } from "lucide-react";

export function Navbar() {
  const { user, profile } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout error", error);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="p-1.5 bg-accent rounded-lg text-white group-hover:scale-110 transition-transform">
            <Palette size={20} />
          </div>
          <span className="font-headline font-bold text-xl tracking-tight">ColorCanvas</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 font-medium">
          <Link href="/" className="hover:text-accent transition-colors flex items-center gap-1">
            <Home size={16} /> Home
          </Link>
          <Link href="/explore" className="hover:text-accent transition-colors flex items-center gap-1">
            <Search size={16} /> Explore
          </Link>
          {user && (
            <>
              <Link href="/create" className="hover:text-accent transition-colors flex items-center gap-1">
                <Wand2 size={16} /> Create
              </Link>
              <Link href="/upload" className="hover:text-accent transition-colors flex items-center gap-1">
                <Upload size={16} /> Upload
              </Link>
            </>
          )}
        </nav>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              <Link href={`/profile/${profile?.username || user.uid}`}>
                <Button variant="ghost" className="flex items-center gap-2 px-2 hover:bg-accent/10">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center overflow-hidden">
                    {profile?.profileImage ? (
                      <img src={profile.profileImage} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <User size={16} />
                    )}
                  </div>
                  <span className="hidden sm:inline-block max-w-[100px] truncate">{profile?.username || "Profile"}</span>
                </Button>
              </Link>
              <Button onClick={handleLogout} variant="outline" size="sm" className="hidden sm:flex gap-2">
                <LogOut size={16} /> Logout
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost">Login</Button>
              </Link>
              <Link href="/signup">
                <Button className="bg-accent text-white hover:bg-accent/90">Join Now</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
