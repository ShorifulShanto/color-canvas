"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, X, Sparkles, Image as ImageIcon, Loader2 } from "lucide-react";
import { suggestArtworkTags } from "@/ai/flows/ai-artwork-tag-suggestion";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

export default function UploadPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!user) {
    router.push("/login");
    return null;
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast({ title: "File too large", description: "Please upload an image under 10MB.", variant: "destructive" });
        return;
      }
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(selectedFile);
    }
  };

  const generateAiTags = async () => {
    if (!preview) return;
    setIsAiLoading(true);
    try {
      const response = await suggestArtworkTags({
        imageDataUri: preview,
        description: description
      });
      setTags(response.tags);
      toast({ title: "Tags suggested!", description: "AI has analyzed your artwork." });
    } catch (error) {
      console.error("AI Tag error", error);
      toast({ title: "AI Error", description: "Failed to suggest tags.", variant: "destructive" });
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!file || !title) {
       toast({ title: "Missing information", description: "Please provide a title and an image.", variant: "destructive" });
       return;
    }
    
    setIsUploading(true);
    // Simulation of firebase storage and firestore save
    setTimeout(() => {
      setIsUploading(false);
      toast({ title: "Artwork Shared!", description: "Your creation is now live." });
      router.push("/");
    }, 2000);
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="grid md:grid-cols-2 gap-12">
        {/* Left: Preview Area */}
        <div className="space-y-6">
          <h1 className="font-headline font-bold text-3xl">Upload Artwork</h1>
          <div 
            onClick={() => fileInputRef.current?.click()}
            className={`relative aspect-[4/5] w-full rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-all
              ${preview ? 'border-accent bg-background' : 'border-primary/40 bg-primary/5 hover:bg-primary/10'}`}
          >
            {preview ? (
              <>
                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                <button 
                  onClick={(e) => { e.stopPropagation(); setPreview(null); setFile(null); }}
                  className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                >
                  <X size={20} />
                </button>
              </>
            ) : (
              <div className="text-center p-8 space-y-4">
                <div className="w-16 h-16 bg-accent/10 text-accent rounded-full flex items-center justify-center mx-auto">
                  <Upload size={32} />
                </div>
                <div>
                  <p className="font-semibold text-lg">Click or drag to upload</p>
                  <p className="text-sm text-muted-foreground">PNG, JPG or WEBP (max. 10MB)</p>
                </div>
              </div>
            )}
            <input 
              ref={fileInputRef}
              type="file" 
              className="hidden" 
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>
          
          {preview && (
            <div className="flex items-center justify-between p-4 bg-white/50 rounded-xl border">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-accent/10 text-accent rounded-lg">
                  <Sparkles size={20} />
                </div>
                <div>
                  <p className="font-medium">Need help with tags?</p>
                  <p className="text-xs text-muted-foreground">Let ColorCanvas AI suggest some for you.</p>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={generateAiTags}
                disabled={isAiLoading}
              >
                {isAiLoading ? <Loader2 size={16} className="animate-spin mr-2" /> : "Suggest Tags"}
              </Button>
            </div>
          )}
        </div>

        {/* Right: Form Details */}
        <div className="space-y-8 py-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-base">Artwork Title</Label>
              <Input 
                id="title" 
                placeholder="Give your masterpiece a name" 
                className="h-12 border-primary/30 rounded-lg focus-visible:ring-accent"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description" className="text-base">Description (Optional)</Label>
              <Textarea 
                id="description" 
                placeholder="Tell the story behind your work..." 
                className="min-h-[120px] border-primary/30 rounded-lg focus-visible:ring-accent resize-none"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="space-y-3">
              <Label className="text-base">Tags</Label>
              <div className="flex flex-wrap gap-2 min-h-[40px] p-2 bg-primary/5 rounded-lg border border-primary/20">
                {tags.length > 0 ? (
                  tags.map(tag => (
                    <Badge key={tag} className="bg-white text-black hover:bg-accent hover:text-white cursor-pointer px-3 py-1">
                      {tag}
                      <button onClick={() => setTags(tags.filter(t => t !== tag))} className="ml-1 opacity-60 hover:opacity-100">
                        <X size={12} />
                      </button>
                    </Badge>
                  ))
                ) : (
                  <span className="text-sm text-muted-foreground italic px-2">No tags added yet...</span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">Tags help others find your work in the Explore section.</p>
            </div>
          </div>

          <div className="pt-4 border-t space-y-4">
            <Button 
              className="w-full h-14 text-lg bg-accent text-white hover:bg-accent/90 rounded-full shadow-lg shadow-accent/20"
              onClick={handleUpload}
              disabled={isUploading}
            >
              {isUploading ? <><Loader2 size={20} className="animate-spin mr-2" /> Publishing...</> : "Publish to Gallery"}
            </Button>
            <Button variant="ghost" className="w-full" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}