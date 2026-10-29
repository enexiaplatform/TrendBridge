import { markets } from "@/lib/global";
export async function GET(){return Response.json({
  research:{provider:"manus",live:false,mode:"user-supplied evidence and test templates",automaticMarketData:false,automaticURLExtraction:false},
  commerce:{live:false,paidUnlock:false},
  coverage:Object.entries(markets).map(([code,m])=>({market:code,currency:m.currency,channels:m.channels,available:["private cases","manual evidence","unit and launch cash planning","business plan","validation tracking"],marketDataset:"not connected"})),
  monitoring:{scheduled:false,refresh:"manual source observations only"},
},{headers:{"Cache-Control":"no-store"}});}
