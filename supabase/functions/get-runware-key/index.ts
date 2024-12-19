import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('Fetching RUNWARE_API_KEY from environment variables...')
    const RUNWARE_API_KEY = Deno.env.get('RUNWARE_API_KEY')
    
    if (!RUNWARE_API_KEY) {
      console.error('RUNWARE_API_KEY not found in environment variables')
      throw new Error('RUNWARE_API_KEY não encontrada')
    }

    console.log('Successfully retrieved RUNWARE_API_KEY')
    return new Response(
      JSON.stringify({ 
        RUNWARE_API_KEY,
        message: 'API key retrieved successfully' 
      }),
      {
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json'
        },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error in get-runware-key function:', error.message)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        hint: 'Make sure RUNWARE_API_KEY is set in Supabase Edge Function secrets' 
      }),
      {
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json'
        },
        status: 400,
      },
    )
  }
})