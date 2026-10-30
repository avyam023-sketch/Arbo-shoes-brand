import { useMemo, useState } from 'react'
import { Line, Micro, photo } from './type'
import { LINKEDIN, PRIVACY, TERMS, WHATSAPP } from './links'
import { BagButton, AccountButton, Catalog } from '../shop/Shop'

/* ─── Small building blocks ─────────────────────────────────────────────── */

function Barcode({ seed = 7 }) {
  const bars = useMemo(() => {
    let x = seed
    return Array.from({ length: 38 }, () => {
      x = (x * 9301 + 49297) % 233280
      return 1 + Math.floor((x / 233280) * 3)
    })
  }, [seed])
  return (
    <span className="barcode" aria-hidden="true">
      {bars.map((w, i) => (
        <i key={i} style={{ width: w, marginRight: i % 3 ? 1 : 2 }} />
      ))}
    </span>
  )
}

/** Product card the chapter shoe drops into, then collapses to a tiny box. */
function Card({ n, title, items }) {
  const num = `#${String(n).padStart(2, '0')}`
  return (
    <section className="card-pin" id={`card${n}`} aria-label={title}>
      <div className="card">
        <span className="card__num">{num}</span>
        <span className="card__vertical">{title}</span>
        <div className="card__slot" />
        <div className="card__spec">
          <Barcode seed={n * 13} />
          <ul className="card__list">
            {items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
      <div className="card__mini">{num}</div>
    </section>
  )
}

function Subscribe() {
  const [sent, setSent] = useState(false)
  if (sent) return <p className="micro is-sent">✓ YOU ARE ON THE PRIVATE ARBO ARCHIVE LIST</p>
  return (
    <form
      className="subscribe"
      onSubmit={(e) => {
        e.preventDefault()
        setSent(true)
      }}
    >
      <label className="sr-only" htmlFor="sub-email">
        Email
      </label>
      <input id="sub-email" type="email" required placeholder="JOIN THE ARCHIVE (EMAIL)" autoComplete="email" />
      <button type="submit">JOIN</button>
    </form>
  )
}

/* ─── Fixed Floating Oval Navbar ────────────────────────────────────────── */

export function Chrome() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  return (
    <header className="chrome" aria-label="Site Navigation">
      <a className="skip" href="#about">
        Skip to content
      </a>

      {/* Floating Oval Navbar with White Outlining */}
      <div className="floating-navbar">
        {/* Brand identity on left */}
        <a className="navbar__brand" href="#hero" aria-label="ARBO Home" onClick={() => setMobileNavOpen(false)}>
          <img src={`${import.meta.env.BASE_URL}photos/arbo-logo.png`} alt="ARBO" className="navbar__logo" />
          <span className="navbar__brand-name">ARBO</span>
        </a>

        {/* Center navigation links with outlined pills */}
        <nav className={`navbar__links ${mobileNavOpen ? 'is-open' : ''}`} aria-label="Primary">
          <a href="#hero" className="nav-pill" onClick={() => setMobileNavOpen(false)}>
            HOME
          </a>
          <a href="#ch1" className="nav-pill" onClick={() => setMobileNavOpen(false)}>
            COLLECTION
          </a>
          <a href="#shop" className="nav-pill" onClick={() => setMobileNavOpen(false)}>
            SHOP
          </a>
          <a href="#about" className="nav-pill" onClick={() => setMobileNavOpen(false)}>
            STUDIO
          </a>
        </nav>

        {/* Action pills on right */}
        <div className="navbar__actions">
          <AccountButton />
          <BagButton />
          {/* Mobile hamburger toggle */}
          <button
            type="button"
            className={`navbar__toggle ${mobileNavOpen ? 'is-active' : ''}`}
            onClick={() => setMobileNavOpen((prev) => !prev)}
            aria-label="Toggle Navigation Menu"
            aria-expanded={mobileNavOpen}
          >
            <span className="toggle-bar"></span>
            <span className="toggle-bar"></span>
          </button>
        </div>
      </div>
    </header>
  )
}

/* ─── The page ───────────────────────────────────────────────────────────── */

export function Site() {
  return (
    <main className="site" id="main">
      {/* HERO — shoes fall in around the wordmark, then the title rises */}
      <section className="hero" id="hero" aria-label="ARBO Footwear">
        <p className="hero__wordmark">
          <span className="loader-count" aria-live="polite">
            000%
          </span>
          <span className="hero__wordmark-text">ARBO · ARCHITECTURAL FOOTWEAR</span>
        </p>
        <h1 className="hero__title display">
          <Line text="ARBO" />
          <Line text="ARCHIVE" />
        </h1>
        <p className="hero__sub">
          <Line text="Pure Architectural Form · Luxury Leather Goods" />
        </p>
        <Micro className="hero__para">Engineered in London · Handcrafted with Full-Grain Italian Leathers</Micro>
      </section>

      {/* ABOUT — justified caps, the hero tumbles behind it */}
      <section className="statement" id="about" aria-label="About ARBO">
        <p className="statement__text">
          ARBO IS AN ARCHITECTURAL LUXURY FOOTWEAR ATELIER BRIDGING MINIMALIST{' '}
          <img className="inline-photo" src={photo('blue')} alt="" /> MONOCHROME GEOMETRY AND BESPOKE HERITAGE CRAFT.
        </p>
        <div className="cols cols--3">
          <Micro>
            01 / MONOCHROME SILHOUETTES: WE STRIP FOOTWEAR TO ITS PURE STRUCTURAL ESSENCE. SCULPTED VOLUMES, AERODYNAMIC
            PROFILES, AND UNCOMPROMISING TONAL DEPTH.
          </Micro>
          <Micro>
            02 / MATERIAL PRECISION: SOURCED FROM WORLD-CLASS TANNERIES, OUR LEATHERS ARE COMPLEMENTED BY ERGONOMIC FOAM
            CUPSOLES AND SHOCK-ABSORBING VULCANIZED RUBBERS.
          </Micro>
          <Micro>
            03 / CONCIERGE COMMERCE: DIRECT-TO-CLIENT COMMERCE WITH GLOBAL TRACKED AIR DISPATCH, 256-BIT ENCRYPTED
            SETTLEMENTS, AND ARCHIVAL COLLECTOR PRIVILEGES.
          </Micro>
        </div>
      </section>

      {/* #01 — PRODUCTS: KIDS' & ADULT FOOTWEAR (blue trainer) */}
      <section className="chapter chapter--center" id="ch1" aria-label="Silhouettes">
        <p className="chapter__kicker">SILHOUETTES</p>
        <h2 className="display chapter__title">
          <Line text="RETRO [img:blue]" />
          <Line text="ARCHIVE" />
        </h2>
        <div className="cols cols--3 chapter__cols">
          <Micro>
            The foundation of our catalog: architectural silhouettes engineered for ergonomic comfort across every step of
            the daily journey.
          </Micro>
          <Micro>
            Constructed with brushed powder-blue suede, technical nylon quarters, and high-rebound gum soles. Double-stitched
            overlays ensure enduring structural poise.
          </Micro>
          <Micro>
            Each pair is individually numbered and accompanied by archival dust covers and dual tonal laces.
          </Micro>
        </div>
      </section>
      <Card n={1} title="Retro Trainer" items={['Brushed Suede', 'Technical Nylon', 'Gum Rubber Cupsole', 'Dual Laces']} />

      {/* #02 — WHY CHOOSE ARBO (mustard court) */}
      <section className="chapter chapter--left" id="ch2" aria-label="Why ARBO">
        <div className="tag">
          <strong>#02</strong>
        </div>
        <h2 className="display chapter__title">
          <Line text="WHY" />
          <Line text="[img:mustard] CHOOSE" />
          <Line text="ARBO" />
        </h2>
        <p className="shout">
          Sculpted with rigorous mathematical precision. Backed by world-class ateliers delivering unprecedented comfort
          and sculptural purity.
        </p>
        <div className="cols cols--2 chapter__cols">
          <div>
            <h3 className="col-title">Atelier Craftsmanship</h3>
            <Micro>
              Our design team approaches footwear as wearable brutalist sculpture. Every curve, stitch density, and sole
              tread pattern undergoes rigorous prototype stress-testing.
            </Micro>
          </div>
          <div>
            <h3 className="col-title">Exceptional Raw Materials</h3>
            <Micro>
              From hand-buffed calfskin to high-rebound orthotic footbeds, we refuse synthetic shortcuts. We build footwear
              destined to patina with grace over years of wear.
            </Micro>
          </div>
        </div>
      </section>
      <Card
        n={2}
        title="Court Silhouette"
        items={['Brushed Suede', 'Sand Mesh', 'Slim Rubber Tread', 'Tonal Piping']}
      />

      {/* #03 — marquee (gold terrace) */}
      <section
        className="chapter chapter--marquee"
        id="ch3"
        aria-label="Obsessive Geometry & Pure Monochrome Form"
      >
        <span className="chapter__num">#03</span>
        <h2 className="marquee">
          <span className="marquee__track display">
            {[0, 1].map((k) => (
              <span key={k} aria-hidden={k === 1}>
                OBSESSIVE GEOMETRY <img className="inline-photo" src={photo('gold')} alt="" /> PURE ARCHITECTURAL FORM
                <svg className="marquee__sep" viewBox="0 0 10 10" aria-hidden="true">
                  <path d="M1 1 9 9M9 1 1 9" />
                </svg>
              </span>
            ))}
          </span>
        </h2>
        <div className="cols cols--2 chapter__cols">
          <div>
            <h3 className="col-title">Limited Archival Drops</h3>
            <Micro>
              Produced in strictly capped small batches to eliminate waste and guarantee unrivaled quality control across
              every individual shoe.
            </Micro>
          </div>
          <div>
            <h3 className="col-title">Integrated Global Network</h3>
            <Micro>
              Commercial presence in London with direct rapid fulfillment across the United Kingdom, Europe, North
              America, and Asia via express priority air.
            </Micro>
          </div>
        </div>
      </section>
      <Card
        n={3}
        title="Gold Terrace"
        items={['Metallic Finish', 'Suede T-Toe', 'Sawtooth Sole', 'Waxed Lacing']}
      />

      {/* #04 — GLOBAL SHIPPING (cloud runner) */}
      <section className="chapter chapter--right" id="ch4" aria-label="Worldwide Express & Bespoke Packaging">
        <div className="tag">
          <strong>#04</strong>
        </div>
        <h2 className="display chapter__title">
          <Line text="WORLDWIDE [img:runner]" />
          <Line text="LOGISTICS" />
        </h2>
        <div className="cols cols--2 chapter__cols">
          <div>
            <h3 className="col-title">Global Priority Air</h3>
            <Micro>
              Tracked door-to-door delivery with transparent customs handling and SMS notifications from departure to
              signature.
            </Micro>
          </div>
          <div>
            <h3 className="col-title">Bespoke Monolith Packaging</h3>
            <Micro>
              Housed in signature matte-black rigid archival boxes with embossed monochrome seal, protective dust sleeves,
              and authenticity certificate.
            </Micro>
          </div>
        </div>
      </section>
      <Card n={4} title="Cloud Runner" items={['Engineered Mesh', 'Reflective Flash', 'Cushioned Foam', 'Impact Sole']} />

      {/* THE ARBO EXPERIENCE — every shoe falls back in, then flies off for the shop */}
      <section className="contact" id="contact" aria-label="The ARBO Atelier">
        <h2 className="display contact__title">
          <Line text="THE ARBO" />
          <Line text="EXPERIENCE" />
        </h2>
        <Micro className="contact__para">
          Step into architectural luxury footwear. From bespoke material sourcing to effortless encrypted digital checkout,
          ARBO stands at the frontier of modern design.
        </Micro>
      </section>

      {/* SHOP — the online catalog */}
      <Catalog />

      <footer className="footer" id="footer">
        <div className="footer__brand-col">
          <img src={`${import.meta.env.BASE_URL}photos/arbo-logo.png`} alt="ARBO" className="footer__logo" />
          <p className="micro footer__bio">
            Architectural luxury footwear designed in London. Engineered with brutalist form and uncompromising material integrity.
          </p>
        </div>
        <div>
          <h3>Client Concierge</h3>
          <a href="#shop">Online Collection</a>
          <a href="#about">Studio Philosophy</a>
          <a href={WHATSAPP} target="_blank" rel="noreferrer">
            VIP Whatsapp Atelier
          </a>
          <a href={LINKEDIN} target="_blank" rel="noreferrer">
            Corporate Relations
          </a>
        </div>
        <div>
          <h3>Client Archive</h3>
          <a href={PRIVACY}>Privacy Policy</a>
          <a href={TERMS}>Terms of Service</a>
          <a href="#shop">Global Shipping &amp; Returns</a>
          <a href="#shop">Size Guide (EU / US / UK)</a>
        </div>
        <div>
          <h3>Private Archive Access</h3>
          <p className="micro">Receive invitations to private silhouette releases and archival exhibitions.</p>
          <Subscribe />
        </div>
        <p className="footer__copy">
          COPYRIGHT © 2026 ARBO FOOTWEAR LTD. ALL RIGHTS RESERVED. | <a href={PRIVACY}>LEGAL NOTICE</a>
        </p>
      </footer>
    </main>
  )
}
