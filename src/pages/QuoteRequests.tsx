import { useEffect,useState } from "react";
import { supabase } from "../lib/supabase";
export default function QuoteRequests(){
  const [items,setItems]=useState<any[]>([]);
  useEffect(()=>{supabase.from("quote_requests").select("*").order("created_at",{ascending:false}).then(({data})=>setItems(data||[]))},[]);
  return <section><div className="dashboardHead"><div><span className="eyebrow">Admin only</span><h1>Quote Requests</h1></div></div><div className="list">
    {items.map(x=><article className="listItem" key={x.id}><div><h3>{x.rego} · {x.customer_name}</h3><p>{x.make} {x.model}</p><p>{x.description}</p></div><span>{x.status}</span></article>)}
  </div></section>
}