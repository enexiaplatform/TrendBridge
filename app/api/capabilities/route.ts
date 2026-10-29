import { markets } from "@/lib/global";
import { isSupabaseServerConfigured } from "@/lib/supabase/server";
export async function GET(){const supabase=isSupabaseServerConfigured(),storage=supabase?Boolean(process.env.SUPABASE_SECRET_KEY):process.env.NODE_ENV!=="production";return Response.json({
  storage:{configured:storage,mode:storage?(supabase?"authenticated Supabase":"development"):"unavailable",connectivityChecked:false},
  research:{provider:"manus",live:false,mode:"user-supplied evidence and test templates",automaticMarketData:false,automaticURLExtraction:false},
  commerce:{live:false,paidUnlock:false},
  coverage:Object.entries(markets).map(([code,m])=>({market:code,currency:m.currency,channels:m.channels,available:storage?["private cases","manual evidence","unit and launch cash planning","business plan","validation tracking"]:["public sample draft exploration"],marketDataset:"not connected"})),
  monitoring:{scheduled:false,refresh:"manual source observations only"},
},{headers:{"Cache-Control":"no-store"}});}
