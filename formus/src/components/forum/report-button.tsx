'use client'

import { useState } from 'react'

type ReportTargetType = 'thread' | 'comment'

type ReportReason =
  | 'spam'
  | 'harassment'
  | 'hate'
  | 'nsfw'
  | 'impersonation'
  | 'off_topic'
  | 'other'

type ReportButtonProps = {
  targetType: ReportTargetType
  targetId: string
  currentUserId: string | null
}

const reasons: {
  value: ReportReason
  label: string
}[] = [
  {
    value: 'spam',
    label: 'Spam',
  },
  {
    value: 'harassment',
    label: 'Harassment',
  },
  {
    value: 'hate',
    label: 'Hate',
  },
  {
    value: 'nsfw',
    label: 'NSFW',
  },
  {
    value: 'impersonation',
    label: 'Impersonation',
  },
  {
    value: 'off_topic',
    label: 'Off-topic',
  },
  {
    value: 'other',
    label: 'Other',
  },
]

export default function ReportButton({
  targetType,
  targetId,
  currentUserId,
}: ReportButtonProps) {
  const [open, setOpen] = useState(false)
  const [reason, setReason] =
    useState<ReportReason>('spam')
  const [description, setDescription] =
    useState('')
  const [loading, setLoading] =
    useState(false)
  const [message, setMessage] =
    useState<string | null>(null)

  if (!currentUserId) {
    return null
  }

  async function submitReport() {
    setLoading(true)
    setMessage(null)

    try {
      const response = await fetch(
        '/api/reports',
        {
          method: 'POST',
          headers: {
            'Content-Type':
              'application/json',
          },
          body: JSON.stringify({
            targetType,
            targetId,
            reason,
            description:
              description.trim() || null,
          }),
        },
      )

      const data =
        await response.json()

      if (!response.ok) {
        throw new Error(
          data?.error ||
            'Unable to submit report.',
        )
      }

      setMessage(
        'Report submitted.',
      )

      setDescription('')

      window.setTimeout(() => {
        setOpen(false)
        setMessage(null)
      }, 1200)
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : 'Unable to submit report.',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() =>
          setOpen((value) => !value)
        }
        className="text-xs font-semibold transition hover:opacity-70"
        style={{
          color:
            'var(--text-muted)',
        }}
      >
        Report
      </button>

      {open && (
        <div
          className="absolute left-0 top-full z-[60] mt-2 w-[260px] border p-3 shadow-2xl"
          style={{
            background:
              'var(--surface)',
            borderColor:
              'var(--border)',
            borderRadius: '10px',
            boxShadow:
              '0 16px 30px rgba(0,0,0,0.22)',
            maxHeight: 'min(70vh, 360px)',
            overflowY: 'auto',
          }}
        >
          <div
            className="text-[11px] font-bold"
            style={{
              color:
                'var(--text-primary)',
            }}
          >
            Report{' '}
            {targetType ===
            'thread'
              ? 'thread'
              : 'comment'}
          </div>

          <p
            className="mt-1 text-[10px] leading-4"
            style={{
              color:
                'var(--text-muted)',
            }}
          >
            Select the reason that best
            describes the problem.
          </p>

          <div className="mt-2 flex flex-wrap gap-1.5">
            {reasons.map(
              (item) => (
                <label
                  key={item.value}
                  className="flex cursor-pointer items-center gap-1.5 rounded border px-2 py-1 text-[10px] leading-none"
                  style={{
                    color:
                      reason === item.value
                        ? 'var(--accent)'
                        : 'var(--text-secondary)',
                    borderColor:
                      reason === item.value
                        ? 'var(--accent)'
                        : 'var(--border)',
                    background:
                      reason === item.value
                        ? 'var(--accent-soft)'
                        : 'transparent',
                  }}
                >
                  <input
                    type="radio"
                    name={`report-${targetType}-${targetId}`}
                    checked={
                      reason ===
                      item.value
                    }
                    onChange={() =>
                      setReason(
                        item.value,
                      )
                    }
                  />

                  {item.label}
                </label>
              ),
            )}
          </div>

          <textarea
            value={description}
            onChange={(event) =>
              setDescription(
                event.target.value,
              )
            }
            rows={3}
            placeholder="Additional details (optional)"
            className="mt-3 w-full resize-none border px-3 py-2 text-xs outline-none"
            style={{
              background:
                'var(--surface-secondary)',
              color:
                'var(--text-primary)',
              borderColor:
                'var(--border)',
            }}
          />

          {message && (
            <p
              className="mt-2 text-[10px] font-semibold"
              style={{
                color:
                  message ===
                  'Report submitted.'
                    ? 'var(--accent)'
                    : '#dc2626',
              }}
            >
              {message}
            </p>
          )}

          <div className="mt-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setOpen(false)
                setMessage(null)
              }}
              disabled={loading}
              className="border px-3 py-1.5 text-[10px] font-semibold"
              style={{
                background:
                  'var(--surface)',
                borderColor:
                  'var(--border)',
                color:
                  'var(--text-secondary)',
              }}
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={submitReport}
              disabled={loading}
              className="border px-3 py-1.5 text-[10px] font-bold"
              style={{
                background:
                  'var(--accent)',
                borderColor:
                  'var(--accent)',
                color: '#ffffff',
                opacity: loading
                  ? 0.6
                  : 1,
              }}
            >
              {loading
                ? 'Submitting...'
                : 'Submit Report'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}