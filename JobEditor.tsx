import { useEffect,useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function Bookings(){
  const [items,setItems]=useState<any[]>([]);
  const [message,setMessage]=useState("");
  useEffect(()=>{supabase.from("appointments").select("*").order("preferred_date",{ascending:true}).order("preferred_time",{ascending:true}).then(({data,error})=>{if(error)setMessage(error.message);setItems(data||[])})},[]);
  return <section>
    <div className="dashboardHead"><div><span className="eyebrow">Workshop</span><h1>Bookings</h1></div></div>
    {message&&<p className="notice">{message}</p>}
    <div className="list">
      {items.map(x=><article className="listItem" key={x.id}>
        <div><h3>{x.preferred_date} · {String(x.preferred_time).slice(0,5)} · {x.rego}</h3><p>{x.customer_name} · {x.make} {x.model}</p><p><strong>Service:</strong> {x.service||"Not specified"}</p><span className="badge">{x.status}</span></div>
        <Link className="secondary" to={`/dashboard/bookings/${x.id}`}>Open booking</Link>
      </article>)}
      {!items.length&&!message&&<div className="panel empty">No bookings found.</div>}
    </div>
  </section>
}
