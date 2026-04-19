"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Search, Download, Share2, Loader2, Wand2, ImageIcon } from "lucide-react";
import { generateArtwork } from "@/ai/flows/generate-artwork";
import { searchPexels, PexelsPhoto } from "@/lib/pexels";
import { useToast } from "@/hooks/use-toast";

export default function CreatePage() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [aiPrompt, setAiPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [pexelsResults, setPexelsResults] = useState<PexelsPhoto[]>([]);

  if (!user) {
    router.push("/login");
    return null;
  }

  const handleGenerate = async () => {
    if (!aiPrompt) return;
    setIsGenerating(true);
    setGeneratedImage(null);
    try {
      const result = await generateArtwork({ prompt: aiPrompt });
      setGeneratedImage(result.imageUrl);
      toast({ title: "Artwork Created!", description: "Your AI masterpiece is ready." });
    } catch (error) {
      toast({ title: "Generation failed", description: "Something went wrong with the AI studio.", variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery) return;
    setIsSearching(true);
    try {
      const results = await searchPexels(searchQuery);
      setPexelsResults(results);
      if (results.length === 0) {
        toast({ title: "No results", description: "Try different keywords for better luck." });
      }
    } catch (error) {
      toast({ title: "Search failed", description: "Unable to connect to discovery service.", variant: "destructive" });
    } finally {
      setIsSearching(false);
    }
  };

  const handleCaptureImage = (url: string) => {
    // Navigate to upload with the image pre-selected (via state/storage simulation)
    // For this prototype, we'll toast and mock the transfer
    toast({ 
      title: "Image Captured!", 
      description: "Redirecting to finalize your post...",
    });
    // In a real app, we'd pass the blob/url to the upload page
    router.push("/upload"); 
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl space-y-12">
      <div className="text-center space-y-4">
        <h1 className="font-headline font-bold text-4xl md:text-5xl">Creative Studio</h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Generate original AI drawings or discover curated artistic vision from the world's best creators.
        </p>
      </div>

      <Tabs defaultValue="ai" className="space-y-8">
        <div className="flex justify-center">
          <TabsList className="grid w-full max-w-md grid-cols-2 rounded-full h-12 p-1 bg-primary/10">
            <TabsTrigger value="ai" className="rounded-full flex items-center gap-2">
              <Wand2 size={18} /> AI Studio
            </TabsTrigger>
            <TabsTrigger value="discover" className="rounded-full flex items-center gap-2">
              <Search size={18} /> Art Discovery
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="ai" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid md:grid-cols-2 gap-8 items-start">
            <Card className="border-none shadow-xl bg-white/50 backdrop-blur-sm rounded-3xl">
              <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2">
                  <Sparkles className="text-accent" /> Describe Your Vision
                </CardTitle>
                <CardDescription>
                  Enter a detailed prompt to generate a unique digital drawing.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <textarea
                    placeholder="E.g., A minimalist drawing of a cat in a spacesuit floating over a neon Tokyo city skyline, digital art style..."
                    className="w-full min-h-[150px] p-4 rounded-2xl border-primary/20 bg-background focus:ring-2 focus:ring-accent outline-none resize-none transition-all"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                  />
                </div>
                <Button 
                  onClick={handleGenerate}
                  disabled={isGenerating || !aiPrompt}
                  className="w-full h-14 text-lg bg-accent text-white hover:bg-accent/90 rounded-full shadow-lg shadow-accent/20"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="animate-spin mr-2" /> 
                      Generating Masterpiece...
                    </>
                  ) : (
                    <>
                      <Wand2 className="mr-2" /> Generate Art
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <div className="aspect-square w-full rounded-3xl bg-primary/10 border-2 border-dashed border-primary/20 flex flex-col items-center justify-center relative overflow-hidden group">
              {generatedImage ? (
                <>
                  <img src={generatedImage} alt="Generated" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                    <Button onClick={() => handleCaptureImage(generatedImage)} className="bg-white text-black hover:bg-white/90 rounded-full px-6">
                      <Share2 size={18} className="mr-2" /> Post to Gallery
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center p-8 space-y-4 opacity-40">
                  <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
                    <ImageIcon size={40} />
                  </div>
                  <p className="text-lg font-medium">Your creation will appear here</p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="discover" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex gap-2 max-w-2xl mx-auto">
            <Input 
              placeholder="Search for art style, medium, or concept (e.g. 'oil painting', 'sketch')..."
              className="h-14 rounded-full pl-6 border-primary/30 focus-visible:ring-accent"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button 
              onClick={handleSearch}
              disabled={isSearching}
              className="h-14 w-14 rounded-full bg-accent text-white hover:bg-accent/90 p-0"
            >
              {isSearching ? <Loader2 size={24} className="animate-spin" /> : <Search size={24} />}
            </Button>
          </div>

          {pexelsResults.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {pexelsResults.map((photo) => (
                <div key={photo.id} className="group relative aspect-[3/4] rounded-2xl overflow-hidden bg-primary/10 transition-all hover:shadow-2xl hover:-translate-y-1">
                  <img 
                    src={photo.src.large} 
                    alt={photo.photographer} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4 gap-3">
                    <p className="text-white text-xs font-medium truncate">By {photo.photographer}</p>
                    <Button 
                      size="sm" 
                      variant="secondary" 
                      className="w-full rounded-full text-xs font-bold"
                      onClick={() => handleCaptureImage(photo.src.large2x)}
                    >
                      Capture Inspiration
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : !isSearching && (
            <div className="text-center py-20 opacity-40">
              <Search size={48} className="mx-auto mb-4" />
              <p className="text-xl">Search the Pexels art library for inspiration</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
