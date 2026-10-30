import { useEffect, useMemo, useState } from 'react'
import { useCart } from './cart'
import { money, product } from './catalog'
import { useAuth } from '../auth/AuthContext'

export function CheckoutModal({ open, onClose }) {
  const { lines, subtotal, clear } = useCart()
  const { user, addOrder, openAccount, signup } = useAuth()

  // Steps: 'address' -> 'payment' -> 'processing' -> 'success'
  const [step, setStep] = useState('address')
  const [processingState, setProcessingState] = useState('Securing TLS 1.3 connection...')

  // Promo code
  const [promoCode, setPromoCode] = useState('')
  const [discountPercent, setDiscountPercent] = useState(0)
  const [promoMsg, setPromoMsg] = useState('')

  // Shipping selection
  const [shippingMethod, setShippingMethod] = useState('standard') // 'standard' | 'express'
  const shippingFee = shippingMethod === 'express' ? 15 : 0

  // Address form fields
  const [formData, setFormData] = useState({
    email: user?.email || 'adrian.vane@arbo-archive.com',
    phone: user?.phone || '+44 20 7946 0912',
    name: user?.address?.name || user?.name || 'Adrian Vane',
    street: user?.address?.street || '14 Berwick Street, Soho',
    apartment: user?.address?.apartment || 'Floor 3',
    city: user?.address?.city || 'London',
    postalCode: user?.address?.postalCode || 'W1F 0PP',
    country: user?.address?.country || 'United Kingdom',
  })

  // Payment form fields
  const [paymentType, setPaymentType] = useState('card') // 'card' | 'apple_pay' | 'upi' | 'klarna'
  const [cardData, setCardData] = useState({
    number: '4242 •••• •••• 4242',
    name: 'ADRIAN VANE',
    expiry: '12/28',
    cvv: '882',
  })

  // Completed order
  const [confirmedOrder, setConfirmedOrder] = useState(null)

  // Sync if user signs in
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        email: user.email || prev.email,
        phone: user.phone || prev.phone,
        name: user.address?.name || user.name || prev.name,
        street: user.address?.street || prev.street,
        apartment: user.address?.apartment || prev.apartment,
        city: user.address?.city || prev.city,
        postalCode: user.address?.postalCode || prev.postalCode,
        country: user.address?.country || prev.country,
      }))
      if (user.name) {
        setCardData((prev) => ({ ...prev, name: user.name.toUpperCase() }))
      }
    }
  }, [user])

  // Reset when opened
  useEffect(() => {
    if (open) {
      setStep('address')
      setConfirmedOrder(null)
    }
  }, [open])

  // Calculation
  const discountAmount = useMemo(() => {
    return Math.round((subtotal * discountPercent) / 100)
  }, [subtotal, discountPercent])

  const total = useMemo(() => {
    return Math.max(0, subtotal - discountAmount + shippingFee)
  }, [subtotal, discountAmount, shippingFee])

  if (!open) return null

  const handleApplyPromo = (e) => {
    e.preventDefault()
    const clean = promoCode.trim().toUpperCase()
    if (clean === 'ARBO10' || clean === 'ARCHIVE10' || clean === 'ERBO10') {
      setDiscountPercent(10)
      setPromoMsg('10% ARCHIVAL PRIVILEGE APPLIED')
    } else if (clean === 'VIP20') {
      setDiscountPercent(20)
      setPromoMsg('20% VIP COLLECTOR DISCOUNT APPLIED')
    } else {
      setPromoMsg('INVALID PROMO CODE')
    }
  }

  const handleAddressSubmit = (e) => {
    e.preventDefault()
    setStep('payment')
  }

  const handleExecutePayment = () => {
    setStep('processing')
    setProcessingState('Connecting to Secure Banking Gateway (256-Bit SSL)...')

    setTimeout(() => {
      setProcessingState('Verifying 3D-Secure 2.0 Token & Fraud Protection...')
    }, 900)

    setTimeout(() => {
      setProcessingState('Authorizing Transaction with Issuing Bank...')
    }, 1800)

    setTimeout(() => {
      // Build order
      const orderItems = lines.map((l) => {
        const p = product(l.id)
        return {
          id: l.id,
          name: p.name,
          colour: p.colour,
          size: l.size,
          qty: l.qty,
          price: p.price,
          photo: p.photo,
        }
      })

      // If guest checkout, automatically create client account session
      if (!user && formData.email) {
        signup(formData.name || 'Client', formData.email, 'archive-member')
      }

      const newOrder = addOrder({
        items: orderItems,
        shippingAddress: {
          name: formData.name,
          street: formData.street,
          apartment: formData.apartment,
          city: formData.city,
          postalCode: formData.postalCode,
          country: formData.country,
          phone: formData.phone,
        },
        paymentMethod: {
          type: paymentType,
          brand: paymentType === 'card' ? 'Visa' : paymentType.toUpperCase(),
          last4: paymentType === 'card' ? cardData.number.replace(/\D/g, '').slice(-4) || '4242' : 'EXP',
        },
        subtotal,
        discount: discountAmount,
        shippingFee,
        total,
      })

      setConfirmedOrder(newOrder)
      clear() // clear bag
      setStep('success')
    }, 2800)
  }

  return (
    <div className="checkout-overlay" role="dialog" aria-modal="true" aria-label="ARBO Secure Checkout">
      <div className="checkout-backdrop" onClick={step === 'processing' ? undefined : onClose} />

      <div className="checkout-modal">
        {/* Header */}
        <header className="checkout-head">
          <div className="checkout-head__brand">
            <img src={`${import.meta.env.BASE_URL}photos/arbo-logo.png`} alt="ARBO" className="checkout-head__logo" />
            <span className="checkout-head__secure-badge">🔒 SECURE 256-BIT CHECKOUT</span>
          </div>
          {step !== 'processing' && (
            <button type="button" className="overlay__close" onClick={onClose} aria-label="Close Checkout">
              ×
            </button>
          )}
        </header>

        {/* Step Indicator */}
        {step !== 'processing' && step !== 'success' && (
          <div className="checkout-steps">
            <button
              type="button"
              className={`checkout-step-pill ${step === 'address' ? 'is-current' : 'is-done'}`}
              onClick={() => setStep('address')}
            >
              1. SHIPPING &amp; CONTACT
            </button>
            <span className="checkout-step-sep">→</span>
            <button
              type="button"
              className={`checkout-step-pill ${step === 'payment' ? 'is-current' : ''}`}
              onClick={() => setStep('payment')}
            >
              2. PAYMENT GATEWAY
            </button>
          </div>
        )}

        <div className="checkout-modal__body">
          {/* STEP 1: ADDRESS & CONTACT */}
          {step === 'address' && (
            <div className="checkout-step-layout">
              <form onSubmit={handleAddressSubmit} className="checkout-form">
                <div className="checkout-section">
                  <div className="checkout-section-title">
                    <h4>CONTACT INFORMATION</h4>
                    {!user && (
                      <button type="button" className="checkout-login-trigger" onClick={() => openAccount('signin')}>
                        Have an account? Sign In
                      </button>
                    )}
                  </div>

                  <div className="checkout-field-row">
                    <div className="checkout-field">
                      <label>EMAIL ADDRESS (FOR DISPATCH TRACKING)</label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="client@domain.com"
                      />
                    </div>
                    <div className="checkout-field">
                      <label>TELEPHONE (FOR COURIER SMS)</label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+44 7700 900123"
                      />
                    </div>
                  </div>
                </div>

                <div className="checkout-section">
                  <div className="checkout-section-title">
                    <h4>SHIPPING DESTINATION</h4>
                  </div>

                  <div className="checkout-field">
                    <label>RECIPIENT FULL NAME</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Adrian Vane"
                    />
                  </div>

                  <div className="checkout-field">
                    <label>STREET ADDRESS</label>
                    <input
                      type="text"
                      required
                      value={formData.street}
                      onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                      placeholder="e.g. 14 Berwick Street"
                    />
                  </div>

                  <div className="checkout-field">
                    <label>APARTMENT, SUITE, UNIT (OPTIONAL)</label>
                    <input
                      type="text"
                      value={formData.apartment}
                      onChange={(e) => setFormData({ ...formData, apartment: e.target.value })}
                      placeholder="e.g. Floor 3, Studio A"
                    />
                  </div>

                  <div className="checkout-field-row-3">
                    <div className="checkout-field">
                      <label>CITY</label>
                      <input
                        type="text"
                        required
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        placeholder="London"
                      />
                    </div>
                    <div className="checkout-field">
                      <label>POSTAL CODE</label>
                      <input
                        type="text"
                        required
                        value={formData.postalCode}
                        onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                        placeholder="W1F 0PP"
                      />
                    </div>
                    <div className="checkout-field">
                      <label>COUNTRY</label>
                      <input
                        type="text"
                        required
                        value={formData.country}
                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                        placeholder="United Kingdom"
                      />
                    </div>
                  </div>
                </div>

                <div className="checkout-section">
                  <div className="checkout-section-title">
                    <h4>DELIVERY METHOD</h4>
                  </div>

                  <div className="shipping-options">
                    <label className={`shipping-opt ${shippingMethod === 'standard' ? 'is-selected' : ''}`}>
                      <input
                        type="radio"
                        name="shipping"
                        checked={shippingMethod === 'standard'}
                        onChange={() => setShippingMethod('standard')}
                      />
                      <div className="shipping-opt__info">
                        <strong>ARBO ATELIER STANDARD (3-5 BUSINESS DAYS)</strong>
                        <span>Tracked courier delivery in bespoke black protective box</span>
                      </div>
                      <span className="shipping-opt__price">FREE</span>
                    </label>

                    <label className={`shipping-opt ${shippingMethod === 'express' ? 'is-selected' : ''}`}>
                      <input
                        type="radio"
                        name="shipping"
                        checked={shippingMethod === 'express'}
                        onChange={() => setShippingMethod('express')}
                      />
                      <div className="shipping-opt__info">
                        <strong>DHL PRIORITY AIR (1-2 BUSINESS DAYS)</strong>
                        <span>White-glove guaranteed courier signature on delivery</span>
                      </div>
                      <span className="shipping-opt__price">{money(15)}</span>
                    </label>
                  </div>
                </div>

                <button type="submit" className="btn btn--solid checkout-submit-btn">
                  CONTINUE TO PAYMENT GATEWAY →
                </button>
              </form>

              {/* Order Summary Sidebar */}
              <div className="checkout-sidebar">
                <div className="checkout-sidebar__inner">
                  <h4>ORDER SUMMARY ({lines.length} STYLES)</h4>

                  <div className="checkout-items-list">
                    {lines.map((l) => {
                      const p = product(l.id)
                      return (
                        <div key={`${l.id}-${l.size}`} className="checkout-item">
                          <img src={p.photo} alt={p.name} />
                          <div className="checkout-item__info">
                            <span className="checkout-item__name">{p.name}</span>
                            <span className="checkout-item__meta">
                              {p.colour} · EU {l.size} × {l.qty}
                            </span>
                          </div>
                          <span className="checkout-item__price">{money(p.price * l.qty)}</span>
                        </div>
                      )
                    })}
                  </div>

                  {/* Promo Form */}
                  <form onSubmit={handleApplyPromo} className="checkout-promo">
                    <input
                      type="text"
                      placeholder="PROMO CODE (e.g. ARBO10)"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                    />
                    <button type="submit">APPLY</button>
                  </form>
                  {promoMsg && <div className="checkout-promo-msg">{promoMsg}</div>}

                  {/* Pricing Breakdown */}
                  <div className="checkout-totals">
                    <div className="checkout-total-row">
                      <span>SUBTOTAL</span>
                      <span>{money(subtotal)}</span>
                    </div>
                    {discountAmount > 0 && (
                      <div className="checkout-total-row is-discount">
                        <span>ARCHIVAL PRIVILEGE ({discountPercent}%)</span>
                        <span>-{money(discountAmount)}</span>
                      </div>
                    )}
                    <div className="checkout-total-row">
                      <span>WORLDWIDE SHIPPING</span>
                      <span>{shippingFee === 0 ? 'FREE' : money(shippingFee)}</span>
                    </div>
                    <div className="checkout-total-row is-final">
                      <span>TOTAL DUE</span>
                      <strong>{money(total)}</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: PAYMENT GATEWAY */}
          {step === 'payment' && (
            <div className="checkout-step-layout">
              <div className="checkout-payment-wrap">
                <div className="gateway-selector">
                  <button
                    type="button"
                    className={`gateway-tab ${paymentType === 'card' ? 'is-active' : ''}`}
                    onClick={() => setPaymentType('card')}
                  >
                    💳 CREDIT / DEBIT CARD
                  </button>
                  <button
                    type="button"
                    className={`gateway-tab ${paymentType === 'apple_pay' ? 'is-active' : ''}`}
                    onClick={() => setPaymentType('apple_pay')}
                  >
                    ⚡ APPLE / GOOGLE PAY
                  </button>
                  <button
                    type="button"
                    className={`gateway-tab ${paymentType === 'upi' ? 'is-active' : ''}`}
                    onClick={() => setPaymentType('upi')}
                  >
                    📱 UPI / QR SCAN
                  </button>
                  <button
                    type="button"
                    className={`gateway-tab ${paymentType === 'klarna' ? 'is-active' : ''}`}
                    onClick={() => setPaymentType('klarna')}
                  >
                    ⏳ PAY IN 4 (KLARNA)
                  </button>
                </div>

                {/* 1. CREDIT CARD GATEWAY */}
                {paymentType === 'card' && (
                  <div className="gateway-card-form">
                    {/* Live Card Preview */}
                    <div className="live-card">
                      <div className="live-card__top">
                        <span className="live-card__chip"></span>
                        <span className="live-card__brand">ARBO BLACK</span>
                      </div>
                      <div className="live-card__num">{cardData.number || '•••• •••• •••• ••••'}</div>
                      <div className="live-card__bottom">
                        <div>
                          <span className="live-card__lbl">CARDHOLDER</span>
                          <span className="live-card__val">{cardData.name || 'CLIENT NAME'}</span>
                        </div>
                        <div>
                          <span className="live-card__lbl">EXPIRES</span>
                          <span className="live-card__val">{cardData.expiry || 'MM/YY'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="auth-field">
                      <label>CARD NUMBER</label>
                      <input
                        type="text"
                        maxLength="19"
                        value={cardData.number}
                        onChange={(e) => setCardData({ ...cardData, number: e.target.value })}
                        placeholder="4242 4242 4242 4242"
                      />
                    </div>

                    <div className="auth-field">
                      <label>NAME ON CARD</label>
                      <input
                        type="text"
                        value={cardData.name}
                        onChange={(e) => setCardData({ ...cardData, name: e.target.value })}
                        placeholder="ADRIAN VANE"
                      />
                    </div>

                    <div className="auth-row-2">
                      <div className="auth-field">
                        <label>EXPIRATION (MM/YY)</label>
                        <input
                          type="text"
                          maxLength="5"
                          value={cardData.expiry}
                          onChange={(e) => setCardData({ ...cardData, expiry: e.target.value })}
                          placeholder="12/28"
                        />
                      </div>
                      <div className="auth-field">
                        <label>SECURITY CODE (CVV)</label>
                        <input
                          type="password"
                          maxLength="4"
                          value={cardData.cvv}
                          onChange={(e) => setCardData({ ...cardData, cvv: e.target.value })}
                          placeholder="882"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. EXPRESS 1-CLICK (APPLE / GOOGLE PAY) */}
                {paymentType === 'apple_pay' && (
                  <div className="gateway-express-box">
                    <div className="express-badge">Pay / GPay Ready</div>
                    <p className="micro">Instant biometric authentication linked to your verified default payment method.</p>
                    <div className="express-summary">
                      <span>Total to be charged:</span>
                      <strong>{money(total)}</strong>
                    </div>
                  </div>
                )}

                {/* 3. UPI / QR SCAN */}
                {paymentType === 'upi' && (
                  <div className="gateway-upi-box">
                    <div className="upi-qr-mock">
                      <div className="upi-qr-code">
                        {/* Clean procedural QR graphic */}
                        <svg viewBox="0 0 100 100" width="120" height="120">
                          <rect width="100" height="100" fill="#ffffff" />
                          <rect x="10" y="10" width="25" height="25" fill="#000000" />
                          <rect x="15" y="15" width="15" height="15" fill="#ffffff" />
                          <rect x="18" y="18" width="9" height="9" fill="#000000" />
                          <rect x="65" y="10" width="25" height="25" fill="#000000" />
                          <rect x="70" y="15" width="15" height="15" fill="#ffffff" />
                          <rect x="73" y="18" width="9" height="9" fill="#000000" />
                          <rect x="10" y="65" width="25" height="25" fill="#000000" />
                          <rect x="15" y="70" width="15" height="15" fill="#ffffff" />
                          <rect x="18" y="73" width="9" height="9" fill="#000000" />
                          <rect x="45" y="15" width="10" height="25" fill="#000000" />
                          <rect x="45" y="55" width="15" height="30" fill="#000000" />
                          <rect x="70" y="50" width="20" height="10" fill="#000000" />
                          <rect x="65" y="70" width="15" height="15" fill="#000000" />
                        </svg>
                      </div>
                      <span className="upi-vpa">VPA: pay.arbo@icici</span>
                    </div>
                    <p className="micro">Scan with Google Pay, PhonePe, Paytm, or any UPI app to authorize {money(total)}.</p>
                  </div>
                )}

                {/* 4. KLARNA */}
                {paymentType === 'klarna' && (
                  <div className="gateway-klarna-box">
                    <h4>4 INTEREST-FREE PAYMENTS OF {money(Math.ceil(total / 4))}</h4>
                    <p className="micro">Split your purchase into 4 equal bi-weekly payments. Zero fees. Zero impact on credit score.</p>
                    <ul className="klarna-schedule">
                      <li>
                        <span>Today</span>
                        <strong>{money(Math.ceil(total / 4))}</strong>
                      </li>
                      <li>
                        <span>In 2 weeks</span>
                        <strong>{money(Math.ceil(total / 4))}</strong>
                      </li>
                      <li>
                        <span>In 4 weeks</span>
                        <strong>{money(Math.ceil(total / 4))}</strong>
                      </li>
                      <li>
                        <span>In 6 weeks</span>
                        <strong>{money(Math.ceil(total / 4))}</strong>
                      </li>
                    </ul>
                  </div>
                )}

                <div className="gateway-actions">
                  <button type="button" className="btn btn--solid checkout-pay-btn" onClick={handleExecutePayment}>
                    AUTHORIZE &amp; PAY {money(total)}
                  </button>
                  <button type="button" className="btn" onClick={() => setStep('address')}>
                    ← BACK TO SHIPPING DETAILS
                  </button>
                </div>

                <div className="gateway-trust-row">
                  <span>🔒 PCI-DSS LEVEL 1 VERIFIED</span>
                  <span>🛡️ ARBO CONCIERGE GUARANTEE</span>
                  <span>📦 14-DAY WORLDWIDE RETURNS</span>
                </div>
              </div>

              {/* Order Summary Sidebar */}
              <div className="checkout-sidebar">
                <div className="checkout-sidebar__inner">
                  <h4>PAYMENT SUMMARY</h4>

                  <div className="checkout-totals">
                    <div className="checkout-total-row">
                      <span>ITEMS ({lines.reduce((s, l) => s + l.qty, 0)})</span>
                      <span>{money(subtotal)}</span>
                    </div>
                    {discountAmount > 0 && (
                      <div className="checkout-total-row is-discount">
                        <span>PRIVILEGE DISCOUNT</span>
                        <span>-{money(discountAmount)}</span>
                      </div>
                    )}
                    <div className="checkout-total-row">
                      <span>DELIVERY METHOD</span>
                      <span>{shippingFee === 0 ? 'COMPLIMENTARY' : money(shippingFee)}</span>
                    </div>
                    <div className="checkout-total-row is-final">
                      <span>TOTAL PAYABLE</span>
                      <strong>{money(total)}</strong>
                    </div>
                  </div>

                  <div className="checkout-address-preview">
                    <span className="micro">DISPATCH DESTINATION:</span>
                    <p className="address-snippet">
                      {formData.name}
                      <br />
                      {formData.street} {formData.apartment && `(${formData.apartment})`}
                      <br />
                      {formData.city}, {formData.postalCode}, {formData.country}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: PROCESSING STATE */}
          {step === 'processing' && (
            <div className="checkout-processing">
              <div className="processing-spinner"></div>
              <h3 className="processing-title">PROCESSING TRANSACTION</h3>
              <p className="processing-sub">{processingState}</p>
              <div className="processing-bar">
                <div className="processing-bar__inner"></div>
              </div>
              <span className="micro">DO NOT REFRESH OR CLOSE YOUR BROWSER</span>
            </div>
          )}

          {/* STEP 4: ORDER CONFIRMED RECEIPT */}
          {step === 'success' && confirmedOrder && (
            <div className="checkout-success">
              <div className="success-icon">✓</div>
              <span className="chapter__kicker">TRANSACTION APPROVED</span>
              <h2 className="success-title">ORDER {confirmedOrder.id} CONFIRMED</h2>
              <p className="micro success-lead">
                Thank you, {confirmedOrder.shippingAddress.name}. A confirmation receipt and dispatch tracker have been dispatched to {formData.email}.
              </p>

              <div className="receipt-box">
                <div className="receipt-head">
                  <div>
                    <span className="receipt-lbl">ORDER REFERENCE</span>
                    <strong>{confirmedOrder.id}</strong>
                  </div>
                  <div>
                    <span className="receipt-lbl">DATE</span>
                    <strong>{confirmedOrder.date}</strong>
                  </div>
                  <div>
                    <span className="receipt-lbl">TRACKING</span>
                    <strong>{confirmedOrder.trackingNumber}</strong>
                  </div>
                  <div>
                    <span className="receipt-lbl">TOTAL PAID</span>
                    <strong>{money(confirmedOrder.total)}</strong>
                  </div>
                </div>

                <div className="receipt-items">
                  {confirmedOrder.items.map((it, idx) => (
                    <div key={`${it.id}-${it.size}-${idx}`} className="receipt-item-row">
                      {it.photo && <img src={it.photo} alt={it.name} />}
                      <div className="receipt-item-details">
                        <span className="receipt-item-title">{it.name}</span>
                        <span className="receipt-item-meta">
                          {it.colour} · EU {it.size} · QTY {it.qty}
                        </span>
                      </div>
                      <span className="receipt-item-price">{money(it.price * it.qty)}</span>
                    </div>
                  ))}
                </div>

                <div className="receipt-foot">
                  <div>
                    <span className="receipt-lbl">SHIPPING DESTINATION</span>
                    <p>
                      {confirmedOrder.shippingAddress.name}
                      <br />
                      {confirmedOrder.shippingAddress.street}
                      <br />
                      {confirmedOrder.shippingAddress.city}, {confirmedOrder.shippingAddress.postalCode}
                    </p>
                  </div>
                  <div>
                    <span className="receipt-lbl">SETTLEMENT METHOD</span>
                    <p>
                      {confirmedOrder.paymentMethod.brand} •••• {confirmedOrder.paymentMethod.last4}
                      <br />
                      Status: Settled &amp; Verified
                    </p>
                  </div>
                </div>
              </div>

              <div className="success-actions">
                <button
                  type="button"
                  className="btn btn--solid"
                  onClick={() => {
                    onClose()
                    openAccount('orders')
                  }}
                >
                  VIEW IN MY ORDER ARCHIVE
                </button>
                <button type="button" className="btn" onClick={onClose}>
                  CONTINUE SHOPPING
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

