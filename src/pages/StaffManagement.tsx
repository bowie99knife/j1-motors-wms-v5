import { useEffect,useState } from "react";
import { supabase } from "../lib/supabase";
export default function StaffManagement(){
  const [staff,setStaff]=useState<any[]>([]);
  useEffect(()=>{supabase.from("profiles").select("*").order("staff_id").then(({data})=>setStaff(data||[]))},[]);
  return <section><div className="dashboardHead"><div><span className="eyebrow">Admin only</span><h1>Staff Management</h1></div></div>
    <div className="list">{staff.map(s=><article className="listItem" key={s.id}><div><h3>{s.staff_id} · {s.full_name}</h3><p>{s.role.replaceAll("_"," ")}</p></div><span>{s.active?"Active":"Disabled"}</span></article>)}</div>
  </section>
}