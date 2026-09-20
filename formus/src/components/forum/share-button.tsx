'use client'

import { useState } from 'react'

type ShareButtonProps = {
  title?: string
}

export default function ShareButton({
  title = 'SNYT discussion',
}: ShareButtonProps) {
  const [status, setStatus] = useState('')

  async function shareThread() {
    const url = window.location.href

    try {
      if (
        typeof navigator.share === 'function'
      ) {
        await navigator.share({
          title,
          url,
        })

        setStatus('Shared')
      } else {
        await navigator.clipboard.writeText(url)
        setStatus('Copied')
      }
    } catch (error) {
      if (
        error instanceof DOMException &&
        error.name === 'AbortError'
      ) {
        return
      }

      try {
        await navigator.clipboard.writeText(url)
        setStatus('Copied')
      } catch (copyError) {
        console.error(
          'Thread share failed:',
          error,
          copyError
        )

        setStatus('Unable to share')
      }
    }

    window.setTimeout(() => {
      setStatus('')
    }, 1800)
  }

  return (
    <button
      type="button"
      onClick={shareThread}
      className="text-[10px] font-semibold transition hover:opacity-70"
      style={{
        color: 'var(--text-muted)',
      }}
    >
      {status || 'Share'}
    </button>
  )
}