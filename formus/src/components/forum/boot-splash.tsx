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
      setVisible(false)
      return
    }

    document.body.style.overflow = 'hidden'

    const timer = window.setTimeout(() => {
      setVisible(false)
      document.body.style.overflow = ''
      window.sessionStorage.setItem(
        'snyt-boot-splash-seen',
        '1',
      )
    }, 1100)

    return () => {
      window.clearTimeout(timer)
      document.body.style.overflow = ''
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
