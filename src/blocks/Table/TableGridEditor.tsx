'use client'

import { useField } from '@payloadcms/ui'
import React, { useCallback, useEffect, useRef, useState } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

type AlignValue = 'left' | 'center' | 'right'

type CellData = {
    content: string
    align: AlignValue
}

type TableData = {
    rows: CellData[][]
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeCell(content = '', align: AlignValue = 'left'): CellData {
    return { content, align }
}

function makeGrid(rowCount: number, colCount: number): CellData[][] {
    return Array.from({ length: rowCount }, () =>
        Array.from({ length: colCount }, () => makeCell()),
    )
}

function cloneGrid(grid: CellData[][]): CellData[][] {
    return grid.map((row) => row.map((cell) => ({ ...cell })))
}

// ─── Component ────────────────────────────────────────────────────────────────

export const TableGridEditor: React.FC<{ path?: string }> = ({ path = 'table' }) => {
    // Bind to the single JSON field called `table`
    const { value, setValue } = useField<TableData | null>({ path })

    // ── Local grid state ──────────────────────────────────────────────────────
    const initialGrid = (): CellData[][] => {
        const parsed = value as TableData | null
        if (parsed?.rows?.length) return parsed.rows
        return makeGrid(3, 3)
    }

    const [grid, setGrid] = useState<CellData[][]>(initialGrid)
    const [activeCell, setActiveCell] = useState<{ row: number; col: number } | null>(null)

    // Keep a ref so the flush-to-payload callback always sees the latest grid
    // without needing to be re-created on every keystroke.
    const gridRef = useRef(grid)
    gridRef.current = grid

    // ── Sync grid → Payload field ─────────────────────────────────────────────
    // Debounce slightly so we don't hammer Payload on every keystroke.
    const flushTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

    const scheduleFlush = useCallback(() => {
        if (flushTimer.current) clearTimeout(flushTimer.current)
        flushTimer.current = setTimeout(() => {
            setValue({ rows: gridRef.current })
        }, 150)
    }, [setValue])

    // When grid changes, push to Payload
    useEffect(() => {
        scheduleFlush()
        return () => {
            if (flushTimer.current) clearTimeout(flushTimer.current)
        }
    }, [grid, scheduleFlush])

    // ── Cell helpers ──────────────────────────────────────────────────────────
    const updateCell = (row: number, col: number, patch: Partial<CellData>) => {
        setGrid((prev) => {
            const next = cloneGrid(prev)
            next[row][col] = { ...next[row][col], ...patch }
            return next
        })
    }

    // ── Row / column operations ───────────────────────────────────────────────
    const addRow = () =>
        setGrid((prev) => [...prev, Array.from({ length: prev[0]?.length ?? 1 }, () => makeCell())])

    const removeRow = (ri: number) =>
        setGrid((prev) => {
            if (prev.length <= 1) return prev
            return prev.filter((_, i) => i !== ri)
        })

    const addCol = () =>
        setGrid((prev) => prev.map((row) => [...row, makeCell()]))

    const removeCol = (ci: number) =>
        setGrid((prev) => {
            if ((prev[0]?.length ?? 0) <= 1) return prev
            return prev.map((row) => row.filter((_, i) => i !== ci))
        })

    // ── Keyboard navigation ───────────────────────────────────────────────────
    const handleKeyDown = (
        e: React.KeyboardEvent<HTMLInputElement>,
        row: number,
        col: number,
    ) => {
        const rows = gridRef.current.length
        const cols = gridRef.current[0]?.length ?? 0

        if (e.key === 'Tab') {
            e.preventDefault()
            const nextCol = e.shiftKey ? col - 1 : col + 1
            if (nextCol >= 0 && nextCol < cols) setActiveCell({ row, col: nextCol })
            else if (!e.shiftKey && row + 1 < rows) setActiveCell({ row: row + 1, col: 0 })
            else if (e.shiftKey && row - 1 >= 0) setActiveCell({ row: row - 1, col: cols - 1 })
        } else if (e.key === 'Enter') {
            e.preventDefault()
            if (row + 1 < rows) setActiveCell({ row: row + 1, col })
        } else if (e.key === 'ArrowRight' && (e.target as HTMLInputElement).selectionStart === (e.target as HTMLInputElement).value.length) {
            if (col + 1 < cols) setActiveCell({ row, col: col + 1 })
        } else if (e.key === 'ArrowLeft' && (e.target as HTMLInputElement).selectionStart === 0) {
            if (col - 1 >= 0) setActiveCell({ row, col: col - 1 })
        } else if (e.key === 'ArrowDown') {
            if (row + 1 < rows) setActiveCell({ row: row + 1, col })
        } else if (e.key === 'ArrowUp') {
            if (row - 1 >= 0) setActiveCell({ row: row - 1, col })
        }
    }

    // Focus the active cell whenever it changes
    const cellRefs = useRef<Map<string, HTMLInputElement>>(new Map())
    useEffect(() => {
        if (!activeCell) return
        const key = `${activeCell.row}-${activeCell.col}`
        cellRefs.current.get(key)?.focus()
    }, [activeCell])

    // ── Render ────────────────────────────────────────────────────────────────
    const rows = grid.length
    const cols = grid[0]?.length ?? 0

    return (
        <div style={{ fontFamily: 'inherit' }}>
            <label
                style={{
                    display: 'block',
                    marginBottom: 8,
                    fontSize: 12,
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    color: 'var(--theme-elevation-500)',
                }}
            >
                Table Data
            </label>

            {/* ── Grid ── */}
            <div style={{ overflowX: 'auto', marginBottom: 8 }}>
                <table
                    style={{
                        borderCollapse: 'collapse',
                        width: '100%',
                        minWidth: cols * 120,
                    }}
                >
                    {/* Column-header row: shows col index + remove button */}
                    <thead>
                        <tr>
                            {/* spacer for the row-number gutter */}
                            <th style={{ width: 28 }} />
                            {Array.from({ length: cols }, (_, ci) => (
                                <th
                                    key={ci}
                                    style={{
                                        padding: '2px 4px',
                                        textAlign: 'center',
                                        fontSize: 10,
                                        color: 'var(--theme-elevation-400)',
                                        fontWeight: 400,
                                        whiteSpace: 'nowrap',
                                    }}
                                >
                                    {colLabel(ci)}
                                    {cols > 1 && (
                                        <button
                                            type="button"
                                            title="Remove column"
                                            onClick={() => removeCol(ci)}
                                            style={iconBtn}
                                        >
                                            ×
                                        </button>
                                    )}
                                </th>
                            ))}
                            {/* placeholder for the "add col" button column */}
                            <th />
                        </tr>
                    </thead>

                    <tbody>
                        {grid.map((row, ri) => (
                            <tr key={ri}>
                                {/* Row number gutter */}
                                <td
                                    style={{
                                        width: 28,
                                        textAlign: 'center',
                                        fontSize: 10,
                                        color: 'var(--theme-elevation-400)',
                                        userSelect: 'none',
                                        verticalAlign: 'middle',
                                    }}
                                >
                                    {ri + 1}
                                    {rows > 1 && (
                                        <button
                                            type="button"
                                            title="Remove row"
                                            onClick={() => removeRow(ri)}
                                            style={{ ...iconBtn, display: 'block', margin: '0 auto' }}
                                        >
                                            ×
                                        </button>
                                    )}
                                </td>

                                {row.map((cell, ci) => {
                                    const isActive =
                                        activeCell?.row === ri && activeCell?.col === ci
                                    const cellKey = `${ri}-${ci}`

                                    return (
                                        <td
                                            key={ci}
                                            style={{
                                                padding: 0,
                                                border: `1px solid ${isActive
                                                    ? 'var(--theme-success-500, #6366f1)'
                                                    : 'var(--theme-elevation-200)'
                                                    }`,
                                                background: isActive
                                                    ? 'var(--theme-elevation-50)'
                                                    : 'transparent',
                                                position: 'relative',
                                            }}
                                        >
                                            <input
                                                ref={(el) => {
                                                    if (el) cellRefs.current.set(cellKey, el)
                                                    else cellRefs.current.delete(cellKey)
                                                }}
                                                type="text"
                                                value={cell.content}
                                                placeholder="…"
                                                onChange={(e) =>
                                                    updateCell(ri, ci, { content: e.target.value })
                                                }
                                                onFocus={() => setActiveCell({ row: ri, col: ci })}
                                                onKeyDown={(e) => handleKeyDown(e, ri, ci)}
                                                style={{
                                                    width: '100%',
                                                    minWidth: 100,
                                                    border: 'none',
                                                    outline: 'none',
                                                    background: 'transparent',
                                                    padding: '6px 8px',
                                                    fontSize: 13,
                                                    color: 'var(--theme-elevation-800)',
                                                    boxSizing: 'border-box',
                                                }}
                                            />

                                            {/* Per-cell alignment picker (shown when active) */}
                                            {isActive && (
                                                <div
                                                    style={{
                                                        position: 'absolute',
                                                        top: 2,
                                                        right: 2,
                                                        display: 'flex',
                                                        gap: 1,
                                                        zIndex: 10,
                                                    }}
                                                >
                                                    {(['left', 'center', 'right'] as AlignValue[]).map(
                                                        (a) => (
                                                            <button
                                                                key={a}
                                                                type="button"
                                                                title={`Align ${a}`}
                                                                onClick={() =>
                                                                    updateCell(ri, ci, { align: a })
                                                                }
                                                                style={{
                                                                    ...alignBtn,
                                                                    background:
                                                                        cell.align === a
                                                                            ? 'var(--theme-success-500, #6366f1)'
                                                                            : 'var(--theme-elevation-150)',
                                                                    color:
                                                                        cell.align === a
                                                                            ? '#fff'
                                                                            : 'var(--theme-elevation-500)',
                                                                }}
                                                            >
                                                                {a === 'left'
                                                                    ? '⬅'
                                                                    : a === 'center'
                                                                        ? '↔'
                                                                        : '➡'}
                                                            </button>
                                                        ),
                                                    )}
                                                </div>
                                            )}
                                        </td>
                                    )
                                })}

                                {/* Add-column button (only on first data row) */}
                                {ri === 0 && (
                                    <td rowSpan={rows} style={{ verticalAlign: 'middle', paddingLeft: 4 }}>
                                        <button
                                            type="button"
                                            title="Add column"
                                            onClick={addCol}
                                            style={addBtn}
                                        >
                                            + col
                                        </button>
                                    </td>
                                )}
                            </tr>
                        ))}

                        {/* Add-row button row */}
                        <tr>
                            <td />
                            <td colSpan={cols} style={{ paddingTop: 4 }}>
                                <button
                                    type="button"
                                    title="Add row"
                                    onClick={addRow}
                                    style={addBtn}
                                >
                                    + row
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* ── Dimensions badge ── */}
            <div
                style={{
                    fontSize: 11,
                    color: 'var(--theme-elevation-400)',
                    marginTop: 4,
                }}
            >
                {rows} × {cols} &nbsp;·&nbsp; Tab / Arrow keys to navigate
            </div>
        </div>
    )
}

// ─── Style helpers ─────────────────────────────────────────────────────────────

const iconBtn: React.CSSProperties = {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '0 3px',
    fontSize: 13,
    lineHeight: 1,
    color: 'var(--theme-elevation-400)',
    borderRadius: 3,
}

const alignBtn: React.CSSProperties = {
    border: 'none',
    cursor: 'pointer',
    padding: '1px 3px',
    fontSize: 9,
    lineHeight: 1,
    borderRadius: 2,
}

const addBtn: React.CSSProperties = {
    background: 'none',
    border: '1px dashed var(--theme-elevation-300)',
    borderRadius: 4,
    cursor: 'pointer',
    padding: '3px 10px',
    fontSize: 11,
    color: 'var(--theme-elevation-500)',
}

/** Convert 0-based column index → spreadsheet-style label (A, B, …, Z, AA, …) */
function colLabel(n: number): string {
    let s = ''
    n++
    while (n > 0) {
        n--
        s = String.fromCharCode(65 + (n % 26)) + s
        n = Math.floor(n / 26)
    }
    return s
}

export default TableGridEditor