// Centralized theme and style constants for the TTRPG Colab Builder app

export const theme = {
  colors: {
    // Pick ONE bold accent. Let's make the Red more "Blood/Wax Seal"
    primary: '#8C3131',
    secondary: '#4A5D43', // Deep forest green (better contrast)
    success: '#4A5D43',
    danger: '#8C3131',
    background: {
      main: '#F4EFE6',      // Lighter, cleaner parchment
      secondary: '#E8DCC4', // Defined card background
      tertiary: '#D9C5A3',  // Distinct depth layer
      input: '#FFFFFF',     // Clean white inputs feel more "app-like"
      error: '#FDECEA',
      success: '#F0F4EF',
      highlight: 'rgba(255, 188, 112, 1)'
    },
    text: {
      primary: '#1A1612',   // Near black-brown for extreme readability
      secondary: '#4A3F35', // Distinct secondary
      tertiary: '#6B5B47', // Added tertiary for better hierarchy
      muted: '#857564'      // Proper muted state
    },
    border: {
      primary: '#C9B897',   // Subtle border
      secondary: '#A69277', // Stronger border for focus
      tertiary: '#9A7B5F'   // Even stronger for emphasis
    }
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    xxl: '3rem'
  },
  borderRadius: '8px', // INCREASE BORDER RADIUS for a modern feel
  shadow: '0 2px 8px rgba(0,0,0,0.1)', // ADD BOX SHADOWS (This is what you're missing for "depth")
  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem', 
    md: '1rem',
    lg: '1.25rem',
    xl: '1.5rem',
    xxl: '2rem'
  },
  fontWeight: {
    normal: 400,
    bold: 700
  }
}

export const styles = {
  // Layout
  container: {
    padding: theme.spacing.xl,
    maxWidth: '900px',
    margin: '0 auto'
  },
  card: {
    background: theme.colors.background.secondary,
    border: `1px solid ${theme.colors.border.primary}`,
    borderRadius: '12px',
    padding: theme.spacing.xl,
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)', // Adds "Lift"
  },
  section: {
    marginBottom: theme.spacing.xl
  },

  // Typography
  heading1: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.lg
  },
  heading2: {
    fontSize: theme.fontSize.xl,
    marginBottom: theme.spacing.md
  },
  text: {
    color: theme.colors.text.primary
  },
  textSecondary: {
    color: theme.colors.text.secondary
  },
  textMuted: {
    color: theme.colors.text.muted
  },

  // Form elements
  label: {
    display: 'block',
    marginBottom: theme.spacing.sm,
    color: theme.colors.text.secondary
  },
  input: {
    width: '100%',
    padding: theme.spacing.md,
    background: theme.colors.background.input,
    border: `1px solid ${theme.colors.border.secondary}`,
    borderRadius: theme.borderRadius,
    color: theme.colors.text.primary,
    fontSize: theme.fontSize.md
  },
  textarea: {
    width: '100%',
    padding: theme.spacing.md,
    background: theme.colors.background.input,
    border: `1px solid ${theme.colors.border.secondary}`,
    borderRadius: theme.borderRadius,
    color: theme.colors.text.primary,
    fontFamily: 'monospace',
    fontSize: theme.fontSize.sm,
    resize: 'vertical' as const,
    lineHeight: 1.6
  },
  select: {
    width: '100%',
    padding: theme.spacing.md,
    background: theme.colors.background.secondary,
    border: `1px solid ${theme.colors.border.secondary}`,
    borderRadius: theme.borderRadius,
    color: theme.colors.text.primary,
    fontSize: theme.fontSize.md
  },

  // Buttons
  button: {
    primary: {
      padding: `${theme.spacing.md} ${theme.spacing.lg}`,
      background: theme.colors.primary,
      color: '#FFFFFF', // Light text on primary background
      border: 'none',
      borderRadius: theme.borderRadius,
      cursor: 'pointer',
      fontWeight: theme.fontWeight.bold,
      fontSize: theme.fontSize.sm
    },
    secondary: {
      padding: `${theme.spacing.md} ${theme.spacing.lg}`,
      background: theme.colors.background.secondary,
      color: theme.colors.text.primary,
      border: `1px solid ${theme.colors.border.tertiary}`,
      borderRadius: theme.borderRadius,
      cursor: 'pointer',
      fontWeight: theme.fontWeight.bold,
      fontSize: theme.fontSize.sm
    },
    danger: {
      padding: `${theme.spacing.md} ${theme.spacing.lg}`,
      background: 'transparent',
      color: theme.colors.danger,
      border: `1px solid ${theme.colors.danger}`,
      borderRadius: theme.borderRadius,
      cursor: 'pointer',
      fontWeight: theme.fontWeight.bold,
      fontSize: theme.fontSize.sm
    }
  },

  // Shorthand button styles for convenience
  buttonPrimary: {
    padding: `${theme.spacing.md} ${theme.spacing.lg}`,
    background: theme.colors.primary,
    color: '#FFFFFF', // White text on blood red background
    border: 'none',
    borderRadius: theme.borderRadius,
    cursor: 'pointer',
    fontWeight: theme.fontWeight.bold,
    fontSize: theme.fontSize.sm,
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)' // Subtle shadow for depth
  },
  buttonSecondary: {
    padding: `${theme.spacing.md} ${theme.spacing.lg}`,
    background: theme.colors.background.secondary,
    color: theme.colors.text.primary,
    border: `1px solid ${theme.colors.border.secondary}`,
    borderRadius: theme.borderRadius,
    cursor: 'pointer',
    fontWeight: theme.fontWeight.bold,
    fontSize: theme.fontSize.sm,
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)' // Subtle shadow for secondary buttons
  },
  buttonDanger: {
    padding: `${theme.spacing.md} ${theme.spacing.lg}`,
    background: 'transparent',
    color: theme.colors.danger,
    border: `1px solid ${theme.colors.danger}`,
    borderRadius: theme.borderRadius,
    cursor: 'pointer',
    fontWeight: theme.fontWeight.bold,
    fontSize: theme.fontSize.sm,
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)' // Very subtle shadow for danger buttons
  },

  // Tabs
  tabContainer: {
    display: 'flex',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
    borderBottom: `1px solid ${theme.colors.border.primary}`
  },
  tab: {
    active: {
      padding: `${theme.spacing.sm} ${theme.spacing.md}`,
      background: theme.colors.background.secondary,
      color: theme.colors.text.primary,
      border: 'none',
      borderBottom: `2px solid ${theme.colors.primary}`,
      cursor: 'pointer',
      fontSize: theme.fontSize.sm
    },
    inactive: {
      padding: `${theme.spacing.sm} ${theme.spacing.md}`,
      background: 'transparent',
      color: theme.colors.text.muted,
      border: 'none',
      borderBottom: `2px solid transparent`,
      cursor: 'pointer',
      fontSize: theme.fontSize.sm
    }
  },

  // Preview
  preview: {
    padding: theme.spacing.md,
    background: theme.colors.background.tertiary,
    border: `1px solid ${theme.colors.border.secondary}`,
    borderRadius: theme.borderRadius,
    minHeight: '400px'
  },

  // Flex utilities
  flexBetween: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  flexWrap: {
    display: 'flex',
    gap: theme.spacing.lg,
    flexWrap: 'wrap' as const
  },

  // Specific components
  sessionCard: {
    background: theme.colors.background.secondary,
    border: `1px solid ${theme.colors.border.primary}`,
    borderRadius: '12px',
    padding: theme.spacing.xl,
    marginBottom: theme.spacing.lg,
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)' // Consistent with card style
  },
  sessionDetails: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gridTemplateRows: 'auto auto auto',
    gap: theme.spacing.sm,
    marginBottom: 0
  },
  detailItem: {
    background: theme.colors.background.tertiary,
    border: `1px solid ${theme.colors.border.primary}`,
    borderRadius: '6px',
    padding: theme.spacing.sm,
    textAlign: 'center' as const,
    fontSize: theme.fontSize.sm,
    color: theme.colors.text.secondary,
    minHeight: '50px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: theme.fontWeight.bold
  },
  gameSystemItem: {
    gridColumn: '1 / -1',
    background: theme.colors.background.tertiary,
    border: `1px solid ${theme.colors.border.primary}`,
    borderRadius: '6px',
    padding: theme.spacing.sm,
    textAlign: 'center' as const,
    fontSize: theme.fontSize.md,
    color: theme.colors.text.primary,
    minHeight: '50px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: theme.fontWeight.bold
  }
}