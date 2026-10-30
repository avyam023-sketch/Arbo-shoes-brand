import { useState } from 'react'
import { useAuth } from './AuthContext'
import { money } from '../shop/catalog'

export function AccountModal() {
  const {
    user,
    orders,
    accountOpen,
    closeAccount,
    activeTab,
    setActiveTab,
    login,
    demoLogin,
    signup,
    logout,
    updateProfile,
  } = useAuth()

  // Sign In State
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginError, setLoginError] = useState('')

  // Sign Up State
  const [signupName, setSignupName] = useState('')
  const [signupEmail, setSignupEmail] = useState('')
  const [signupPassword, setSignupPassword] = useState('')
  const [signupError, setSignupError] = useState('')

  // Address edit state
  const [editingAddress, setEditingAddress] = useState(false)
  const [addressForm, setAddressForm] = useState(user?.address || {})

  if (!accountOpen) return null

  const handleLogin = (e) => {
    e.preventDefault()
    setLoginError('')
    const res = login(loginEmail, loginPassword)
    if (!res.success) {
      setLoginError(res.error)
    }
  }

  const handleSignup = (e) => {
    e.preventDefault()
    setSignupError('')
    const res = signup(signupName, signupEmail, signupPassword)
    if (!res.success) {
      setSignupError(res.error)
    }
  }

  const handleSaveAddress = (e) => {
    e.preventDefault()
    updateProfile({ address: addressForm })
    setEditingAddress(false)
  }

  return (
    <div className="account-overlay" role="dialog" aria-modal="true" aria-label="ARBO Account">
      <div className="account-backdrop" onClick={closeAccount} />
      <div className="account-drawer">
        <header className="account-drawer__head">
          <div className="account-drawer__brand">
            <img src={`${import.meta.env.BASE_URL}photos/arbo-logo.png`} alt="ARBO" className="account-drawer__logo" />
            <span className="account-drawer__tagline">CLIENT ARCHIVE &amp; PORTAL</span>
          </div>
          <button type="button" className="overlay__close" onClick={closeAccount} aria-label="Close Account">
            ×
          </button>
        </header>

        {/* Tab Navigation */}
        <nav className="account-tabs">
          {user ? (
            <>
              <button
                type="button"
                className={`account-tab ${activeTab === 'profile' ? 'is-active' : ''}`}
                onClick={() => setActiveTab('profile')}
              >
                PROFILE
              </button>
              <button
                type="button"
                className={`account-tab ${activeTab === 'orders' ? 'is-active' : ''}`}
                onClick={() => setActiveTab('orders')}
              >
                ORDERS <sup>{orders.length}</sup>
              </button>
              <button
                type="button"
                className={`account-tab ${activeTab === 'addresses' ? 'is-active' : ''}`}
                onClick={() => {
                  setAddressForm(user.address || {})
                  setActiveTab('addresses')
                }}
              >
                ADDRESS BOOK
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className={`account-tab ${activeTab === 'signin' ? 'is-active' : ''}`}
                onClick={() => setActiveTab('signin')}
              >
                SIGN IN
              </button>
              <button
                type="button"
                className={`account-tab ${activeTab === 'signup' ? 'is-active' : ''}`}
                onClick={() => setActiveTab('signup')}
              >
                CREATE ACCOUNT
              </button>
            </>
          )}
        </nav>

        {/* Tab Content */}
        <div className="account-drawer__body">
          {/* 1. SIGN IN FORM */}
          {!user && activeTab === 'signin' && (
            <div className="auth-form-wrap">
              <div className="auth-intro">
                <h3>ACCESS YOUR ARCHIVE</h3>
                <p className="micro">Sign in to track orders, manage bespoke sizing, and receive priority access to limited drops.</p>
              </div>

              {loginError && <div className="auth-alert is-error">{loginError}</div>}

              <form onSubmit={handleLogin} className="auth-form">
                <div className="auth-field">
                  <label htmlFor="login-email">EMAIL ADDRESS</label>
                  <input
                    id="login-email"
                    type="email"
                    required
                    placeholder="name@domain.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                  />
                </div>

                <div className="auth-field">
                  <label htmlFor="login-password">PASSWORD</label>
                  <input
                    id="login-password"
                    type="password"
                    required
                    placeholder="••••••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                  />
                </div>

                <button type="submit" className="btn btn--solid auth-submit">
                  SIGN IN TO ARBO
                </button>
              </form>

              <div className="auth-divider">
                <span>OR FAST ACCESS</span>
              </div>

              <button type="button" className="btn auth-demo-btn" onClick={demoLogin}>
                ⚡ 1-CLICK DEMO VIP LOGIN (ADRIAN VANE)
              </button>

              <p className="auth-switch">
                Don't have an ARBO account?{' '}
                <button type="button" onClick={() => setActiveTab('signup')}>
                  Create an account
                </button>
              </p>
            </div>
          )}

          {/* 2. SIGN UP FORM */}
          {!user && activeTab === 'signup' && (
            <div className="auth-form-wrap">
              <div className="auth-intro">
                <h3>CREATE ARBO ACCOUNT</h3>
                <p className="micro">Join the ARBO community for private drop access, order histories, and white-glove concierge checkout.</p>
              </div>

              {signupError && <div className="auth-alert is-error">{signupError}</div>}

              <form onSubmit={handleSignup} className="auth-form">
                <div className="auth-field">
                  <label htmlFor="signup-name">FULL NAME</label>
                  <input
                    id="signup-name"
                    type="text"
                    required
                    placeholder="e.g. Christian Davies"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                  />
                </div>

                <div className="auth-field">
                  <label htmlFor="signup-email">EMAIL ADDRESS</label>
                  <input
                    id="signup-email"
                    type="email"
                    required
                    placeholder="name@domain.com"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                  />
                </div>

                <div className="auth-field">
                  <label htmlFor="signup-password">PASSWORD</label>
                  <input
                    id="signup-password"
                    type="password"
                    required
                    placeholder="Minimum 8 characters"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                  />
                </div>

                <button type="submit" className="btn btn--solid auth-submit">
                  REGISTER ACCOUNT
                </button>
              </form>

              <div className="auth-divider">
                <span>OR FAST ACCESS</span>
              </div>

              <button type="button" className="btn auth-demo-btn" onClick={demoLogin}>
                ⚡ INSTANT DEMO ACCOUNT
              </button>

              <p className="auth-switch">
                Already registered?{' '}
                <button type="button" onClick={() => setActiveTab('signin')}>
                  Sign in
                </button>
              </p>
            </div>
          )}

          {/* 3. PROFILE DASHBOARD */}
          {user && activeTab === 'profile' && (
            <div className="profile-wrap">
              <div className="profile-card">
                <div className="profile-card__avatar">
                  {user.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()}
                </div>
                <div className="profile-card__details">
                  <span className="profile-tier">{user.tier}</span>
                  <h3 className="profile-name">{user.name}</h3>
                  <span className="profile-email">{user.email}</span>
                  <span className="profile-id">MEMBER ID: {user.id}</span>
                </div>
              </div>

              <div className="profile-stats">
                <div className="profile-stat-box">
                  <span className="profile-stat-box__val">{orders.length}</span>
                  <span className="profile-stat-box__lbl">TOTAL ORDERS</span>
                </div>
                <div className="profile-stat-box">
                  <span className="profile-stat-box__val">TIER 1</span>
                  <span className="profile-stat-box__lbl">VIP STATUS</span>
                </div>
                <div className="profile-stat-box">
                  <span className="profile-stat-box__val">FREE</span>
                  <span className="profile-stat-box__lbl">WORLDWIDE AIR</span>
                </div>
              </div>

              <div className="profile-actions">
                <button type="button" className="btn btn--solid" onClick={() => setActiveTab('orders')}>
                  VIEW ORDER HISTORY ({orders.length})
                </button>
                <button type="button" className="btn" onClick={() => setActiveTab('addresses')}>
                  MANAGE SHIPPING ADDRESS
                </button>
                <button type="button" className="btn btn--danger" onClick={logout}>
                  SIGN OUT OF ARBO
                </button>
              </div>
            </div>
          )}

          {/* 4. ORDERS TAB */}
          {user && activeTab === 'orders' && (
            <div className="orders-wrap">
              <div className="orders-head">
                <h3>ORDER ARCHIVE</h3>
                <span className="micro">ALL ORDERS DISPATCHED VIA EXPRESS COURIER</span>
              </div>

              {orders.length === 0 ? (
                <div className="orders-empty">
                  <p>NO ORDERS ON RECORD YET.</p>
                  <button type="button" className="btn btn--solid" onClick={closeAccount}>
                    SHOP CURRENT COLLECTION
                  </button>
                </div>
              ) : (
                <div className="orders-list">
                  {orders.map((ord) => (
                    <article key={ord.id} className="order-card">
                      <div className="order-card__head">
                        <div>
                          <span className="order-id">{ord.id}</span>
                          <span className="order-date">{ord.date}</span>
                        </div>
                        <span className={`order-status is-${ord.status.toLowerCase().replace(/\s+/g, '-')}`}>
                          {ord.status}
                        </span>
                      </div>

                      <div className="order-card__items">
                        {ord.items.map((it, idx) => (
                          <div key={`${it.id}-${it.size}-${idx}`} className="order-item-row">
                            {it.photo && <img src={it.photo} alt={it.name} className="order-item-img" />}
                            <div className="order-item-info">
                              <span className="order-item-name">{it.name}</span>
                              <span className="order-item-meta">
                                {it.colour} · EU {it.size} · QTY {it.qty}
                              </span>
                            </div>
                            <span className="order-item-price">{money(it.price * it.qty)}</span>
                          </div>
                        ))}
                      </div>

                      <div className="order-card__foot">
                        <div className="order-tracking">
                          <span className="order-carrier">{ord.carrier}</span>
                          <span className="order-track-num">TRACKING: {ord.trackingNumber}</span>
                        </div>
                        <div className="order-total-block">
                          <span className="order-total-label">ORDER TOTAL:</span>
                          <span className="order-total-val">{money(ord.total)}</span>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 5. ADDRESS BOOK TAB */}
          {user && activeTab === 'addresses' && (
            <div className="addresses-wrap">
              <div className="addresses-head">
                <h3>DEFAULT SHIPPING ADDRESS</h3>
                <span className="micro">USED FOR EXPRESS CHECKOUT &amp; DISPATCH</span>
              </div>

              {!editingAddress ? (
                <div className="address-display-box">
                  <p className="address-name">{user.address?.name || user.name}</p>
                  <p className="address-street">{user.address?.street || 'No street address saved'}</p>
                  {user.address?.apartment && <p className="address-apt">{user.address.apartment}</p>}
                  <p className="address-city">
                    {user.address?.city} {user.address?.postalCode}
                  </p>
                  <p className="address-country">{user.address?.country || 'United Kingdom'}</p>
                  <p className="address-phone">{user.phone || '+44 20 7946 0912'}</p>

                  <button type="button" className="btn btn--solid" onClick={() => setEditingAddress(true)}>
                    EDIT ADDRESS
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSaveAddress} className="auth-form address-form">
                  <div className="auth-field">
                    <label>RECIPIENT NAME</label>
                    <input
                      type="text"
                      required
                      value={addressForm.name || ''}
                      onChange={(e) => setAddressForm({ ...addressForm, name: e.target.value })}
                    />
                  </div>
                  <div className="auth-field">
                    <label>STREET ADDRESS</label>
                    <input
                      type="text"
                      required
                      value={addressForm.street || ''}
                      onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                    />
                  </div>
                  <div className="auth-field">
                    <label>APARTMENT / SUITE / UNIT</label>
                    <input
                      type="text"
                      value={addressForm.apartment || ''}
                      onChange={(e) => setAddressForm({ ...addressForm, apartment: e.target.value })}
                    />
                  </div>
                  <div className="auth-row-2">
                    <div className="auth-field">
                      <label>CITY</label>
                      <input
                        type="text"
                        required
                        value={addressForm.city || ''}
                        onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                      />
                    </div>
                    <div className="auth-field">
                      <label>POSTAL CODE</label>
                      <input
                        type="text"
                        required
                        value={addressForm.postalCode || ''}
                        onChange={(e) => setAddressForm({ ...addressForm, postalCode: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="auth-field">
                    <label>COUNTRY</label>
                    <input
                      type="text"
                      required
                      value={addressForm.country || 'United Kingdom'}
                      onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}
                    />
                  </div>

                  <div className="address-btn-row">
                    <button type="submit" className="btn btn--solid">
                      SAVE ADDRESS
                    </button>
                    <button type="button" className="btn" onClick={() => setEditingAddress(false)}>
                      CANCEL
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

