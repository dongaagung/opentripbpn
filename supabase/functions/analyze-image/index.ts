import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageUrl } = await req.json();
    console.log('Analyzing image:', imageUrl);

    if (!imageUrl) {
      throw new Error('Image URL is required');
    }

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
    let result;
    try {
      // Remove any markdown code blocks if present
      const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
      result = JSON.parse(cleanContent);
    } catch {
      console.log('Failed to parse AI response, using fallback');
      // Fallback with varied colors based on random selection
      const fallbackColors = ['#DC5240', '#2D7D90', '#E07B39', '#3D8B6E', '#B8860B', '#4A6D7C'];
      const randomColor = fallbackColors[Math.floor(Math.random() * fallbackColors.length)];
      result = {
        caption: 'Keindahan Tersembunyi',
        overlayColor: randomColor
      };
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error analyzing image:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    // Return fallback with varied colors instead of error to prevent UI issues
    const fallbackColors = ['#DC5240', '#2D7D90', '#E07B39', '#3D8B6E', '#B8860B', '#C75B7A'];
    const randomColor = fallbackColors[Math.floor(Math.random() * fallbackColors.length)];
    return new Response(
      JSON.stringify({ 
        caption: 'Momen Indah',
        overlayColor: randomColor
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  }
});