import "server-only";
import {createHash,createVerify} from "node:crypto";
import {ManusAdapter} from "./manus";
const cache:{key:string;expires:number}={key:"",expires:0};
export function verifySignature(publicKey:string,url:string,raw:string,timestamp:string,signature:string,now=Date.now()) {
  if(!/^\d{10}$/.test(timestamp)||Math.abs(now/1000-Number(timestamp))>300)return false;
  if(!/^[A-Za-z0-9+/]+={0,2}$/.test(signature))return false;
  const hash=createHash("sha256").update(raw,"utf8").digest("hex");
  const verifier=createVerify("RSA-SHA256");
  verifier.update(`${timestamp}.${url}.${hash}`);verifier.end();
  try{return verifier.verify(publicKey,signature,"base64");}catch{return false;}
}
export async function manusPublicKey() {
  if(cache.key&&cache.expires>Date.now())return cache.key;
  if(!process.env.MANUS_API_KEY)throw new Error("Manus key is missing");
  const value=await new ManusAdapter(process.env.MANUS_API_KEY,true).publicKey();
  if(!value.public_key?.includes("BEGIN PUBLIC KEY"))throw new Error("Invalid Manus webhook public key");
  cache.key=value.public_key;cache.expires=Date.now()+60*60*1000;
  return cache.key;
}
