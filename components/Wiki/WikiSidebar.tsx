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
          <option value="All">All Categories</option>
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
                  <div style={{ fontWeight: 600, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: 6 }}>
                    {entry.title}
                    {entry.is_public && (
                      <span title="Publicly editable" style={{ display: 'inline-flex', alignItems: 'center' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="-5.0 -10.0 110.0 135.0" width="15" height="15" style={{ marginLeft: 2 }}>
                          <path d="m23.102 24.461c3.7734 0 7.1758 2.2734 8.6172 5.7578 1.4453 3.4883 0.64844 7.5-2.0195 10.168-2.6719 2.668-6.6836 3.4688-10.168 2.0234-3.4883-1.4453-5.7617-4.8477-5.7617-8.6211 0-5.1523 4.1758-9.3281 9.332-9.3281zm50.738 44.129v7.7891c-0.003906 2.4805-2.0117 4.4844-4.4883 4.4922h-38.703c-2.4766-0.007813-4.4844-2.0117-4.4883-4.4922v-7.7891c0-8.5156 4.543-16.387 11.918-20.645 7.3789-4.2617 16.465-4.2617 23.844 0 7.375 4.2578 11.918 12.129 11.918 20.645zm-23.84-49.461c4.6133 0 8.7773 2.7812 10.543 7.043 1.7656 4.2656 0.78906 9.1719-2.4766 12.438-3.2617 3.2617-8.168 4.2383-12.434 2.4727-4.2617-1.7656-7.043-5.9258-7.043-10.543 0-6.3008 5.1094-11.41 11.41-11.41zm26.898 5.3281v0.003907c3.7734 0 7.1758 2.2734 8.6211 5.7578 1.4453 3.4883 0.64453 7.5-2.0234 10.168-2.668 2.668-6.6797 3.4688-10.168 2.0234-3.4844-1.4453-5.7578-4.8477-5.7578-8.6211 0-5.1523 4.1758-9.3281 9.3281-9.3281zm-53.059 50.184v-6c0.007812-7.9219 3.6094-15.414 9.7891-20.371-3.9414-2.5352-8.6641-3.5625-13.301-2.8945s-8.8789 2.9844-11.949 6.5273c-3.0664 3.543-4.7539 8.0703-4.75 12.758v6.3398c0.007813 2.0234 1.6484 3.6641 3.6719 3.6719zm72.551-10c0.003906-4.6875-1.6836-9.2148-4.75-12.758-3.0703-3.543-7.3086-5.8594-11.949-6.5273-4.6367-0.66797-9.3594 0.35938-13.301 2.8945 6.1797 4.957 9.7812 12.449 9.7891 20.371v6h16.539c2.0078-0.007813 3.6367-1.6172 3.6719-3.6211z" fillRule="evenodd" fill="#4caf50"/>
                        </svg>
                      </span>
                    )}
                  </div>
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
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
