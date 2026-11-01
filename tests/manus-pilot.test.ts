import {describe,it,expect} from "vitest";
import {createHash,createSign,generateKeyPairSync} from "node:crypto";
import {verifySignature} from "../lib/research/manus-signature";

describe("Manus webhook signatures",()=>{
  const pair=generateKeyPairSync("rsa",{modulusLength:2048});
  const publicKey=pair.publicKey.export({type:"spki",format:"pem"}).toString();
  const privateKey=pair.privateKey.export({type:"pkcs8",format:"pem"}).toString();
  const url="https://example.com/api/webhooks/manus";
  const raw='{"event_type":"task_stopped","task_detail":{"task_id":"abc123"}}';
  const now=Date.now(); const timestamp=String(Math.floor(now/1000));
  function sign(body:string,urlValue=url){
    const hash=createHash("sha256").update(body).digest("hex");
    const signer=createSign("RSA-SHA256");
    signer.update(`${timestamp}.${urlValue}.${hash}`);signer.end();
    return signer.sign(privateKey,"base64");
  }
  it("accepts valid RSA signature",()=>expect(verifySignature(publicKey,url,raw,timestamp,sign(raw),now)).toBe(true));
  it("rejects body changes",()=>expect(verifySignature(publicKey,url,raw+" ",timestamp,sign(raw),now)).toBe(false));
  it("rejects URL mismatch",()=>expect(verifySignature(publicKey,url+"/extra",raw,timestamp,sign(raw),now)).toBe(false));
  it("rejects stale requests",()=>expect(verifySignature(publicKey,url,raw,timestamp,sign(raw),now+601000)).toBe(false));
  it("rejects missing and malformed signatures",()=>expect(verifySignature(publicKey,url,raw,timestamp,"!",now)).toBe(false));
});
