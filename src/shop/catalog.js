import { SHOES } from '../choreo/shoes'

/**
 * The shop's range — one product per shoe in the 3D cast.
 * Prices are placeholders (GBP): set the real ones here.
 */
export const CURRENCY = 'GBP'
export const money = (n) => new Intl.NumberFormat('en-GB', { style: 'currency', currency: CURRENCY, maximumFractionDigits: 0 }).format(n)

const SIZES = ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45']
const photo = (id) => SHOES.find((s) => s.id === id).photo

export const PRODUCTS = [
  {
    id: 'blue',
    name: 'Sky Retro Trainer',
    category: 'Trainers',
    price: 89,
    colour: 'Powder blue / Cream',
    swatch: '#a9c4e4',
    tag: 'Hero',
    blurb: 'Low-profile retro trainer in powder-blue suede and nylon, zig-zag stitched overlays and a gum rubber sole. Ships with cream and sky-blue chunky laces.',
    details: ['Suede + nylon upper', 'Leather lining', 'Gum rubber cupsole', 'Two sets of laces'],
  },
  {
    id: 'mustard',
    name: 'Mustard Court',
    category: 'Trainers',
    price: 79,
    colour: 'Mustard / Sand',
    swatch: '#c9a227',
    blurb: 'A soft court shoe in brushed mustard suede with a breathable sand mesh quarter, tonal piping and a slim brown sole.',
    details: ['Suede + mesh upper', 'Padded collar', 'Flexible rubber sole', 'Tonal round laces'],
  },
  {
    id: 'gold',
    name: 'Gold Terrace',
    category: 'Trainers',
    price: 95,
    colour: 'Metallic gold / Sand',
    swatch: '#d4b56a',
    tag: 'New',
    blurb: 'Terrace-style trainer in metallic gold leather with a sand suede T-toe, cut-out three-bar sides and a sawtooth gum sole.',
    details: ['Metallic leather + suede', 'Leather lining', 'Sawtooth gum sole', 'Waxed cotton laces'],
  },
  {
    id: 'runner',
    name: 'Cloud Runner',
    category: 'Running',
    price: 85,
    colour: 'White / Signal orange',
    swatch: '#f2f2f0',
    blurb: 'Everyday runner with a perforated engineered-mesh upper, reflective side flash and a full-length cushioned foam midsole.',
    details: ['Engineered mesh upper', 'Reflective detailing', 'Cushioned foam midsole', 'Lime footbed'],
  },
  {
    id: 'wingtip',
    name: 'Tan Wingtip',
    category: 'Smart',
    price: 110,
    colour: 'Cognac / Stone',
    swatch: '#a0582a',
    blurb: 'A brogue wingtip in burnished cognac leather on a lightweight stone foam cupsole — smart enough for the office, soft enough for all day.',
    details: ['Burnished leather upper', 'Brogue perforations', 'Lightweight foam cupsole', 'Elastic stretch laces'],
  },
].map((p) => ({ ...p, photo: photo(p.id), sizes: SIZES }))

export const CATEGORIES = ['All', ...new Set(PRODUCTS.map((p) => p.category))]
export const product = (id) => PRODUCTS.find((p) => p.id === id)
