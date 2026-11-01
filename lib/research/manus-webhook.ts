import "server-only";
import {ManusAdapter} from "./manus";
export {verifySignature} from "./manus-signature";
const cache:{key:string;expires:number}={key:"",expires:0};
export async function manusPublicKey() {
  if(cache.key&&cache.expires>Date.now())return cache.key;
  if(!process.env.MANUS_API_KEY)throw new Error("Manus key is missing");
  const value=await new ManusAdapter(process.env.MANUS_API_KEY,true).publicKey();
  if(!value.public_key?.includes("BEGIN PUBLIC KEY"))throw new Error("Invalid Manus webhook public key");
  cache.key=value.public_key;cache.expires=Date.now()+60*60*1000;
  return cache.key;
}
