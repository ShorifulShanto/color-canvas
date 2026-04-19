/**
 * @fileOverview Utility for interacting with the Pexels API.
 */

const PEXELS_API_KEY = 'evzQDzFUChng0qAL4Ub2bEN6D9uoE2KPAmQsnTNLRKatVm3x68TTJOAL';

export interface PexelsPhoto {
  id: number;
  width: number;
  height: number;
  url: string;
  photographer: string;
  src: {
    original: string;
    large2x: string;
    large: string;
    medium: string;
    small: string;
    portrait: string;
    landscape: string;
    tiny: string;
  };
}

export async function searchPexels(query: string, perPage: number = 20): Promise<PexelsPhoto[]> {
  try {
    const response = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${perPage}`,
      {
        headers: {
          Authorization: PEXELS_API_KEY,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Pexels API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.photos || [];
  } catch (error) {
    console.error('Error searching Pexels:', error);
    return [];
  }
}
