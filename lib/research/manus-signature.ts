import {createHash,createVerify} from "node:crypto";
/** Manus v2 webhook signature: RSA-SHA256(timestamp.URL.SHA256hex(raw body)). */
export function verifySignature(publicKey:string,url:string,raw:string,timestamp:string,signature:string,now=Date.now()) {
  if(!/^\d{10}$/.test(timestamp)||Math.abs(now/1000-Number(timestamp))>300)return false;
  if(!/^[A-Za-z0-9+/]+={0,2}$/.test(signature))return false;
  const hash=createHash("sha256").update(raw,"utf8").digest("hex");
  const verifier=createVerify("RSA-SHA256");
  verifier.update(`${timestamp}.${url}.${hash}`);verifier.end();
  try{return verifier.verify(publicKey,signature,"base64");}catch{return false;}
}
