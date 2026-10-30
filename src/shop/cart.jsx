import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { product } from './catalog'

const CartContext = createContext(null)
const KEY = 'arbo.bag.v2'

function load() {
  try {
    const lines = JSON.parse(localStorage.getItem(KEY) ?? '[]')
    return Array.isArray(lines) ? lines.filter((l) => product(l.id) && l.qty > 0) : []
  } catch {
    return []
  }
}

/**
 * The ARBO Shopping Bag: lines of { id, size, qty }, kept in browser storage.
 * Controls overlays: bag drawer, product view, and checkout gateway.
 */
export function CartProvider({ children }) {
  const [lines, setLines] = useState(load)
  const [bagOpen, setBagOpen] = useState(false)
  const [viewing, setViewing] = useState(null) // product id in the quick view
  const [checkoutOpen, setCheckoutOpen] = useState(false)

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(lines))
    } catch {
      /* storage blocked */
    }
  }, [lines])

  const add = useCallback((id, size, qty = 1) => {
    setLines((ls) => {
      const hit = ls.find((l) => l.id === id && l.size === size)
      return hit ? ls.map((l) => (l === hit ? { ...l, qty: Math.min(9, l.qty + qty) } : l)) : [...ls, { id, size, qty }]
    })
  }, [])

  const setQty = useCallback((id, size, qty) => {
    setLines((ls) =>
      qty <= 0
        ? ls.filter((l) => !(l.id === id && l.size === size))
        : ls.map((l) => (l.id === id && l.size === size ? { ...l, qty: Math.min(9, qty) } : l))
    )
  }, [])

  const clear = useCallback(() => setLines([]), [])

  const value = useMemo(() => {
    const count = lines.reduce((n, l) => n + l.qty, 0)
    const subtotal = lines.reduce((n, l) => n + l.qty * product(l.id).price, 0)
    return {
      lines,
      count,
      subtotal,
      add,
      setQty,
      clear,
      bagOpen,
      setBagOpen,
      viewing,
      setViewing,
      checkoutOpen,
      setCheckoutOpen,
    }
  }, [lines, add, setQty, clear, bagOpen, viewing, checkoutOpen])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export const useCart = () => useContext(CartContext)
