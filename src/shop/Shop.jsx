import { useEffect, useRef, useState } from 'react'
import { useLenis } from '../hooks/useLenis'
import { Line, Micro } from '../components/type'
import { WHATSAPP } from '../components/links'
import { CATEGORIES, PRODUCTS, money, product } from './catalog'
import { useCart } from './cart'

/* ─── Catalog ───────────────────────────────────────────────────────────── */

function ProductTile({ p, n }) {
  const { add, setBagOpen, setViewing } = useCart()
  return (
    <li className={`product${p.id === 'blue' ? ' product--hero' : ''}`}>
      <div className="product__media">
        <button type="button" className="product__open" onClick={() => setViewing(p.id)} aria-label={`View ${p.name}`}>
          <img src={p.photo} alt={`${p.name}, ${p.colour}`} loading="lazy" width="800" height="1000" />
        </button>
        <span className="product__index">{String(n).padStart(2, '0')}</span>
        {p.tag && <span className="product__tag">{p.tag}</span>}
        {/* hover quick-add (pointer devices); touch opens the product view */}
        <div className="product__quick" role="group" aria-label={`Quick add ${p.name}, choose a size`}>
          <span className="product__quick-label">Quick add · EU</span>
          <div className="product__quick-sizes">
            {p.sizes.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => {
                  add(p.id, s)
                  setBagOpen(true)
                }}
                aria-label={`Add ${p.name}, EU ${s}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="product__info">
        <h3 className="product__name">
          <button type="button" onClick={() => setViewing(p.id)}>
            {p.name}
          </button>
        </h3>
        <span className="product__price">{money(p.price)}</span>
        <span className="product__colour">
          <i style={{ background: p.swatch }} aria-hidden="true" />
          {p.colour}
        </span>
      </div>
    </li>
  )
}

export function Catalog() {
  const [cat, setCat] = useState('All')
  const items = PRODUCTS.map((p, i) => ({ p, n: i + 1 })).filter(({ p }) => cat === 'All' || p.category === cat)
  return (
    <section className="shop" id="shop" aria-label="Shop the range">
      <header className="shop__head">
        <span className="chapter__num">#05</span>
        <p className="chapter__kicker">Shop</p>
        <h2 className="display shop__title">
          <Line text="THE [img:blue]" />
          <Line text="RANGE" />
        </h2>
        <Micro className="shop__intro">
          Five styles, made in our own production in India. Suede, nylon, metallic and burnished leathers on gum, foam and
          rubber soles — every pair you see spinning above, ready to order.
        </Micro>
        <div className="shop__filters" role="group" aria-label="Filter by category">
          {CATEGORIES.map((c) => (
            <button key={c} type="button" aria-pressed={cat === c} onClick={() => setCat(c)}>
              {c}
              <sup>{c === 'All' ? PRODUCTS.length : PRODUCTS.filter((p) => p.category === c).length}</sup>
            </button>
          ))}
        </div>
      </header>
      <ul className={`shop__grid${cat === 'All' ? '' : ' shop__grid--filtered'}`}>
        {items.map(({ p, n }) => (
          <ProductTile key={p.id} p={p} n={n} />
        ))}
      </ul>
    </section>
  )
}

/* ─── Overlays ──────────────────────────────────────────────────────────── */

/** A native modal <dialog> driven by `open`; Esc and backdrop clicks call onClose. */
function Modal({ open, onClose, className, label, children }) {
  const ref = useRef()
  useEffect(() => {
    const d = ref.current
    if (open && !d.open) d.showModal()
    if (!open && d.open) d.close()
  }, [open])
  return (
    <dialog
      ref={ref}
      className={className}
      aria-label={label}
      // a close event can land after a quick reopen: only sync state if it's really shut
      onClose={() => !ref.current.open && onClose()}
      onClick={(e) => e.target === ref.current && onClose()}
      data-lenis-prevent
    >
      {children}
    </dialog>
  )
}

function Qty({ value, onChange, label }) {
  return (
    <div className="qty" role="group" aria-label={label}>
      <button type="button" onClick={() => onChange(value - 1)} aria-label="Decrease quantity">
        −
      </button>
      <span aria-live="polite">{value}</span>
      <button type="button" onClick={() => onChange(value + 1)} aria-label="Increase quantity" disabled={value >= 9}>
        +
      </button>
    </div>
  )
}

function ProductView() {
  const { viewing, setViewing, add, setBagOpen } = useCart()
  const p = viewing && product(viewing)
  const [size, setSize] = useState(null)
  const [qty, setQty] = useState(1)
  const [nudge, setNudge] = useState(false)
  useEffect(() => {
    setSize(null)
    setQty(1)
    setNudge(false)
  }, [viewing])
  const close = () => setViewing(null)

  return (
    <Modal open={!!p} onClose={close} className="pview" label={p?.name ?? 'Product'}>
      {p && (
        <div className="pview__inner">
          <img className="pview__img" src={p.photo} alt={`${p.name}, ${p.colour}`} width="800" height="1000" />
          <div className="pview__body">
            <button type="button" className="overlay__close" onClick={close} aria-label="Close">
              ×
            </button>
            <p className="chapter__kicker">{p.category}</p>
            <h2 className="pview__name">{p.name}</h2>
            <p className="pview__price">{money(p.price)}</p>
            <p className="product__colour">
              <i style={{ background: p.swatch }} aria-hidden="true" />
              {p.colour}
            </p>
            <p className="pview__blurb">{p.blurb}</p>

            <fieldset className={`sizes${nudge ? ' sizes--nudge' : ''}`}>
              <legend>Size · EU</legend>
              {p.sizes.map((s) => (
                <button key={s} type="button" aria-pressed={size === s} onClick={() => (setSize(s), setNudge(false))}>
                  {s}
                </button>
              ))}
            </fieldset>
            {nudge && <p className="sizes__hint" role="alert">Choose a size first</p>}

            <div className="pview__buy">
              <Qty value={qty} onChange={(q) => setQty(Math.max(1, Math.min(9, q)))} label="Quantity" />
              <button
                type="button"
                className="btn btn--solid"
                onClick={() => {
                  if (!size) return setNudge(true)
                  add(p.id, size, qty)
                  close()
                  setBagOpen(true)
                }}
              >
                Add to bag · {money(p.price * qty)}
              </button>
            </div>

            <ul className="pview__details">
              {p.details.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </Modal>
  )
}

/**
 * No payment backend yet: checkout hands the order to Rovar on WhatsApp.
 * Swap `checkoutUrl` for a Shopify / Stripe Checkout session when one exists.
 */
function checkoutUrl(lines, subtotal) {
  const rows = lines.map((l) => {
    const p = product(l.id)
    return `• ${p.name} (${p.colour}) — EU ${l.size} × ${l.qty} — ${money(p.price * l.qty)}`
  })
  const text = ["Hi Rovar, I'd like to order:", ...rows, `Subtotal: ${money(subtotal)}`].join('\n')
  return `${WHATSAPP}?text=${encodeURIComponent(text)}`
}

function Bag() {
  const { lines, count, subtotal, setQty, bagOpen, setBagOpen } = useCart()
  const close = () => setBagOpen(false)
  return (
    <Modal open={bagOpen} onClose={close} className="bag" label="Your bag">
      <div className="bag__inner">
        <header className="bag__head">
          <h2>
            Bag <sup>{count}</sup>
          </h2>
          <button type="button" className="overlay__close" onClick={close} aria-label="Close bag">
            ×
          </button>
        </header>

        {lines.length === 0 ? (
          <div className="bag__empty">
            <p>Your bag is empty.</p>
            <a className="btn" href="#shop" onClick={close}>
              Shop the range
            </a>
          </div>
        ) : (
          <>
            <ul className="bag__lines">
              {lines.map((l) => {
                const p = product(l.id)
                return (
                  <li key={`${l.id}-${l.size}`} className="bag__line">
                    <img src={p.photo} alt="" width="80" height="100" />
                    <div>
                      <p className="bag__name">{p.name}</p>
                      <p className="bag__meta">
                        {p.colour} · EU {l.size}
                      </p>
                      <div className="bag__row">
                        <Qty value={l.qty} onChange={(q) => setQty(l.id, l.size, q)} label={`Quantity of ${p.name}, EU ${l.size}`} />
                        <button type="button" className="bag__remove" onClick={() => setQty(l.id, l.size, 0)}>
                          Remove
                        </button>
                      </div>
                    </div>
                    <span className="bag__price">{money(p.price * l.qty)}</span>
                  </li>
                )
              })}
            </ul>
            <footer className="bag__foot">
              <div className="bag__total">
                <span>Subtotal</span>
                <strong>{money(subtotal)}</strong>
              </div>
              <p className="micro">Delivery calculated with your order. We confirm stock, sizing and delivery on WhatsApp.</p>
              <a className="btn btn--solid" href={checkoutUrl(lines, subtotal)} target="_blank" rel="noreferrer">
                Checkout
              </a>
              <button type="button" className="btn" onClick={close}>
                Continue shopping
              </button>
            </footer>
          </>
        )}
      </div>
    </Modal>
  )
}

/** The bag pill in the fixed nav. */
export function BagButton() {
  const { count, setBagOpen } = useCart()
  return (
    <button type="button" className="chrome__bag" onClick={() => setBagOpen(true)} aria-label={`Bag, ${count} item${count === 1 ? '' : 's'}`}>
      BAG <span>{count}</span>
    </button>
  )
}

/** Product view + bag drawer; pauses smooth scroll while either is open. */
export function ShopOverlays() {
  const { bagOpen, viewing } = useCart()
  const lenis = useLenis()
  const open = bagOpen || !!viewing
  useEffect(() => {
    if (!lenis || !open) return
    lenis.stop()
    return () => lenis.start()
  }, [lenis, open])
  return (
    <>
      <ProductView />
      <Bag />
    </>
  )
}
