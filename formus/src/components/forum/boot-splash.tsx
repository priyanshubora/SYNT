'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'

function getInitialVisible(): boolean {
  if (typeof window === 'undefined') {
    return true
  }

  return window.sessionStorage.getItem('snyt-boot-splash-seen') !== '1'
}

export default function BootSplash() {
  const [visible, setVisible] = useState(getInitialVisible)

  useEffect(() => {
    if (visible) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    const timer = window.setTimeout(() => {
      setVisible(false)
      window.sessionStorage.setItem(
        'snyt-boot-splash-seen',
        '1',
      )
    }, 1100)

    return () => {
      window.clearTimeout(timer)
    }
  }, [visible])

  if (!visible) {
    return null
  }

  return (
    <div className="boot-splash" aria-live="polite">
      <Image
        src="/snytlogoheadbar.png"
        alt="SNYT logo"
        width={200}
        height={56}
        className="boot-splash__logo"
      />
    </div>
  )
}
