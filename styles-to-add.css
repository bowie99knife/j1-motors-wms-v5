import { FormEvent,useEffect,useState } from "react";
import { useNavigate,useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";

const STATUSES=["Booked","Checked In","Diagnosing","Waiting Approval","Repair In Progress","Waiting Parts","Quality Check","Completed","Collected","Cancelled"];
const blank={status:"Booked",customer_name:"",customer_phone:"",customer_email:"",rego:"",make:"",model:"",year:"",odometer:"",engine_code:"",transmission:"",customer_concern:"",findings:"",fault_codes:"",diagnosis:"",rectification:"",recommendations:""};

export default function JobEditor(){
  const {id}=useParams();const nav=useNavigate();
  const [form,setForm]=useState<any>(blank);const [message,setMessage]=useState("");const [photos,setPhotos]=useState<any[]>([]);
  useEffect(()=>{if(id&&id!=="new"){supabase.from("job_cards").select("*").eq("id",id).single().then(({data})=>data&&setForm(data));supabase.from("job_photos").select("*").eq("job_id",id).then(({data})=>setPhotos(data||[]))}},[id]);

  async function save(e:FormEvent){e.preventDefault();const payload={...form,year:form.year?Number(form.year):null,odometer:form.odometer?Number(form.odometer):null};const res=id==="new"?await supabase.from("job_cards").insert(payload).select("id").single():await supabase.from("job_cards").update(payload).eq("id",id);if(res.error){setMessage(res.error.message);return}nav("/dashboard/jobs")}
  async function upload(files:FileList|null){if(!files||!id||id==="new"){setMessage("Save the job card before uploading photos.");return}for(const file of Array.from(files)){const path=`${id}/${crypto.randomUUID()}-${file.name}`;const up=await supabase.storage.from("job-photos").upload(path,file);if(!up.error)await supabase.from("job_photos").insert({job_id:id,storage_path:path,caption:file.name})}const {data}=await supabase.from("job_photos").select("*").eq("job_id",id);setPhotos(data||[])}

  return <form className="panel formGrid" onSubmit={save}>
    <h1 className="wide">{id==="new"?"New Job Card":form.job_number}</h1>
    <label>Status<select value={form.status} onChange={e=>setForm({...form,status:e.target.value})}>{STATUSES.map(status=><option key={status}>{status}</option>)}</select></label>
    {["customer_name","customer_phone","customer_email","rego","make","model","year","odometer","engine_code","transmission"].map(k=><label key={k}>{k.replaceAll("_"," ")}<input value={form[k]||""} onChange={e=>setForm({...form,[k]:e.target.value})}/></label>)}
    {["customer_concern","findings","fault_codes","diagnosis","rectification","recommendations"].map(k=><label className="wide" key={k}>{k.replaceAll("_"," ")}<textarea rows={4} value={form[k]||""} onChange={e=>setForm({...form,[k]:e.target.value})}/></label>)}
    <label className="wide">Upload photos<input type="file" multiple accept="image/*" onChange={e=>upload(e.target.files)}/></label>
    <div className="photoGrid wide">{photos.map(p=><div key={p.id} className="photoTile">{p.caption}</div>)}</div>
    <button className="primary wide">Save job card</button>{message&&<p className="notice wide">{message}</p>}
  </form>
}
