import { FormEvent,useEffect,useState } from "react";
import { Link,useNavigate,useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";

const STATUSES=["Pending","Confirmed","Checked In","Converted to Job Card","Completed","Cancelled"];

export default function BookingDetails(){
  const {id}=useParams();
  const navigate=useNavigate();
  const [booking,setBooking]=useState<any>(null);
  const [message,setMessage]=useState("");
  const [saving,setSaving]=useState(false);

  useEffect(()=>{if(id)supabase.from("appointments").select("*").eq("id",id).single().then(({data,error})=>error?setMessage(error.message):setBooking(data))},[id]);

  async function save(event:FormEvent){
    event.preventDefault();if(!booking||!id)return;
    setSaving(true);setMessage("");
    const {error}=await supabase.from("appointments").update({preferred_date:booking.preferred_date,preferred_time:booking.preferred_time,description:booking.description,status:booking.status}).eq("id",id);
    setSaving(false);setMessage(error?error.message:"Booking updated successfully.");
  }

  async function createJob(){
    if(!booking)return;
    const {data,error}=await supabase.from("job_cards").insert({status:"Booked",customer_name:booking.customer_name,customer_phone:booking.customer_phone,customer_email:booking.customer_email,rego:booking.rego,make:booking.make,model:booking.model,year:booking.year,odometer:booking.odometer,customer_concern:`${booking.service}\n\n${booking.description}`}).select("id").single();
    if(error){setMessage(error.message);return}
    await supabase.from("appointments").update({status:"Converted to Job Card"}).eq("id",booking.id);
    navigate(`/dashboard/jobs/${data.id}`);
  }

  if(!booking)return <div className="panel">{message||"Loading booking…"}</div>;

  return <form className="panel formGrid" onSubmit={save}>
    <div className="bookingSectionHead wide"><div><span className="eyebrow">Booking file</span><h1>{booking.rego} · {booking.customer_name}</h1></div><Link className="secondary compact" to="/dashboard/bookings">Back</Link></div>
    <label>Booking status<select value={booking.status} onChange={e=>setBooking({...booking,status:e.target.value})}>{STATUSES.map(status=><option key={status}>{status}</option>)}</select></label>
    <label>Appointment date<input type="date" value={booking.preferred_date} onChange={e=>setBooking({...booking,preferred_date:e.target.value})}/></label>
    <label>Appointment time<input type="time" value={String(booking.preferred_time).slice(0,5)} onChange={e=>setBooking({...booking,preferred_time:e.target.value})}/></label>
    <label>Service<input value={booking.service||""} readOnly/></label>
    <label>Customer name<input value={booking.customer_name} readOnly/></label>
    <label>Phone<input value={booking.customer_phone} readOnly/></label>
    <label>Email<input value={booking.customer_email||""} readOnly/></label>
    <label>Registration<input value={booking.rego} readOnly/></label>
    <label>Vehicle<input value={`${booking.make} ${booking.model}`} readOnly/></label>
    <label>Year<input value={booking.year||""} readOnly/></label>
    <label>Odometer<input value={booking.odometer||""} readOnly/></label>
    <label className="wide">Customer concern<textarea rows={6} value={booking.description} onChange={e=>setBooking({...booking,description:e.target.value})}/></label>
    <div className="wide bookingActions"><button className="primary" disabled={saving}>{saving?"Saving…":"Save booking"}</button><button className="secondary" type="button" onClick={createJob}>Create job card</button></div>
    {message&&<p className="notice wide">{message}</p>}
  </form>
}
