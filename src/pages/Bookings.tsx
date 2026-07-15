import { useEffect,useState } from "react";
import { supabase } from "../lib/supabase";
export default function Bookings(){
  const [items,setItems]=useState<any[]>([]);
  useEffect(()=>{supabase.from("appointments").select("*").order("created_at",{ascending:false}).then(({data})=>setItems(data||[]))},[]);
  return <section><div className="dashboardHead"><div><span className="eyebrow">Workshop</span><h1>Bookings</h1></div></div>
    <div className="list">{items.map(x=><article className="listItem" key={x.id}><div><h3>{x.preferred_date} · {x.rego}</h3><p>{x.customer_name} · {x.make} {x.model}</p><p>{x.description}</p></div><span>{x.status}</span></article>)}</div>
  </section>
}