'use client'

import { RichText } from '@/components/RichText'
import type { CalloutBlock as CalloutBlockType } from '@/payload-types'
import React, { useState } from 'react'

type Props = {
    block: CalloutBlockType
}

const VARIANTS = {
    tip: {
        defaultEmoji: '💡',
        label: 'Tip',
        wrapper: 'bg-violet-50 border-violet-200',
        header: 'bg-violet-100/70 text-violet-800',
        badge: 'bg-violet-200 text-violet-800',
        body: 'text-violet-900',
        toggle: 'text-violet-600 hover:text-violet-800',
        accent: 'from-violet-400 to-violet-600',
    },
    note: {
        defaultEmoji: '📝',
        label: 'Note',
        wrapper: 'bg-slate-50 border-slate-200',
        header: 'bg-slate-100/70 text-slate-700',
        badge: 'bg-slate-200 text-slate-700',
        body: 'text-slate-800',
        toggle: 'text-slate-500 hover:text-slate-700',
        accent: 'from-slate-400 to-slate-600',
    },
    caution: {
        defaultEmoji: '⚠️',
        label: 'Caution',
        wrapper: 'bg-orange-50 border-orange-200',
        header: 'bg-orange-100/70 text-orange-800',
        badge: 'bg-orange-200 text-orange-800',
        body: 'text-orange-900',
        toggle: 'text-orange-600 hover:text-orange-800',
        accent: 'from-orange-400 to-orange-600',
    },
    keyTakeaway: {
        defaultEmoji: '🔑',
        label: 'Key Takeaway',
        wrapper: 'bg-yellow-50 border-yellow-300',
        header: 'bg-yellow-100/70 text-yellow-800',
        badge: 'bg-yellow-200 text-yellow-800',
        body: 'text-yellow-900',
        toggle: 'text-yellow-600 hover:text-yellow-800',
        accent: 'from-yellow-400 to-amber-500',
    },
    related: {
        defaultEmoji: '🔗',
        label: 'Related Reading',
        wrapper: 'bg-teal-50 border-teal-200',
        header: 'bg-teal-100/70 text-teal-800',
        badge: 'bg-teal-200 text-teal-800',
        body: 'text-teal-900',
        toggle: 'text-teal-600 hover:text-teal-800',
        accent: 'from-teal-400 to-teal-600',
    },
    tryIt: {
        defaultEmoji: '🧪',
        label: 'Try It',
        wrapper: 'bg-green-50 border-green-200',
        header: 'bg-green-100/70 text-green-800',
        badge: 'bg-green-200 text-green-800',
        body: 'text-green-900',
        toggle: 'text-green-600 hover:text-green-800',
        accent: 'from-green-400 to-emerald-500',
    },
} as const

type VariantKey = keyof typeof VARIANTS

export const CalloutBlock: React.FC<Props> = ({ block }) => {
    const { variant = 'tip', emoji, heading, content, collapsible } = block
    const [open, setOpen] = useState(true)

    const cfg = VARIANTS[variant as VariantKey] ?? VARIANTS.tip
    const icon = emoji || cfg.defaultEmoji

    return (
        <aside
            className={`
        my-8 overflow-hidden rounded-2xl border shadow-sm
        transition-all duration-300
        ${cfg.wrapper}
      `}
        >
            {/* Header */}
            <div
                className={`
          flex items-center gap-3 px-5 py-3
          ${cfg.header}
          ${collapsible ? 'cursor-pointer select-none' : ''}
        `}
                onClick={collapsible ? () => setOpen((o) => !o) : undefined}
                role={collapsible ? 'button' : undefined}
                aria-expanded={collapsible ? open : undefined}
            >
                {/* Gradient accent stripe */}
                <span
                    className={`h-5 w-1 shrink-0 rounded-full bg-linear-to-b ${cfg.accent}`}
                    aria-hidden
                />

                <span className="text-xl leading-none" role="img" aria-label={cfg.label}>
                    {icon}
                </span>

                {heading ? (
                    <span className="flex-1 text-sm font-semibold">{heading}</span>
                ) : (
                    <span
                        className={`
              rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-widest
              ${cfg.badge}
            `}
                    >
                        {cfg.label}
                    </span>
                )}

                {collapsible && (
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className={`ml-auto h-4 w-4 shrink-0 transition-transform duration-200 ${cfg.toggle} ${open ? 'rotate-0' : '-rotate-90'}`}
                    >
                        <path
                            fillRule="evenodd"
                            d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
                            clipRule="evenodd"
                        />
                    </svg>
                )}
            </div>

            {/* Body */}
            {(!collapsible || open) && (
                <div className={`px-5 py-4 ${cfg.body}`}>
                    {heading && (
                        <span
                            className={`
                mb-3 inline-block rounded-full px-2.5 py-0.5
                text-xs font-semibold uppercase tracking-widest
                ${cfg.badge}
              `}
                        >
                            {cfg.label}
                        </span>
                    )}
                    <div className="prose prose-sm max-w-none">
                        {content && <RichText data={content} />}
                    </div>
                </div>
            )}
        </aside>
    )
}

export default CalloutBlock