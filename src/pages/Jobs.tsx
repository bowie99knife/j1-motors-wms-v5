import { useEffect,useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
export default function Jobs(){
  const [jobs,setJobs]=useState<any[]>([]);
  async function loadJobs(){const {data}=await supabase.from("job_cards").select("*").order("updated_at",{ascending:false});setJobs(data||[])}
  useEffect(()=>{loadJobs();const c=supabase.channel("jobcards").on("postgres_changes",{event:"*",schema:"public",table:"job_cards"},loadJobs).subscribe();return()=>{supabase.removeChannel(c)}},[]);
  return <section><div className="dashboardHead"><div><span className="eyebrow">Workshop</span><h1>Job Cards</h1></div><Link className="primary" to="/dashboard/jobs/new">New job</Link></div>
    <div className="list">{jobs.map(j=><article className="listItem" key={j.id}><div><h3>{j.job_number} · {j.rego}</h3><p>{j.customer_name} · {j.make} {j.model}</p><span>{j.status}</span></div><Link className="secondary" to={`/dashboard/jobs/${j.id}`}>Open</Link></article>)}</div>
  </section>
}