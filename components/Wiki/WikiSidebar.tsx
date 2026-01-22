'use client'

import React, { useState } from 'react'
import { useTheme } from '../../contexts/ThemeContext'
import { useWiki } from '../../contexts/WikiContext'
import { wikiCategories } from '../../lib/wikiCategories'

/**
 * WikiSidebar - Left sidebar with search, filtering, entry list
 * Shows searchable, filterable list of all entries
 * Highlights selected entry
 */
export function WikiSidebar() {
  const { theme } = useTheme()
  const {
    searchQuery,
    updateSearchQuery,
    selectedCategory,
    updateCategory,
    filteredEntries,
    selectedEntry,
    selectEntry,
  } = useWiki()

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
        marginRight: '0rem'
      }}
    >
      {/* Search input */}
      <div style={{ padding: theme.spacing.md, borderBottom: `1px solid ${theme.colors.border}` }}>
        <input
          type="text"
          placeholder="Search entries..."
          value={searchQuery}
          onChange={(e) => updateSearchQuery(e.target.value)}
          style={{
            width: '100%',
            padding: theme.spacing.sm,
            border: `1px solid ${theme.colors.border.primary}`,
            borderRadius: theme.borderRadius,
            backgroundColor: theme.colors.background.input,
            color: theme.colors.text.primary,
            fontSize: '14px',
            boxSizing: 'border-box',
          }}
        />
      </div>

      {/* Category filter */}
      <div style={{ padding: theme.spacing.md, borderBottom: `1px solid ${theme.colors.border}` }}>
        <label
          style={{
            display: 'block',
            fontSize: '12px',
            fontWeight: 600,
            color: theme.colors.text.secondary,
            marginBottom: theme.spacing.sm,
            textTransform: 'uppercase',
          }}
        >
          Category
        </label>
        <select
          value={selectedCategory}
          onChange={(e) => updateCategory(e.target.value)}
          style={{
            width: '100%',
            padding: theme.spacing.sm,
            border: `1px solid ${theme.colors.border.primary}`,
            borderRadius: theme.borderRadius,
            backgroundColor: theme.colors.background.input,
            color: theme.colors.text.primary,
            fontSize: '14px',
            cursor: 'pointer',
          }}
        >
          <option value="">All Categories</option>
          {wikiCategories.map((cat) => (
            <option key={cat} value={cat}>
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Entry list */}
      <div
        style={{
          flex: 1,
          overflow: 'auto',
          padding: theme.spacing.sm,
        }}
      >
        {filteredEntries.length === 0 ? (
          <div
            style={{
              padding: theme.spacing.md,
              textAlign: 'center',
              color: theme.colors.text.secondary,
              fontSize: '14px',
            }}
          >
            No entries found
          </div>
        ) : (
          <ul
            style={{
              listStyle: 'none',
              margin: 0,
              padding: 0,
            }}
          >
            {filteredEntries.map((entry) => (
              <li key={entry.id}>
                <a href={`/wiki/${entry.slug}`}>
                <button
                  onClick={() => selectEntry(entry)}
                  style={{
                    width: '100%',
                    padding: theme.spacing.md,
                    margin: `${theme.spacing.xs} 0`,
                    textAlign: 'left',
                    border: 'none',
                    borderRadius: theme.borderRadius,
                    backgroundColor:
                      selectedEntry?.id === entry.id
                        ? theme.colors.primary
                        : theme.colors.background.secondary,
                    color:
                      selectedEntry?.id === entry.id
                        ? '#fff'
                        : theme.colors.text.primary,
                    cursor: 'pointer',
                    transition: 'background-color 0.2s',
                    fontSize: '14px',
                    fontWeight: selectedEntry?.id === entry.id ? 600 : 400,
                  }}
                  onMouseEnter={(e) => {
                    if (selectedEntry?.id !== entry.id) {
                      e.currentTarget.style.backgroundColor = theme.colors.background.secondary
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedEntry?.id !== entry.id) {
                      e.currentTarget.style.backgroundColor = 'transparent'
                    }
                  }}
                >
                  <div style={{ fontWeight: 600, marginBottom: '4px' }}>{entry.title}</div>
                  <div
                    style={{
                      fontSize: '12px',
                      color:
                        selectedEntry?.id === entry.id
                          ? '#fff'
                          : theme.colors.text.secondary,
                    }}
                  >
                    {entry.category}
                  </div>
                  
                </button>
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
