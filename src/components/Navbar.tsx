
"use client";

import Link from "next/link";
import { useAuth as useAuthContext } from "@/context/AuthContext";
import { useAuth } from "@/firebase";
import { signOut } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { 
  Palette, 
  LogOut, 
  User, 
  Upload, 
  Search, 
  Home, 
  Wand2, 
  Menu,
  Sparkles,
  LayoutGrid
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function Navbar() {
  const { user, profile } = useAuthContext();
  const auth = useAuth();

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout error", error);
    }
  };

  const navItems = [
    { label: "Home", href: "/", icon: <Home size={18} /> },
    { label: "Explore", href: "/explore", icon: <LayoutGrid size={18} /> },
    ...(user ? [
      { label: "AI Studio", href: "/create", icon: <Wand2 size={18} /> },
      { label: "Upload Work", href: "/upload", icon: <Upload size={18} /> },
    ] : []),
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="p-1.5 bg-accent rounded-lg text-white group-hover:scale-110 transition-transform">
              <Palette size={20} />
            </div>
            <span className="font-headline font-bold text-xl tracking-tight">ColorCanvas</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8 font-medium">
          {navItems.map((item) => (
            <Link 
              key={item.href} 
              href={item.href} 
              className="hover:text-accent transition-colors flex items-center gap-2 text-sm"
            >
              {item.icon} {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <div className="flex items-center gap-2">
              <Link href={`/profile/${profile?.username || user.uid}`}>
                <Button variant="ghost" className="flex items-center gap-2 px-2 hover:bg-accent/10 h-10">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center overflow-hidden border">
                    {profile?.profileImage ? (
                      <img src={profile.profileImage} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <User size={16} />
                    )}
                  </div>
                  <span className="hidden lg:inline-block max-w-[100px] truncate text-xs font-bold">@{profile?.username || "Profile"}</span>
                </Button>
              </Link>
              
              <Button onClick={handleLogout} variant="ghost" size="icon" className="hidden sm:flex rounded-full text-muted-foreground hover:text-destructive">
                <LogOut size={18} />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login" className="hidden sm:block">
                <Button variant="ghost">Login</Button>
              </Link>
              <Link href="/signup">
                <Button className="bg-accent text-white hover:bg-accent/90 rounded-full px-6">Join</Button>
              </Link>
            </div>
          )}

          {/* Mobile Hamburger Menu */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Menu size={24} />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <SheetHeader className="text-left border-b pb-4 mb-6">
                  <SheetTitle className="flex items-center gap-2">
                    <Palette className="text-accent" /> ColorCanvas
                  </SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-4">
                  {navItems.map((item) => (
                    <Link 
                      key={item.href} 
                      href={item.href} 
                      className="flex items-center gap-4 p-3 rounded-2xl hover:bg-accent/5 transition-colors font-medium text-lg"
                    >
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-accent">
                        {item.icon}
                      </div>
                      {item.label}
                    </Link>
                  ))}
                  {user && (
                    <>
                      <Link 
                        href={`/profile/${profile?.username || user.uid}`}
                        className="flex items-center gap-4 p-3 rounded-2xl hover:bg-accent/5 transition-colors font-medium text-lg"
                      >
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-accent">
                          <User size={20} />
                        </div>
                        My Profile
                      </Link>
                      <div className="pt-4 border-t mt-4">
                        <button 
                          onClick={handleLogout}
                          className="flex items-center gap-4 p-3 w-full text-left rounded-2xl hover:bg-destructive/5 text-destructive transition-colors font-medium text-lg"
                        >
                          <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
                            <LogOut size={20} />
                          </div>
                          Logout
                        </button>
                      </div>
                    </>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
