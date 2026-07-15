import { Routes,Route } from "react-router-dom";
import { supabaseConfigured } from "./lib/supabase";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleGuard from "./components/RoleGuard";
import Home from "./pages/Home";
import Booking from "./pages/Booking";
import Quote from "./pages/Quote";
import Tracking from "./pages/Tracking";
import StaffLogin from "./pages/StaffLogin";
import Dashboard from "./pages/Dashboard";
import Jobs from "./pages/Jobs";
import JobEditor from "./pages/JobEditor";
import Bookings from "./pages/Bookings";
import BookingDetails from "./pages/BookingDetails";
import QuoteRequests from "./pages/QuoteRequests";
import Revenue from "./pages/Revenue";
import StaffManagement from "./pages/StaffManagement";

export default function App(){
  return <>
    {!supabaseConfigured&&<div style={{background:"#f7c948",color:"#111",padding:"10px 16px",textAlign:"center",fontWeight:800}}>Website preview mode: cloud database is not connected yet.</div>}
    <Routes><Route element={<Layout/>}>
      <Route index element={<Home/>}/><Route path="/book" element={<Booking/>}/><Route path="/quote" element={<Quote/>}/><Route path="/track" element={<Tracking/>}/><Route path="/staff" element={<StaffLogin/>}/>
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard/></ProtectedRoute>}/>
      <Route path="/dashboard/bookings" element={<ProtectedRoute><Bookings/></ProtectedRoute>}/>
      <Route path="/dashboard/bookings/:id" element={<ProtectedRoute><BookingDetails/></ProtectedRoute>}/>
      <Route path="/dashboard/jobs" element={<ProtectedRoute><Jobs/></ProtectedRoute>}/>
      <Route path="/dashboard/jobs/:id" element={<ProtectedRoute><JobEditor/></ProtectedRoute>}/>
      <Route path="/dashboard/quotes" element={<ProtectedRoute><RoleGuard allowed={["admin"]}><QuoteRequests/></RoleGuard></ProtectedRoute>}/>
      <Route path="/dashboard/revenue" element={<ProtectedRoute><RoleGuard allowed={["admin"]}><Revenue/></RoleGuard></ProtectedRoute>}/>
      <Route path="/dashboard/staff" element={<ProtectedRoute><RoleGuard allowed={["admin"]}><StaffManagement/></RoleGuard></ProtectedRoute>}/>
    </Route></Routes>
  </>
}
