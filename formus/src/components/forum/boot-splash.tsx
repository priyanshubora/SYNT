'use client'

import { useEffect, useState } from 'react'

export default function BootSplash() {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const hasSeenSplash =
      window.sessionStorage.getItem(
        'snyt-boot-splash-seen',
      )

    if (hasSeenSplash === '1') {
      const frame = window.requestAnimationFrame(() => {
        setVisible(false)
      })
      return () => window.cancelAnimationFrame(frame)
    }

    const timer = window.setTimeout(() => {
      setVisible(false)
      window.sessionStorage.setItem(
        'snyt-boot-splash-seen',
        '1',
      )
    }, 550)

    return () => {
      window.clearTimeout(timer)
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
