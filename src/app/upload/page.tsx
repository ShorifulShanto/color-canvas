"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { useAuth as useAuthContext } from "@/context/AuthContext";
import { useFirestore } from "@/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, X, Sparkles, Loader2, ArrowLeft, CheckCircle2 } from "lucide-react";
import { suggestArtworkTags } from "@/ai/flows/ai-artwork-tag-suggestion";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { uploadImageAction } from "@/app/actions/upload-actions";

function UploadContent() {
  const { user, profile } = useAuthContext();
  const db = useFirestore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string>("");
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle source parameter from AI generation or search
  useEffect(() => {
    const sourceUrl = searchParams.get('source');
    if (sourceUrl) {
      setPreview(decodeURIComponent(sourceUrl));
    }
  }, [searchParams]);

  // Handle authentication redirect correctly inside useEffect
  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);

  if (!user) {
    return null;
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 10 * 1024 * 1024) { // Sync with bodySizeLimit in next.config.ts
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
      toast({ title: "Tags Analyzed", description: "AI suggested relevant categories." });
    } catch (error) {
      toast({ title: "AI Tagging unavailable", description: "Try manual tagging.", variant: "destructive" });
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!preview || !title || !db) {
       toast({ title: "Incomplete details", description: "Title and Image are required.", variant: "destructive" });
       return;
    }
    
    setIsUploading(true);
    setUploadStatus("Transferring to Cloudinary...");

    try {
      // 1. Securely transfer the image to Cloudinary storage
      const cloudinaryUrl = await uploadImageAction(preview);
      
      setUploadStatus("Publishing to gallery...");

      // 2. Prepare the post data with the permanent Cloudinary URL
      const postData = {
        userId: user.uid,
        username: profile?.username || "anonymous",
        imageUrl: cloudinaryUrl, // Permanent Cloudinary link
        title,
        description,
        tags,
        likesCount: 0,
        createdAt: serverTimestamp(),
      };

      // 3. Save to Firestore (non-blocking per guidelines)
      const postsRef = collection(db, "posts");
      addDoc(postsRef, postData)
        .catch(async (error) => {
          const permissionError = new FirestorePermissionError({
            path: postsRef.path,
            operation: 'create',
            requestResourceData: postData,
          });
          errorEmitter.emit('permission-error', permissionError);
        });

      toast({ 
        title: "Masterpiece Published!", 
        description: "Your work is now live and stored permanently." 
      });
      
      // Navigate to explore immediately
      router.push("/explore");

    } catch (error: any) {
      console.error("Upload Error:", error);
      toast({ 
        title: "Upload failed", 
        description: error.message || "Something went wrong during the transfer.", 
        variant: "destructive" 
      });
      setIsUploading(false);
      setUploadStatus("");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl space-y-8">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-muted-foreground hover:text-accent transition-colors">
        <ArrowLeft size={18} /> Back to Studio
      </button>

      <div className="grid md:grid-cols-2 gap-12">
        <div className="space-y-6">
          <h1 className="font-headline font-bold text-3xl">Finalize Post</h1>
          <div 
            onClick={() => !preview && fileInputRef.current?.click()}
            className={`relative aspect-[4/5] w-full rounded-3xl border-2 border-dashed flex flex-col items-center justify-center transition-all overflow-hidden
              ${preview ? 'border-accent bg-white shadow-xl' : 'border-primary/20 bg-primary/5 cursor-pointer hover:bg-primary/10'}`}
          >
            {preview ? (
              <>
                <Image src={preview} alt="Preview" fill className="object-cover" unoptimized={preview.startsWith('data:')} />
                <button 
                  onClick={(e) => { e.stopPropagation(); setPreview(null); setFile(null); }}
                  className="absolute top-4 right-4 p-2 bg-black/60 text-white rounded-full hover:bg-black/80 shadow-lg z-10"
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
                  <p className="font-semibold text-lg">Upload Art File</p>
                  <p className="text-sm text-muted-foreground">PNG, JPG or WEBP</p>
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
            <Card className="border-accent/20 bg-accent/5 rounded-2xl overflow-hidden">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-accent text-white rounded-xl shadow-sm">
                    <Sparkles size={18} />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Smart Tagging</p>
                    <p className="text-xs text-muted-foreground">AI can help describe your work.</p>
                  </div>
                </div>
                <Button 
                  variant="secondary" 
                  size="sm" 
                  onClick={generateAiTags}
                  disabled={isAiLoading || isUploading}
                  className="rounded-full px-4"
                >
                  {isAiLoading ? <Loader2 size={16} className="animate-spin" /> : "Suggest"}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-8 py-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Artwork Title</Label>
              <Input 
                id="title" 
                placeholder="Give it a name..." 
                className="h-12 border-primary/20 rounded-xl focus-visible:ring-accent bg-white shadow-sm"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isUploading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Creative Note</Label>
              <Textarea 
                id="description" 
                placeholder="What was your inspiration?" 
                className="min-h-[140px] border-primary/20 rounded-xl focus-visible:ring-accent bg-white shadow-sm resize-none"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isUploading}
              />
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Classification</Label>
              <div className="flex flex-wrap gap-2 min-h-[48px] p-2 bg-white rounded-xl border border-primary/10">
                {tags.length > 0 ? (
                  tags.map(tag => (
                    <Badge key={tag} className="bg-accent text-white px-3 py-1 flex items-center gap-1">
                      {tag}
                      <button 
                        onClick={() => !isUploading && setTags(tags.filter(t => t !== tag))} 
                        className="hover:text-black disabled:opacity-50"
                        disabled={isUploading}
                      >
                        <X size={10} />
                      </button>
                    </Badge>
                  ))
                ) : (
                  <span className="text-sm text-muted-foreground italic px-2 self-center">No tags assigned...</span>
                )}
              </div>
            </div>
          </div>

          <div className="pt-6 border-t space-y-4">
            <Button 
              className="w-full h-14 text-lg bg-accent text-white hover:bg-accent/90 rounded-full shadow-lg gap-2"
              onClick={handleUpload}
              disabled={isUploading || !preview || !title}
            >
              {isUploading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  {uploadStatus}
                </>
              ) : (
                <>
                  <CheckCircle2 size={20} />
                  Share to Gallery
                </>
              )}
            </Button>
            {isUploading && (
              <p className="text-center text-xs text-muted-foreground animate-pulse">
                Securing your artwork in the permanent cloud...
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function UploadPage() {
  return (
    <Suspense fallback={<div className="container mx-auto p-12 text-center">Loading studio...</div>}>
      <UploadContent />
    </Suspense>
  );
}
