'use server'
import type { RowLabel } from 'payload'
import React from 'react'

// RowLabel when used as a component receives { data, rowNumber, path }
// We cast data loosely since payload-types won't know the array item shape here.
type RowLabelProps = Parameters<Extract<RowLabel, (...args: any[]) => any>>[0]

export const TestimonialRowLabel: React.FC<RowLabelProps> = ({ data }) => {
  const row = data as { reviewer?: { name?: string }; rating?: number } | undefined

  const label = row?.reviewer?.name
    ? `${row.reviewer.name} — ${'★'.repeat(row.rating ?? 0)}`
    : 'New Testimonial'

  return <>{label}</>
}