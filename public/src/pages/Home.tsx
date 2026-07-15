import { Link } from "react-router-dom";
export default function Home() {
  return (
    <>
      <section className="hero professionalHero">
        <div>
          <span className="eyebrow">All cars. All work. All purpose.</span>
          <h1>J1 Motors<br/><em>Car Repairs</em></h1>
          <p>Professional workmanship. Honest service. Your car, our passion.</p>
          <div className="actions">
            <Link className="primary" to="/book">Book appointment</Link>
            <Link className="secondary" to="/quote">Request quotation</Link>
          </div>
        </div>
        <aside className="glassCard">
          <h2>Workshop Hours</h2>
          <strong>8:30 AM–5:00 PM</strong>
          <p>Monday to Friday</p>
          <hr/>
          <p>193 Campbell St, Belmont WA 6104</p>
        </aside>
      </section>
      <section className="featureGrid">
        <article><h3>All Cars</h3><p>All makes and models welcome.</p></article>
        <article><h3>All Work</h3><p>Repairs, diagnostics and servicing.</p></article>
        <article><h3>Customer First</h3><p>Clear communication and honest advice.</p></article>
      </section>
    </>
  );
}