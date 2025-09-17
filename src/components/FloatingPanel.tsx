interface FloatingPanelProps {
  position: 'top-center' | 'top-left' | 'top-right' | 'bottom-right' | 'bottom-left' | 'right-sidebar'
  children: React.ReactNode
  className?: string
  slideLeft?: boolean
}

const positions = {
  'top-center': { top: '37px', left: '50%', transform: 'translateX(-50%)' },
  'top-left': { top: '16px', left: '24px' },
  'top-right': { top: '16px', right: '24px' },
  'bottom-right': { bottom: '24px', right: '24px' },
  'bottom-left': { bottom: '40px', left: '40px' },
  'right-sidebar': { right: '24px', top: '128px', bottom: '96px', width: '320px' }
} as const

export function FloatingPanel({ position, children, className = '', slideLeft = false }: FloatingPanelProps) {
  const positionStyles = positions[position]

  // Apply slide transform for top-center position
  const slideTransform = position === 'top-center' && slideLeft
    ? 'translateX(calc(-50% - 100px))'
    : ('transform' in positionStyles ? positionStyles.transform : 'none')

  return (
    <div
      className={`absolute z-10 ${className}`}
      style={{
        ...positionStyles,
        transform: slideTransform,
        transition: 'transform 0.3s ease-out'
      }}
    >
      {children}
    </div>
  )
}