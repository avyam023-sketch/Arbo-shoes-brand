import { Fragment } from 'react'
import { SHOES } from '../choreo/shoes'

export const photo = (id) => SHOES.find((s) => s.id === id).photo

/** Big display line. Lines reveal through a mask; `[img:id]` drops an inline photo. */
export function Line({ text, className = '' }) {
  const parts = text.split(/(\[img:[a-z]+\])/)
  return (
    <span className={`line ${className}`}>
      <span className="line__inner">
        {parts.map((part, i) => {
          const m = part.match(/^\[img:([a-z]+)\]$/)
          return m ? <img key={i} className="inline-photo" src={photo(m[1])} alt="" /> : <Fragment key={i}>{part}</Fragment>
        })}
      </span>
    </span>
  )
}

/** Justified uppercase micro-copy column. */
export const Micro = ({ children, className = '' }) => <p className={`micro ${className}`}>{children}</p>
