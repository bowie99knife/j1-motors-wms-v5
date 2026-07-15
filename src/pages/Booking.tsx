import { FormEvent, useEffect, useMemo, useState } from "react";
import { configured, supabase } from "../lib/supabase";

type Availability = Record<string, number>;
const DAILY_LIMIT = 10;
const TIME_SLOTS = ["08:30","09:30","10:30","11:30","13:30","14:30","15:30"];
const SLOT_LIMITS: Availability = {"08:30":2,"09:30":2,"10:30":2,"11:30":1,"13:30":1,"14:30":1,"15:30":1};
const SERVICES = [
  "Logbook Service","Basic Service / Oil Change","General Inspection",
  "Engine Diagnosis","Transmission Diagnosis","Brake Inspection / Repair",
  "Suspension / Steering","Cooling System","Electrical Diagnosis",
  "Air Conditioning","Tyres / Wheel Alignment","Pre-Purchase Inspection",
  "Other Workshop Inspection"
];
const initialDetails = {name:"",phone:"",email:"",rego:"",make:"",model:"",year:"",odometer:"",service:"",description:""};

function formatTime(value:string){
  const [h,m]=value.split(":").map(Number);
  return `${h%12||12}:${String(m).padStart(2,"0")} ${h>=12?"PM":"AM"}`;
}
function demoBookings():any[]{
  try{return JSON.parse(localStorage.getItem("j1_demo_bookings")||"[]")}catch{return[]}
}

export default function Booking(){
  const [step,setStep]=useState<1|2|3>(1);
  const [date,setDate]=useState("");
  const [time,setTime]=useState("");
  const [availability,setAvailability]=useState<Availability>({});
  const [dayCount,setDayCount]=useState(0);
  const [loading,setLoading]=useState(false);
  const [details,setDetails]=useState(initialDetails);
  const [message,setMessage]=useState("");
  const today=useMemo(()=>new Date().toISOString().split("T")[0],[]);

  useEffect(()=>{if(date){setTime("");setStep(2);void loadAvailability(date)}},[date]);

  async function loadAvailability(selectedDate:string){
    setLoading(true);setMessage("");
    if(!configured){
      const rows=demoBookings().filter(x=>x.preferred_date===selectedDate&&x.status!=="Cancelled");
      const counts:Availability={};
      TIME_SLOTS.forEach(slot=>counts[slot]=rows.filter(x=>x.preferred_time===slot).length);
      setAvailability(counts);setDayCount(rows.length);setLoading(false);return;
    }
    const {data,error}=await supabase.rpc("get_booking_availability",{requested_date:selectedDate});
    if(error){setMessage(error.message);setAvailability({});setDayCount(0)}
    else{setAvailability((data?.slots||{}) as Availability);setDayCount(Number(data?.day_count||0))}
    setLoading(false);
  }

  function chooseTime(slot:string){
    if(dayCount>=DAILY_LIMIT||(availability[slot]||0)>=SLOT_LIMITS[slot])return;
    setTime(slot);setStep(3);setMessage("");
  }

  async function submit(event:FormEvent){
    event.preventDefault();
    if(!date||!time||!details.service){setMessage("Please select an available date, time and service.");return}
    setMessage("Submitting…");
    const payload={...details,preferred_date:date,preferred_time:time,year:Number(details.year),odometer:Number(details.odometer)};

    if(!configured){
      const all=demoBookings();
      const sameDay=all.filter(x=>x.preferred_date===date&&x.status!=="Cancelled");
      if(sameDay.length>=DAILY_LIMIT||sameDay.filter(x=>x.preferred_time===time).length>=SLOT_LIMITS[time]){
        setMessage("That time is no longer available. Please choose another time.");setStep(2);await loadAvailability(date);return;
      }
      const ref=crypto.randomUUID();
      all.unshift({id:crypto.randomUUID(),tracking_reference:ref,customer_name:details.name,customer_phone:details.phone,customer_email:details.email,rego:details.rego.toUpperCase(),make:details.make,model:details.model,year:Number(details.year),odometer:Number(details.odometer),preferred_date:date,preferred_time:time,service:details.service,description:details.description,status:"Pending",created_at:new Date().toISOString()});
      localStorage.setItem("j1_demo_bookings",JSON.stringify(all));
      setMessage(`Booking received. Tracking reference: ${ref}`);
    }else{
      const {data,error}=await supabase.rpc("submit_appointment_with_capacity",{payload});
      if(error){setMessage(error.message.toLowerCase().includes("unavailable")?"That time is no longer available. Please choose another time.":error.message);return}
      setMessage(`Booking received. Tracking reference: ${data}`);
    }
    setDetails(initialDetails);setDate("");setTime("");setStep(1);
  }

  const fullyBooked=dayCount>=DAILY_LIMIT;
  return <section>
    <div className="title"><span className="eyebrow">Customer portal</span><h1>Book an appointment</h1></div>
    <div className="bookingSteps">
      {[["Choose date",1],["Choose time",2],["Your details",3]].map(([label,n])=><div key={String(n)} className={step>=Number(n)?"bookingStep active":"bookingStep"}><span>{n}</span><strong>{label}</strong></div>)}
    </div>
    <div className="panel bookingPanel">
      <section className="bookingSection">
        <div className="bookingSectionHead"><div><span className="eyebrow">Step 1</span><h2>Select a date</h2></div>{date&&<button className="secondary compact" type="button" onClick={()=>{setDate("");setTime("");setStep(1)}}>Change date</button>}</div>
        <input className="datePicker" type="date" min={today} value={date} onChange={e=>setDate(e.target.value)}/>
      </section>

      {date&&<section className="bookingSection">
        <div className="bookingSectionHead"><div><span className="eyebrow">Step 2</span><h2>Select an available time</h2></div></div>
        {loading?<p className="notice">Checking availability…</p>:fullyBooked?<p className="notice">No appointments are available on this date. Please choose another date.</p>:
        <div className="timeGrid">{TIME_SLOTS.map(slot=>{const full=(availability[slot]||0)>=SLOT_LIMITS[slot];return <button key={slot} type="button" disabled={full} className={`timeSlot ${time===slot?"selected":""}`} onClick={()=>chooseTime(slot)}><strong>{formatTime(slot)}</strong><small>{full?"Unavailable":"Available"}</small></button>})}</div>}
      </section>}

      {date&&time&&step===3&&<form className="bookingSection formGrid" onSubmit={submit}>
        <div className="bookingSectionHead wide"><div><span className="eyebrow">Step 3</span><h2>Enter your details</h2><p className="selectedAppointment">{date} · {formatTime(time)}</p></div><button className="secondary compact" type="button" onClick={()=>{setTime("");setStep(2)}}>Change time</button></div>
        {[["name","Full name"],["phone","Phone"],["email","Email"],["rego","Registration"],["make","Make"],["model","Model"],["year","Year"],["odometer","Odometer"]].map(([key,label])=><label key={key}>{label}<input required={key!=="email"} type={key==="phone"?"tel":key==="email"?"email":"text"} value={(details as any)[key]} onChange={e=>setDetails({...details,[key]:e.target.value})}/></label>)}
        <label className="wide">Service required<select required value={details.service} onChange={e=>setDetails({...details,service:e.target.value})}><option value="">Choose a service</option>{SERVICES.map(service=><option key={service} value={service}>{service}</option>)}</select></label>
        <label className="wide">Customer concern<textarea rows={5} required value={details.description} onChange={e=>setDetails({...details,description:e.target.value})}/></label>
        <button className="primary wide">Submit booking</button>
      </form>}
      {message&&<p className="notice bookingMessage">{message}</p>}
    </div>
  </section>
}
