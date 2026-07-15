import { useEffect,useState } from "react";
import { supabase } from "../lib/supabase";
export default function Revenue(){
  const [stats,setStats]=useState<any>({});
  useEffect(()=>{supabase.rpc("admin_revenue_stats").then(({data})=>setStats(data||{}))},[]);
  return <section><div className="dashboardHead"><div><span className="eyebrow">Admin only</span><h1>Revenue</h1></div></div>
    <div className="stats">{Object.entries(stats).map(([k,v])=><article key={k}><strong>{String(v)}</strong><span>{k.replaceAll("_"," ")}</span></article>)}</div>
  </section>
}