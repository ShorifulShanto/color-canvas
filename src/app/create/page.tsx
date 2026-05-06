
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Search, Loader2, Wand2, ImageIcon, Plus, Zap, Maximize, Share2 } from "lucide-react";
import { generateArtwork } from "@/ai/flows/generate-artwork";
import { refineArtPrompt } from "@/ai/flows/refine-prompt";
import { searchPexels, PexelsPhoto } from "@/lib/pexels";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

export default function CreatePage() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [aiPrompt, setAiPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [generationStep, setGenerationStep] = useState<string>("");
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [pexelsResults, setPexelsResults] = useState<PexelsPhoto[]>([]);

  if (!user) {
    router.push("/login");
    return null;
  }

  const handleRefine = async () => {
    if (!aiPrompt) return;
    setIsRefining(true);
    try {
      const result = await refineArtPrompt({ prompt: aiPrompt });
      setAiPrompt(result.refinedPrompt);
      toast({ title: "Prompt Refined!", description: "AI has enhanced your vision with professional keywords." });
    } catch (error) {
      toast({ title: "Refinement failed", variant: "destructive" });
    } finally {
      setIsRefining(false);
    }
  };

  const handleGenerate = async () => {
    if (!aiPrompt) return;
    setIsGenerating(true);
    setGeneratedImage(null);
    setGenerationStep("Starting AI engine...");
    
    try {
      setGenerationStep("Generating base pixels...");
      const result = await generateArtwork({ prompt: aiPrompt });
      setGeneratedImage(result.imageUrl);
      setGenerationStep("Finalizing masterpiece...");
      toast({ 
        title: "Masterpiece Created!", 
        description: "Your drawing has been generated, upscaled, and stored in Cloudinary." 
      });
    } catch (error) {
      toast({ 
        title: "Generation failed", 
        description: "The AI engine encountered an error. Please verify your Replicate and Cloudinary keys.", 
        variant: "destructive" 
      });
    } finally {
      setIsGenerating(false);
      setGenerationStep("");
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
        <h1 className="font-headline font-bold text-4xl md:text-5xl">AI Creative Studio</h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Harness SDXL and BLIP models to render your wildest imaginations in seconds.
        </p>
      </div>

      <Tabs defaultValue="ai" className="space-y-8">
        <div className="flex justify-center">
          <TabsList className="grid w-full max-w-md grid-cols-2 rounded-full h-12 p-1 bg-white border shadow-sm">
            <TabsTrigger value="ai" className="rounded-full flex items-center gap-2 data-[state=active]:bg-accent data-[state=active]:text-white">
              <Wand2 size={18} /> Studio
            </TabsTrigger>
            <TabsTrigger value="discover" className="rounded-full flex items-center gap-2 data-[state=active]:bg-accent data-[state=active]:text-white">
              <Search size={18} /> Discovery
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="ai" className="focus-visible:outline-none">
          <div className="grid md:grid-cols-2 gap-8 items-start">
            <Card className="border-none shadow-xl bg-white rounded-3xl overflow-hidden">
              <CardHeader className="bg-accent/5 pb-8 border-b border-accent/10">
                <CardTitle className="font-headline flex items-center gap-2">
                  <Sparkles className="text-accent" /> Prompt Canvas
                </CardTitle>
                <CardDescription>
                  Describe your masterpiece. Use the Refine tool for professional results.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div className="space-y-4">
                  <div className="relative">
                    <Textarea
                      placeholder="Describe your vision... e.g. 'A futuristic city in the style of Van Gogh'"
                      className="w-full min-h-[200px] p-6 rounded-2xl border border-primary/20 bg-background focus:ring-2 focus:ring-accent outline-none resize-none transition-all text-lg"
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                    />
                    <div className="absolute bottom-4 right-4 flex gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={handleRefine}
                        disabled={isRefining || !aiPrompt || isGenerating}
                        className="rounded-full gap-2 shadow-sm bg-white hover:bg-accent hover:text-white border"
                      >
                        {isRefining ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} />}
                        Refine Vision
                      </Button>
                    </div>
                  </div>
                </div>
                
                <Button 
                  onClick={handleGenerate}
                  disabled={isGenerating || !aiPrompt}
                  className="w-full h-16 text-lg bg-accent text-white hover:bg-accent/90 rounded-full shadow-lg transition-all hover:scale-[1.02]"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="animate-spin mr-3" /> 
                      {generationStep}
                    </>
                  ) : (
                    <>
                      <Wand2 className="mr-3" size={24} /> Generate Masterpiece
                    </>
                  )}
                </Button>

                <div className="pt-4 flex items-center justify-center gap-6 opacity-60">
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest">
                    <Badge variant="outline">SDXL 1.0</Badge>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest">
                    <Badge variant="outline">Upscaled</Badge>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest">
                    <Badge variant="outline">Auto-Caption</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="aspect-square w-full rounded-3xl bg-white border border-primary/10 shadow-inner flex flex-col items-center justify-center relative overflow-hidden group">
              {generatedImage ? (
                <>
                  <Image src={generatedImage} alt="Generated" fill className="object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-4">
                    <Button 
                      onClick={() => handleCaptureImage(generatedImage)} 
                      className="bg-white text-black hover:bg-accent hover:text-white rounded-full px-8 h-12 font-bold shadow-xl"
                    >
                      <Plus size={18} className="mr-2" /> Post to Gallery
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center p-8 space-y-4 opacity-40">
                  <div className="w-24 h-24 bg-accent/5 rounded-full flex items-center justify-center mx-auto text-accent">
                    {isGenerating ? <Loader2 size={48} className="animate-spin" /> : <ImageIcon size={48} />}
                  </div>
                  <div>
                    <p className="text-xl font-headline font-bold">Studio Canvas</p>
                    <p className="text-sm">Your AI-generated art will appear here.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="discover" className="space-y-8 focus-visible:outline-none">
          <div className="flex gap-2 max-w-2xl mx-auto bg-white p-2 rounded-full border shadow-sm">
            <Input 
              placeholder="Search for inspiration (e.g. 'Cyberpunk Street')..."
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

          {pexelsResults.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {pexelsResults.map((photo) => (
                <div key={photo.id} className="group relative aspect-[3/4] rounded-3xl overflow-hidden bg-white shadow-sm transition-all hover:shadow-lg hover:-translate-y-1">
                  <Image 
                    src={photo.src.large} 
                    alt={photo.photographer} 
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                    <Button 
                      size="sm" 
                      className="w-full rounded-full bg-white text-black hover:bg-accent hover:text-white font-bold"
                      onClick={() => handleCaptureImage(photo.src.large2x)}
                    >
                      Capture Inspiration
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 opacity-30">
              <Search size={64} className="mx-auto mb-4" />
              <p className="text-lg font-bold">Search millions of Pexels photos</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
