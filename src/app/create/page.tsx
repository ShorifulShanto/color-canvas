
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Search, Loader2, Wand2, ImageIcon, Plus, CheckCircle2 } from "lucide-react";
import { generateArtwork } from "@/ai/flows/generate-artwork";
import { searchPexels, PexelsPhoto } from "@/lib/pexels";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";

export default function CreatePage() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [aiPrompt, setAiPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState<string>("");
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
    setGenerationStep("Generating base image...");
    
    try {
      const result = await generateArtwork({ prompt: aiPrompt });
      setGeneratedImage(result.imageUrl);
      setGenerationStep("Processing complete!");
      toast({ 
        title: "Masterpiece Created!", 
        description: "Your drawing has been generated, upscaled, and stored." 
      });
    } catch (error) {
      toast({ 
        title: "Generation failed", 
        description: "The AI engine encountered an error. Please try again.", 
        variant: "destructive" 
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery) return;
    setIsSearching(true);
    try {
      const results = await searchPexels(`${searchQuery} art`, 12);
      setPexelsResults(results);
    } catch (error) {
      toast({ title: "Search failed", variant: "destructive" });
    } finally {
      setIsSearching(false);
    }
  };

  const handleCaptureImage = (url: string) => {
    const encodedUrl = encodeURIComponent(url);
    router.push(`/upload?source=${encodedUrl}`);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl space-y-12">
      <div className="text-center space-y-4">
        <h1 className="font-headline font-bold text-4xl md:text-5xl">Creative Studio</h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Generate original AI drawings or discover curated artistic vision.
        </p>
      </div>

      <Tabs defaultValue="ai" className="space-y-8">
        <div className="flex justify-center">
          <TabsList className="grid w-full max-w-md grid-cols-2 rounded-full h-12 p-1 bg-white border shadow-sm">
            <TabsTrigger value="ai" className="rounded-full flex items-center gap-2 data-[state=active]:bg-accent data-[state=active]:text-white">
              <Wand2 size={18} /> AI Studio
            </TabsTrigger>
            <TabsTrigger value="discover" className="rounded-full flex items-center gap-2 data-[state=active]:bg-accent data-[state=active]:text-white">
              <Search size={18} /> Discovery
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="ai" className="focus-visible:outline-none">
          <div className="grid md:grid-cols-2 gap-8 items-start">
            <Card className="border-none shadow-xl bg-white rounded-3xl overflow-hidden">
              <CardHeader className="bg-accent/5 pb-8">
                <CardTitle className="font-headline flex items-center gap-2">
                  <Sparkles className="text-accent" /> AI Canvas
                </CardTitle>
                <CardDescription>
                  Powered by Replicate SDXL, BLIP, and Cloudinary.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div className="space-y-2">
                  <textarea
                    placeholder="Describe your vision... e.g. 'A cybernetic dragon in an oil painting style'"
                    className="w-full min-h-[150px] p-4 rounded-2xl border border-primary/20 bg-background focus:ring-2 focus:ring-accent outline-none resize-none transition-all"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                  />
                </div>
                <Button 
                  onClick={handleGenerate}
                  disabled={isGenerating || !aiPrompt}
                  className="w-full h-14 text-lg bg-accent text-white hover:bg-accent/90 rounded-full shadow-lg"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="animate-spin mr-2" /> 
                      {generationStep}
                    </>
                  ) : (
                    <>
                      <Wand2 className="mr-2" /> Generate Artwork
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <div className="aspect-square w-full rounded-3xl bg-white border border-primary/10 shadow-inner flex flex-col items-center justify-center relative overflow-hidden group">
              {generatedImage ? (
                <>
                  <Image src={generatedImage} alt="Generated" fill className="object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button onClick={() => handleCaptureImage(generatedImage)} className="bg-white text-black hover:bg-white/90 rounded-full px-8 h-12">
                      <Plus size={18} className="mr-2" /> Post to Gallery
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center p-8 space-y-4 opacity-40">
                  <div className="w-20 h-20 bg-accent/5 rounded-full flex items-center justify-center mx-auto text-accent">
                    <ImageIcon size={40} />
                  </div>
                  <p className="text-lg font-medium">Ready for your prompt</p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="discover" className="space-y-8 focus-visible:outline-none">
          <div className="flex gap-2 max-w-2xl mx-auto bg-white p-2 rounded-full border shadow-sm">
            <Input 
              placeholder="Search for art style (e.g. 'watercolor')..."
              className="h-12 border-none rounded-full pl-6 focus-visible:ring-0 text-base"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button 
              onClick={handleSearch}
              disabled={isSearching}
              className="h-12 w-12 rounded-full bg-accent text-white p-0 flex-shrink-0"
            >
              {isSearching ? <Loader2 size={24} className="animate-spin" /> : <Search size={24} />}
            </Button>
          </div>

          {pexelsResults.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {pexelsResults.map((photo) => (
                <div key={photo.id} className="group relative aspect-[3/4] rounded-2xl overflow-hidden bg-white shadow-sm transition-all hover:shadow-lg">
                  <Image 
                    src={photo.src.large} 
                    alt={photo.photographer} 
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                    <Button 
                      size="sm" 
                      className="w-full rounded-full bg-white text-black hover:bg-accent hover:text-white"
                      onClick={() => handleCaptureImage(photo.src.large2x)}
                    >
                      Capture Inspiration
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
