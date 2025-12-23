import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Allowed origins for CORS - restrict to known domains
const allowedOrigins = [
  'https://lovable.dev',
  'https://www.lovable.dev',
  'http://localhost:5173',
  'http://localhost:8080',
];

// Get project URL from environment and add to allowed origins
const supabaseUrl = Deno.env.get('SUPABASE_URL');
if (supabaseUrl) {
  // Extract project ID and add preview URLs
  const projectMatch = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/);
  if (projectMatch) {
    allowedOrigins.push(`https://${projectMatch[1]}.lovableproject.com`);
  }
}

function getCorsHeaders(origin: string | null): Record<string, string> {
  // Check if origin is allowed
  const isAllowed = origin && (
    allowedOrigins.includes(origin) || 
    origin.endsWith('.lovableproject.com') ||
    origin.endsWith('.lovable.app')
  );
  
  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : allowedOrigins[0],
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };
}

// URL validation helper
function isValidImageUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    // Only allow HTTPS URLs
    if (parsed.protocol !== 'https:') return false;
    // Block private IPs and localhost
    const hostname = parsed.hostname.toLowerCase();
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('192.168.') || hostname.startsWith('10.') || hostname.startsWith('172.')) {
      return false;
    }
    // Check for valid image extensions or known image hosts
    const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg'];
    const pathname = parsed.pathname.toLowerCase();
    const hasValidExtension = validExtensions.some(ext => pathname.includes(ext));
    const isKnownImageHost = hostname.includes('supabase') || hostname.includes('unsplash') || hostname.includes('cloudinary');
    return hasValidExtension || isKnownImageHost;
  } catch {
    return false;
  }
}

// Valid color palette - whitelist approach for security
const VALID_COLORS = [
  '#DC5240', // warm red
  '#2D7D90', // ocean teal
  '#E07B39', // sunset orange
  '#3D8B6E', // forest green
  '#B8860B', // golden
  '#5E4B8A', // dusk purple
  '#C75B7A', // sakura pink
  '#4A6D7C', // slate blue
];

const DEFAULT_COLOR = '#DC5240';

// Output sanitization helpers
function sanitizeCaption(caption: unknown): string {
  if (typeof caption !== 'string') {
    return 'Keindahan Tersembunyi';
  }
  // Remove any HTML/script tags, limit length, trim whitespace
  return caption
    .replace(/<[^>]*>/g, '')
    .replace(/[<>'"&]/g, '') // Remove potentially dangerous characters
    .substring(0, 50)
    .trim() || 'Keindahan Tersembunyi';
}

function validateColor(color: unknown): string {
  if (typeof color !== 'string') {
    return DEFAULT_COLOR;
  }
  // Normalize and validate against whitelist
  const normalizedColor = color.trim().toUpperCase();
  const validColor = VALID_COLORS.find(c => c.toUpperCase() === normalizedColor);
  return validColor || DEFAULT_COLOR;
}

// Simple in-memory rate limiting
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 30; // 30 requests per minute per IP

function checkRateLimit(clientId: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(clientId);
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(clientId, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  
  if (record.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }
  
  record.count++;
  return true;
}

// Clean up old rate limit entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitMap.entries()) {
    if (now > value.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}, 60000);

// Simple in-memory cache for analyzed images
const analysisCache = new Map<string, { result: { caption: string; overlayColor: string }; expiry: number }>();
const CACHE_TTL_MS = 3600000; // 1 hour cache

function getCachedAnalysis(imageUrl: string): { caption: string; overlayColor: string } | null {
  const cached = analysisCache.get(imageUrl);
  if (cached && Date.now() < cached.expiry) {
    console.log('Cache hit for:', imageUrl.substring(0, 50));
    return cached.result;
  }
  if (cached) {
    analysisCache.delete(imageUrl);
  }
  return null;
}

function setCachedAnalysis(imageUrl: string, result: { caption: string; overlayColor: string }): void {
  // Limit cache size
  if (analysisCache.size > 500) {
    // Remove oldest entries
    const entries = Array.from(analysisCache.entries());
    entries.sort((a, b) => a[1].expiry - b[1].expiry);
    for (let i = 0; i < 100; i++) {
      analysisCache.delete(entries[i][0]);
    }
  }
  analysisCache.set(imageUrl, { result, expiry: Date.now() + CACHE_TTL_MS });
}

serve(async (req) => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Get client identifier for rate limiting
  const clientId = req.headers.get('x-forwarded-for') || 
                   req.headers.get('x-real-ip') || 
                   'unknown';

  // Check rate limit
  if (!checkRateLimit(clientId)) {
    console.warn('Rate limit exceeded for:', clientId);
    return new Response(
      JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 429 }
    );
  }

  try {
    const body = await req.json();
    const { imageUrl } = body;
    
    // Validate imageUrl is provided and is a string
    if (!imageUrl || typeof imageUrl !== 'string') {
      console.error('Invalid or missing imageUrl');
      throw new Error('Image URL is required and must be a string');
    }

    // Validate URL format and safety
    if (!isValidImageUrl(imageUrl)) {
      console.error('Invalid image URL format:', imageUrl.substring(0, 100));
      throw new Error('Invalid image URL format');
    }

    // Limit URL length
    if (imageUrl.length > 2000) {
      console.error('Image URL too long');
      throw new Error('Image URL exceeds maximum length');
    }

    // Check cache first
    const cachedResult = getCachedAnalysis(imageUrl);
    if (cachedResult) {
      return new Response(JSON.stringify(cachedResult), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Analyzing image:', imageUrl.substring(0, 100));

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY');

    const response = await fetch(`${supabaseUrl}/functions/v1/ai-gateway`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        provider: 'google',
        model: 'gemini-2.5-flash',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Analyze this travel/destination image and respond with JSON only (no markdown):
{
  "caption": "A short, poetic 3-5 word caption in Indonesian that captures the essence of this place",
  "overlayColor": "Pick ONE color from this Japan-inspired palette that best matches the image mood:
    - #DC5240 (warm red - for vibrant temples, autumn, festivals)
    - #2D7D90 (ocean teal - for water, sky, serene coastal views)
    - #E07B39 (sunset orange - for sunset, warm lighting, traditional areas)
    - #3D8B6E (forest green - for nature, gardens, bamboo)
    - #B8860B (golden - for temples, shrines, traditional architecture)
    - #5E4B8A (dusk purple - for night scenes, cherry blossoms twilight)
    - #C75B7A (sakura pink - for cherry blossoms, spring)
    - #4A6D7C (slate blue - for mountains, modern city, rain)
    Return ONLY the hex code."
}
Only respond with the JSON, no other text.`
              },
              {
                type: 'image_url',
                image_url: { url: imageUrl }
              }
            ]
          }
        ],
        max_tokens: 150,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    console.log('AI Response:', JSON.stringify(data));
    
    const content = data.choices?.[0]?.message?.content || '';
    
    // Parse the JSON from the response
    let parsedResult;
    try {
      // Remove any markdown code blocks if present
      const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
      parsedResult = JSON.parse(cleanContent);
    } catch {
      console.log('Failed to parse AI response, using fallback');
      parsedResult = null;
    }

    // Sanitize and validate output - SECURITY: Never trust AI response directly
    const sanitizedResult = {
      caption: sanitizeCaption(parsedResult?.caption),
      overlayColor: validateColor(parsedResult?.overlayColor)
    };

    // Cache the sanitized result
    setCachedAnalysis(imageUrl, sanitizedResult);

    return new Response(JSON.stringify(sanitizedResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error analyzing image:', error);
    // Return fallback with varied colors instead of error to prevent UI issues
    const randomColor = VALID_COLORS[Math.floor(Math.random() * VALID_COLORS.length)];
    return new Response(
      JSON.stringify({ 
        caption: 'Momen Indah',
        overlayColor: randomColor
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  }
});
