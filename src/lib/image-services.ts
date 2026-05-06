
import { v2 as cloudinary } from 'cloudinary';
import Replicate from 'replicate';

// Initialize Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Initialize Replicate
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export async function generateWithSDXL(prompt: string): Promise<string> {
  if (!process.env.REPLICATE_API_TOKEN) {
    throw new Error('REPLICATE_API_TOKEN is not configured');
  }

  // Using SDXL 1.0
  const output: any = await replicate.run(
    "stability-ai/sdxl:7762fd0e23040d01c6a1529196238383e207908c67a36f784e27f47498322e70",
    {
      input: {
        prompt: prompt,
        scheduler: "K_EULER",
        guidance_scale: 7.5,
        num_inference_steps: 50,
      }
    }
  );
  
  if (!output || !output[0]) {
    throw new Error('Model failed to generate image');
  }
  
  return output[0];
}

export async function upscaleImage(imageUrl: string): Promise<string> {
  const output: any = await replicate.run(
    "nightmare-ai/real-esrgan:42fed1c4974146d7d2411293962d14456e45f26145a9881f51040a1128f3310f",
    {
      input: {
        image: imageUrl,
        upscale: 2,
        face_enhance: true
      }
    }
  );
  return output;
}

export async function captionImage(imageUrl: string): Promise<string> {
  const output: any = await replicate.run(
    "salesforce/blip:2e1eb24119a0da292705774a8710323910c8ff0d64e9a031e4f4949a2fa71624",
    {
      input: {
        image: imageUrl,
        task: "image_captioning"
      }
    }
  );
  return output;
}

export async function uploadToCloudinary(fileUrl: string): Promise<string> {
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    throw new Error('Cloudinary is not configured');
  }

  const result = await cloudinary.uploader.upload(fileUrl, {
    folder: 'colorcanvas',
  });
  return result.secure_url;
}
