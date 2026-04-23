import type { TableBlock as TableBlockType } from '@/payload-types'
import React from 'react'

type AlignValue = 'left' | 'center' | 'right'
type StyleValue = 'dark-sleek' | 'colorful' | 'magazine' | 'minimal' | 'spreadsheet'

const ALIGN_CLASSES: Record<AlignValue, string> = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
}

type StyleConfig = {
    figure: string
    caption: string
    headerRow: string
    evenRow: string
    oddRow: string
    hoverRow: string
    headerCell: string
    headerColCell: string
    bodyCell: string
    cell: string
}

const STYLES: Record<StyleValue, StyleConfig> = {
    'dark-sleek': {
        figure: 'my-8 overflow-hidden rounded-2xl border border-zinc-800 shadow-xl bg-zinc-950',
        caption: 'border-b border-zinc-700 bg-zinc-900 px-5 py-3 text-left text-xs font-semibold uppercase tracking-widest text-zinc-400',
        headerRow: 'bg-zinc-900 text-zinc-100',
        evenRow: 'bg-zinc-950',
        oddRow: 'bg-zinc-900/60',
        hoverRow: 'hover:bg-zinc-800/70',
        headerCell: 'font-semibold tracking-wide text-zinc-100',
        headerColCell: 'font-semibold text-zinc-200 bg-zinc-900',
        bodyCell: 'text-zinc-300',
        cell: 'px-5 py-3.5 border-b border-zinc-800',
    },
    colorful: {
        figure: 'my-8 overflow-hidden rounded-2xl border border-violet-200 shadow-lg',
        caption: 'border-b border-violet-200 bg-violet-50 px-5 py-3 text-left text-xs font-semibold uppercase tracking-widest text-violet-500',
        headerRow: 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white',
        evenRow: 'bg-white',
        oddRow: 'bg-violet-50/50',
        hoverRow: 'hover:bg-violet-50',
        headerCell: 'font-semibold tracking-wide text-white',
        headerColCell: 'font-semibold text-violet-700 bg-violet-50',
        bodyCell: 'text-zinc-700',
        cell: 'px-5 py-3.5 border-b border-violet-100',
    },
    magazine: {
        figure: 'my-10 overflow-hidden border-t-4 border-zinc-900',
        caption: 'border-b-2 border-zinc-900 bg-white px-0 py-4 text-left text-2xl font-black uppercase tracking-tight text-zinc-900 font-serif',
        headerRow: 'bg-white border-b-2 border-zinc-900',
        evenRow: 'bg-white',
        oddRow: 'bg-zinc-50',
        hoverRow: 'hover:bg-amber-50',
        headerCell: 'font-black uppercase tracking-widest text-zinc-900 text-xs',
        headerColCell: 'font-black uppercase text-zinc-900',
        bodyCell: 'text-zinc-600 font-light',
        cell: 'px-5 py-4 border-b border-zinc-200',
    },
    minimal: {
        figure: 'my-8 overflow-hidden rounded-xl border border-zinc-200 shadow-sm',
        caption: 'border-b border-zinc-200 bg-zinc-50 px-5 py-2.5 text-left text-xs text-zinc-400 tracking-wide',
        headerRow: 'bg-zinc-50',
        evenRow: 'bg-white',
        oddRow: 'bg-white',
        hoverRow: 'hover:bg-zinc-50',
        headerCell: 'font-medium text-zinc-700',
        headerColCell: 'font-medium text-zinc-600',
        bodyCell: 'text-zinc-500',
        cell: 'px-5 py-3 border-b border-zinc-100',
    },
    spreadsheet: {
        figure: 'my-6 overflow-hidden border border-zinc-300',
        caption: 'border-b border-zinc-300 bg-zinc-100 px-3 py-2 text-left text-xs font-medium text-zinc-500',
        headerRow: 'bg-zinc-100',
        evenRow: 'bg-white',
        oddRow: 'bg-zinc-50/80',
        hoverRow: 'hover:bg-blue-50/50',
        headerCell: 'font-semibold text-zinc-700 text-xs uppercase tracking-wide',
        headerColCell: 'font-semibold text-zinc-700 bg-zinc-100 text-xs',
        bodyCell: 'text-zinc-600 text-xs',
        cell: 'px-3 py-2 border-b border-r border-zinc-200',
    },
}

// Shape stored inside the `table` JSON field (written by TableGridEditor)
type CellData = {
    content?: string | null
    align?: AlignValue
}

type TableData = {
    rows: CellData[][]
}

export const TableBlock: React.FC<TableBlockType> = (props) => {
    if (!props) return null

    const {
        caption,
        style = 'dark-sleek',
        hasHeaderRow = true,
        hasHeaderColumn = false,
        striped = true,
        compact = false,
    } = props

    // `table` is the JSON field — parse it if it came back as a string,
    // otherwise use it directly.
    const tableData: TableData | null = (() => {
        const raw = (props as any).table
        if (!raw) return null
        if (typeof raw === 'string') {
            try { return JSON.parse(raw) } catch { return null }
        }
        return raw as TableData
    })()

    const rows = tableData?.rows
    if (!rows?.length) return null

    const s = STYLES[(style as StyleValue) ?? 'dark-sleek'] ?? STYLES['dark-sleek']
    const isSpreadsheet = style === 'spreadsheet'
    const isMagazine = style === 'magazine'
    const cellPadding = isSpreadsheet ? '' : compact ? 'px-4 py-2' : ''

    return (
        <div className='container mx-auto'>
            <figure className={s.figure}>
                <div className="overflow-x-auto">
                    <table className={`w-full border-collapse ${isSpreadsheet ? 'text-xs' : 'text-sm'}`}>
                        {caption && (
                            <caption className={`${s.caption} ${isMagazine ? 'font-serif' : ''}`}>
                                {caption}
                            </caption>
                        )}
                        <tbody>
                            {rows.map((row, rowIndex) => {
                                const isHeaderRow = hasHeaderRow && rowIndex === 0
                                const rowBg = isHeaderRow
                                    ? s.headerRow
                                    : striped && rowIndex % 2 !== 0
                                        ? s.oddRow
                                        : s.evenRow

                                return (
                                    <tr
                                        key={rowIndex}
                                        className={`${rowBg} ${s.hoverRow} transition-colors duration-100`}
                                    >
                                        {isSpreadsheet && (
                                            <td className="w-8 select-none border-b border-r border-zinc-300 bg-zinc-100 text-center text-[10px] text-zinc-400">
                                                {rowIndex + 1}
                                            </td>
                                        )}
                                        {row.map((cell, colIndex) => {
                                            const isHeaderCell =
                                                isHeaderRow || (hasHeaderColumn && colIndex === 0)
                                            const align =
                                                ALIGN_CLASSES[(cell.align as AlignValue) ?? 'left'] ??
                                                ALIGN_CLASSES.left
                                            const cellStyle = isHeaderRow
                                                ? s.headerCell
                                                : isHeaderCell
                                                    ? s.headerColCell
                                                    : s.bodyCell
                                            const className = [
                                                s.cell,
                                                cellPadding,
                                                align,
                                                cellStyle,
                                                isMagazine && isHeaderRow ? 'font-serif' : '',
                                            ]
                                                .filter(Boolean)
                                                .join(' ')

                                            return isHeaderCell ? (
                                                <th key={colIndex} scope={isHeaderRow ? 'col' : 'row'} className={className}>
                                                    {cell.content}
                                                </th>
                                            ) : (
                                                <td key={colIndex} className={className}>
                                                    {cell.content}
                                                </td>
                                            )
                                        })}
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </figure>
        </div>
    )
}

export default TableBlock