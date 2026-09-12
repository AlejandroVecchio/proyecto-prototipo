import type { ReactNode } from 'react'

type Props = {
  title: string
  open: boolean
  onToggle: () => void
  className?: string
  children: ReactNode
}

export function FoldSection({ title, open, onToggle, className, children }: Props) {
  return (
    <div className={className}>
      <button
        type="button"
        className="fold-head"
        data-gb-nav
        aria-expanded={open}
        onClick={onToggle}
      >
        <span className="fold-marker" aria-hidden="true" />
        <span className="fold-title">{title}</span>
        <span className="fold-chevron" aria-hidden="true">
          ▶
        </span>
      </button>
      <div className={open ? 'fold-body is-open' : 'fold-body'}>
        <div className="fold-inner" inert={!open}>
          <div className="fold-pad">{children}</div>
        </div>
      </div>
    </div>
  )
}
