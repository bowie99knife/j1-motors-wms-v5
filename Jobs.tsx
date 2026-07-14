import { FormEvent, useState } from "react";
import { configured, supabase } from "../lib/supabase";

const initial={name:"",phone:"",email:"",rego:"",make:"",model:"",year:"",odometer:"",description:""};

export default function Quote(){
  const [form,setForm]=useState(initial);
  const [files,setFiles]=useState<File[]>([]);
  const [message,setMessage]=useState("");
  const [busy,setBusy]=useState(false);

  async function submit(e:FormEvent){
    e.preventDefault();
    setBusy(true);
    setMessage("Submitting…");

    if(!configured){
      const demoQuotes=JSON.parse(localStorage.getItem("j1_demo_quotes")||"[]");
      const reference=crypto.randomUUID();
      demoQuotes.unshift({
        id:crypto.randomUUID(), tracking_reference:reference, status:"New",
        customer_name:form.name, customer_phone:form.phone,
        ...form, rego:form.rego.toUpperCase(), attachment_names:files.map(f=>f.name),
        created_at:new Date().toISOString()
      });
      localStorage.setItem("j1_demo_quotes",JSON.stringify(demoQuotes));
      setMessage(`Quotation request received. Tracking reference: ${reference}`);
      setForm(initial); setFiles([]); setBusy(false); return;
    }

    const {data,error}=await supabase.rpc("submit_quote_request_v2",{
      payload:{...form,year:Number(form.year),odometer:Number(form.odometer)}
    });
    if(error){setMessage(error.message);setBusy(false);return;}

    const requestId=data?.request_id as string;
    const trackingReference=data?.tracking_reference as string;

    for(const file of files){
      const safeName=file.name.replace(/[^a-zA-Z0-9._-]/g,"_");
      const storagePath=`${requestId}/${crypto.randomUUID()}-${safeName}`;
      const upload=await supabase.storage.from("quote-request-files").upload(storagePath,file,{upsert:false});
      if(upload.error){setMessage(`Request saved, but ${file.name} failed to upload: ${upload.error.message}`);continue;}
      await supabase.from("quote_request_files").insert({
        quote_request_id:requestId, storage_path:storagePath,
        original_name:file.name, mime_type:file.type, size_bytes:file.size
      });
    }

    setMessage(`Quotation request received. Tracking reference: ${trackingReference}`);
    setForm(initial); setFiles([]); setBusy(false);
  }

  return <section>
    <div className="title"><span className="eyebrow">Customer portal</span><h1>Request quotation</h1><p>Describe the work required and attach photos, videos, or documents that may help our team assess the vehicle.</p></div>
    <form className="panel formGrid" onSubmit={submit}>
      {["name","phone","email","rego","make","model","year","odometer"].map(k=>
        <label key={k}>{k}<input required={!['email'].includes(k)} value={(form as any)[k]} onChange={e=>setForm({...form,[k]:e.target.value})}/></label>
      )}
      <label className="wide">Work required<textarea rows={7} required value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/></label>
      <label className="wide">Upload photos or files
        <input type="file" multiple accept="image/*,video/*,.pdf,.doc,.docx" onChange={e=>setFiles(Array.from(e.target.files||[]))}/>
      </label>
      {files.length>0&&<div className="uploadList wide">{files.map(file=><span key={`${file.name}-${file.size}`}>{file.name}</span>)}</div>}
      <button className="primary wide" disabled={busy}>{busy?"Submitting…":"Submit request"}</button>
      {message&&<p className="notice wide">{message}</p>}
    </form>
  </section>;
}
