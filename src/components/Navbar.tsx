
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
  Home, 
  Menu,
  LayoutGrid,
  Wand2
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
    { label: "Gallery", href: "/", icon: <Home size={18} /> },
    { label: "Explore", href: "/explore", icon: <LayoutGrid size={18} /> },
    ...(user ? [
      { label: "Studio", href: "/create", icon: <Wand2 size={18} /> },
      { label: "Upload", href: "/upload", icon: <Upload size={18} /> },
    ] : []),
  ];

  const profileHref = profile?.username ? `/profile/${profile.username}` : user?.uid ? `/profile/${user.uid}` : "#";

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-lg">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="p-2 bg-accent rounded-2xl text-white group-hover:rotate-12 transition-all shadow-lg shadow-accent/20">
              <Palette size={24} />
            </div>
            <span className="font-headline font-bold text-2xl tracking-tighter hidden sm:block">ColorCanvas</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8 font-bold">
          {navItems.map((item) => (
            <Link 
              key={item.href} 
              href={item.href} 
              className="hover:text-accent transition-colors flex items-center gap-2 text-sm uppercase tracking-widest"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <Link href={profileHref}>
                <Button variant="ghost" className="flex items-center gap-3 px-3 hover:bg-accent/5 h-12 rounded-2xl group border">
                  <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center overflow-hidden border-2 border-white shadow-sm group-hover:scale-105 transition-transform">
                    {profile?.profileImage ? (
                      <img src={profile.profileImage} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <User size={18} />
                    )}
                  </div>
                  <span className="hidden lg:inline-block max-w-[120px] truncate text-xs font-bold uppercase tracking-widest">@{profile?.username || "Artist"}</span>
                </Button>
              </Link>
              
              <Button onClick={handleLogout} variant="ghost" size="icon" className="hidden sm:flex rounded-2xl text-muted-foreground hover:text-accent hover:bg-accent/5 border h-12 w-12">
                <LogOut size={20} />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/login" className="hidden sm:block">
                <Button variant="ghost" className="font-bold uppercase tracking-widest text-sm">Login</Button>
              </Link>
              <Link href="/signup">
                <Button className="bg-accent text-white hover:bg-accent/90 rounded-full px-8 h-12 font-bold uppercase tracking-widest text-xs shadow-lg shadow-accent/20">Join Now</Button>
              </Link>
            </div>
          )}

          {/* Mobile Hamburger Menu */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-2xl h-12 w-12 border">
                  <Menu size={24} />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[320px] sm:w-[400px] rounded-l-[3rem]">
                <SheetHeader className="text-left border-b pb-6 mb-8">
                  <SheetTitle className="flex items-center gap-3 text-2xl font-headline">
                    <div className="p-2 bg-accent rounded-xl text-white">
                      <Palette size={24} />
                    </div>
                    ColorCanvas
                  </SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-4">
                  {navItems.map((item) => (
                    <Link 
                      key={item.href} 
                      href={item.href} 
                      className="flex items-center gap-4 p-4 rounded-3xl hover:bg-accent/5 transition-all font-bold text-lg"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-accent shadow-inner">
                        {item.icon}
                      </div>
                      {item.label}
                    </Link>
                  ))}
                  {user && (
                    <>
                      <Link 
                        href={profileHref}
                        className="flex items-center gap-4 p-4 rounded-3xl hover:bg-accent/5 transition-all font-bold text-lg"
                      >
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-accent shadow-inner">
                          <User size={24} />
                        </div>
                        Artist Profile
                      </Link>
                      <div className="pt-8 border-t mt-8">
                        <button 
                          onClick={handleLogout}
                          className="flex items-center gap-4 p-4 w-full text-left rounded-3xl hover:bg-accent/5 text-accent transition-all font-bold text-lg"
                        >
                          <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center">
                            <LogOut size={24} />
                          </div>
                          Sign Out
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
