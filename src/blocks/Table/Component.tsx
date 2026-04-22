import type { TableBlock as TableBlockType } from '@/payload-types'
import React from 'react'

type Props = TableBlockType

type AlignValue = 'left' | 'center' | 'right'

const ALIGN_CLASSES: Record<AlignValue, string> = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
}

export const TableBlock: React.FC<Props> = (props) => {
    // Guard: props may be incomplete during Payload's form-state render pass.
    if (!props || !props.cells?.length || !props.columns) return null

    const {
        cells = [],
        columns,
        caption,
        hasHeaderRow = true,
        hasHeaderColumn = false,
        striped = true,
        compact = false,
    } = props

    // Rebuild 2-D grid from the flat cells array
    const rows: typeof cells[number][][] = []
    for (let i = 0; i < cells.length; i += columns) {
        rows.push(cells.slice(i, i + columns))
    }

    if (!rows.length) return null

    const cellPadding = compact ? 'px-4 py-2' : 'px-5 py-3.5'

    return (
        <figure className="my-8 overflow-hidden rounded-2xl border border-zinc-200 shadow-sm dark:border-zinc-700">
            <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                    {caption && (
                        <caption className="border-b border-zinc-200 bg-zinc-50 px-5 py-3 text-left text-xs font-semibold uppercase tracking-widest text-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400">
                            {caption}
                        </caption>
                    )}

                    <tbody>
                        {rows.map((row, rowIndex) => {
                            const isHeaderRow = hasHeaderRow && rowIndex === 0

                            return (
                                <tr
                                    key={rowIndex}
                                    className={[
                                        isHeaderRow
                                            ? 'bg-zinc-900 text-zinc-100 dark:bg-zinc-800'
                                            : striped && rowIndex % 2 === 0
                                                ? 'bg-white dark:bg-zinc-900'
                                                : 'bg-zinc-50/70 dark:bg-zinc-800/50',
                                        'transition-colors duration-100 hover:bg-zinc-100 dark:hover:bg-zinc-700/50',
                                    ]
                                        .filter(Boolean)
                                        .join(' ')}
                                >
                                    {row.map((cell, colIndex) => {
                                        const isHeaderCell =
                                            isHeaderRow || (hasHeaderColumn && colIndex === 0)
                                        const align =
                                            ALIGN_CLASSES[(cell.align as AlignValue) ?? 'left'] ??
                                            ALIGN_CLASSES.left

                                        const className = [
                                            cellPadding,
                                            align,
                                            'border-b border-zinc-200 dark:border-zinc-700',
                                            isHeaderRow
                                                ? 'font-semibold tracking-wide text-zinc-100 last:border-r-0'
                                                : isHeaderCell
                                                    ? 'font-semibold text-zinc-800 dark:text-zinc-200 bg-zinc-50 dark:bg-zinc-800'
                                                    : 'text-zinc-700 dark:text-zinc-300',
                                        ]
                                            .filter(Boolean)
                                            .join(' ')

                                        return isHeaderCell ? (
                                            <th
                                                key={colIndex}
                                                scope={isHeaderRow ? 'col' : 'row'}
                                                className={className}
                                            >
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
    )
}

export default TableBlock