'use client'

import { useState } from 'react'

type ShareButtonProps = {
  url?: string
  label?: string
}

export default function ShareButton({
  url,
  label = 'Share',
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false)

  async function handleShare() {
    const shareUrl =
      url ?? window.location.href

    try {
      if (navigator.share) {
        await navigator.share({
          url: shareUrl,
        })
        return
      }

      await navigator.clipboard.writeText(shareUrl)

      setCopied(true)

      setTimeout(() => {
        setCopied(false)
      }, 1500)
    } catch (error) {
      console.error('Share failed:', error)
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      className="font-semibold transition hover:underline"
      style={{
        color: 'var(--text-secondary)',
      }}
    >
      {copied ? 'Copied!' : label}
    </button>
  )
}