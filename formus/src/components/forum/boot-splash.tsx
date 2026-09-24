'use client'

import { useEffect, useState } from 'react'

export default function BootSplash() {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setVisible(false)
      window.sessionStorage.setItem(
        'snyt-boot-splash-seen',
        '1',
      )
    })

    return () => {
      window.cancelAnimationFrame(frame)
    }
  }, [])

  if (!visible) {
    return null
  }

  return (
    <div className="boot-splash" aria-live="polite">
      <img
        src="/snytlogoheadbar.png"
        alt="SNYT logo"
        className="boot-splash__logo"
      />
    </div>
  )
}
