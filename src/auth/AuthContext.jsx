import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { product } from '../shop/catalog'

const AuthContext = createContext(null)

const USER_KEY = 'arbo.auth.user.v1'
const ORDERS_KEY = 'arbo.auth.orders.v1'

const INITIAL_DEMO_USER = {
  id: 'usr_arbo_9281',
  name: 'Adrian Vane',
  email: 'adrian.vane@arbo-archive.com',
  tier: 'ARBO ARCHIVE VIP MEMBER',
  phone: '+44 20 7946 0912',
  address: {
    name: 'Adrian Vane',
    street: '14 Berwick Street, Soho',
    apartment: 'Floor 3',
    city: 'London',
    postalCode: 'W1F 0PP',
    country: 'United Kingdom',
  },
}

const INITIAL_DEMO_ORDERS = [
  {
    id: 'ARBO-94821',
    date: '2026-10-24',
    status: 'Delivered',
    trackingNumber: 'ARB-GB-9920141',
    carrier: 'DHL Express Luxury Atelier',
    items: [
      {
        id: 'gold',
        name: 'Gold Terrace',
        colour: 'Metallic gold / Sand',
        size: '42',
        qty: 1,
        price: 95,
        photo: product('gold')?.photo || '',
      },
    ],
    shippingAddress: {
      name: 'Adrian Vane',
      street: '14 Berwick Street, Soho',
      city: 'London',
      postalCode: 'W1F 0PP',
      country: 'United Kingdom',
    },
    paymentMethod: {
      type: 'card',
      brand: 'Mastercard',
      last4: '8821',
    },
    subtotal: 95,
    discount: 0,
    shippingFee: 0,
    total: 95,
  },
]

function loadStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function loadStoredOrders() {
  try {
    const raw = localStorage.getItem(ORDERS_KEY)
    return raw ? JSON.parse(raw) : INITIAL_DEMO_ORDERS
  } catch {
    return INITIAL_DEMO_ORDERS
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadStoredUser)
  const [orders, setOrders] = useState(loadStoredOrders)
  const [accountOpen, setAccountOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('profile') // 'signin' | 'signup' | 'profile' | 'orders'

  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem(USER_KEY, JSON.stringify(user))
      } else {
        localStorage.removeItem(USER_KEY)
      }
    } catch {
      /* storage blocked */
    }
  }, [user])

  useEffect(() => {
    try {
      localStorage.setItem(ORDERS_KEY, JSON.stringify(orders))
    } catch {
      /* storage blocked */
    }
  }, [orders])

  const login = useCallback((email, password) => {
    if (!email || !password) {
      return { success: false, error: 'Please enter both email and password.' }
    }
    const displayName = email.split('@')[0].replace(/[._-]/g, ' ')
    const newUser = {
      id: `usr_${Date.now()}`,
      name: displayName.charAt(0).toUpperCase() + displayName.slice(1),
      email: email.trim(),
      tier: 'ARBO PRIVILEGED MEMBER',
      phone: '+44 7700 900077',
      address: {
        name: displayName,
        street: '7 Bruton St, Mayfair',
        apartment: 'Suite 4B',
        city: 'London',
        postalCode: 'W1J 6PT',
        country: 'United Kingdom',
      },
    }
    setUser(newUser)
    setActiveTab('profile')
    return { success: true, user: newUser }
  }, [])

  const demoLogin = useCallback(() => {
    setUser(INITIAL_DEMO_USER)
    setActiveTab('profile')
    return { success: true, user: INITIAL_DEMO_USER }
  }, [])

  const signup = useCallback((name, email, password) => {
    if (!name || !email || !password) {
      return { success: false, error: 'Please fill out all required fields.' }
    }
    const newUser = {
      id: `usr_${Date.now()}`,
      name: name.trim(),
      email: email.trim(),
      tier: 'NEW ARBO COLLECTOR',
      phone: '+44 7700 900512',
      address: {
        name: name.trim(),
        street: '10 New Bond Street',
        apartment: '',
        city: 'London',
        postalCode: 'W1S 2RS',
        country: 'United Kingdom',
      },
    }
    setUser(newUser)
    setActiveTab('profile')
    return { success: true, user: newUser }
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    setActiveTab('signin')
  }, [])

  const updateProfile = useCallback((patch) => {
    setUser((prev) => (prev ? { ...prev, ...patch } : null))
  }, [])

  const addOrder = useCallback((orderData) => {
    const newOrder = {
      id: `ARBO-${Math.floor(100000 + Math.random() * 900000)}`,
      date: new Date().toISOString().split('T')[0],
      status: 'Processing',
      trackingNumber: `ARB-EXP-${Math.floor(10000000 + Math.random() * 90000000)}`,
      carrier: 'DHL Express Atelier Global',
      ...orderData,
    }
    setOrders((prev) => [newOrder, ...prev])
    return newOrder
  }, [])

  const openAccount = useCallback((tab = null) => {
    if (tab) setActiveTab(tab)
    else setActiveTab(user ? 'profile' : 'signin')
    setAccountOpen(true)
  }, [user])

  const closeAccount = useCallback(() => {
    setAccountOpen(false)
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        orders,
        accountOpen,
        activeTab,
        setActiveTab,
        openAccount,
        closeAccount,
        login,
        demoLogin,
        signup,
        logout,
        updateProfile,
        addOrder,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
