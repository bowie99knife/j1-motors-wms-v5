import { MapPin } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";
import { useSession } from "../lib/useSession";
import { LanguageSelector } from "../lib/i18n";

const mapUrl = "https://www.google.com/maps/search/?api=1&query=193+Campbell+St%2C+Belmont+WA+6104";

export default function Layout() {
  const { profile } = useSession();
  return (
    <>
      <header className="topbar">
        <NavLink to="/" className="brand">
          <img className="officialLogo" src="/j1-logo-header.jpg" alt="J1 Motors Car Repairs" />
        </NavLink>
        <nav>
          <NavLink to="/">Home</NavLink>
          <NavLink to="/book">Book</NavLink>
          <NavLink to="/quote">Quotation</NavLink>
          <NavLink to="/track">Track</NavLink>
          <a href={mapUrl} target="_blank" rel="noreferrer"><MapPin size={16}/> Location</a>
          <LanguageSelector />
          <NavLink to={profile ? "/dashboard" : "/staff"}>{profile ? profile.full_name : "Staff"}</NavLink>
        </nav>
      </header>
      <main className="page"><Outlet /></main>
      <footer>J1 Motors Car Repairs · 193 Campbell St, Belmont WA 6104 · MRB 7269 · WMS V5</footer>
    </>
  );
}