"use client";
import {useCallback,useEffect,useState} from "react";

type Job={id:string;status:string;createdAt:string;updatedAt:string;credits:number|null;qualityIssues:Array<{code:string;detail:string}>;errorCode:string|null;taskCreated:boolean};
export function ManusPilotCard({id}:{id:string}) {
  const [job,setJob]=useState<Job|null>(null);
  const [ready,setReady]=useState(false);
  const [loading,setLoading]=useState(true);
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState("");
  const load=useCallback(async()=>{
    try {
      const response=await fetch(`/api/research/${encodeURIComponent(id)}/manus`,{cache:"no-store"});
      if(response.status===503 || response.status===403){setReady(false);return;}
      if(!response.ok)throw new Error("Unable to check research status");
      const result=await response.json();
      setReady(true);setJob(result.job??null);
    }catch{setReady(false);}finally{setLoading(false);}
  },[id]);
  useEffect(()=>{void load();},[load]);
  useEffect(()=>{
    if(!ready || !job || !["running","waiting"].includes(job.status))return;
    const interval=window.setInterval(()=>{void load();},60000);
    return()=>window.clearInterval(interval);
  },[job?.status,ready,load]);
  async function action(kind:"start"|"cancel"){
    setBusy(true);setMessage("");
    try{
      const endpoint=kind==="cancel"?`/api/research/${id}/manus/cancel`:`/api/research/${id}/manus`;
      const response=await fetch(endpoint,{method:"POST"});
      const result=await response.json();
      if(!response.ok)throw new Error(result.error||"Request failed");
      setJob(result.job);setMessage(kind==="start"?"Pilot task requested. Credits may be consumed.":"Cancellation requested.");
    }catch(error){setMessage(error instanceof Error?error.message:"Request failed");}
    finally{setBusy(false);}
  }
  return <div className="panel panel-pad" style={{marginTop:20}}>
    <h3>Manus AI · private pilot</h3>
    <p className="field-help">Owner-only research test. Results remain private for independent source review. This is not a paid report or verified research.</p>
    {loading?<p role="status">Checking pilot availability…</p>:
    !ready?<p role="status">Not activated. Add your API key securely in the Vercel server environment; the pilot also requires an owner allowlist, queue migration and explicit activation.</p>:
    <div>
      <p role="status"><strong>Status:</strong> {job?.status??"Ready for one controlled test"}</p>
      {job?.credits!==null && job?.credits!==undefined&&<p>Manus credits reported: {job.credits}</p>}
      {job?.errorCode&&<p role="alert">Needs attention: {job.errorCode}</p>}
      {job && job.qualityIssues.length > 0 && <p>QA hold: {job.qualityIssues.map(i=>i.code).join(", ")}. No evidence has been independently verified.</p>}
      {!job&&<button className="btn btn-primary" disabled={busy} onClick={()=>void action("start")}>Run one Manus research test (may consume credits)</button>}
      {job&&["running","waiting"].includes(job.status)&&<button className="btn btn-outline" disabled={busy} onClick={()=>void action("cancel")}>Stop Manus task</button>}
      {job&&["running","waiting"].includes(job.status)&&<button className="btn btn-outline" disabled={busy} onClick={()=>void load()}>Refresh status</button>}
      {job?.status==="qa_pending"&&<p>Structured output saved privately. Independent claim-to-source verification is still required; export and paid unlock remain blocked.</p>}
    </div>}
    {message&&<p role="status">{message}</p>}
  </div>;
}
