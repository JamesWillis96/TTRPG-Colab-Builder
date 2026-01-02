// Centralized theme and style constants for the TTRPG Colab Builder app

export const lightTheme = {
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

export const darkTheme = {
  colors: {
    primary: '#B84A4A', // Lighter red for dark mode
    secondary: '#9ea365ff', // Lighter green
    success: '#5A6D53',
    danger: '#B84A4A',
    background: {
      main: '#1A1612',      // Dark parchment
      secondary: '#2A2520', // Dark card background
      tertiary: '#3A3228',  // Dark depth layer
      input: '#2A2520',     // Dark inputs
      error: '#3A1A1A',
      success: '#1A2A1A',
      highlight: 'rgba(255, 188, 112, 0.3)'
    },
    text: {
      primary: '#F4EFE6',   // Light text
      secondary: '#D9C5A3', // Light secondary
      tertiary: '#C9B897',  // Light tertiary
      muted: '#A69277'      // Muted light
    },
    border: {
      primary: '#4A3F35',   // Dark border
      secondary: '#6B5B47', // Stronger dark border
      tertiary: '#857564'   // Even stronger
    }
  },
  spacing: lightTheme.spacing,
  borderRadius: lightTheme.borderRadius,
  shadow: '0 2px 8px rgba(0,0,0,0.3)',
  fontSize: lightTheme.fontSize,
  fontWeight: lightTheme.fontWeight
}

// Legacy export for backward compatibility
export const theme = lightTheme

export const createStyles = (currentTheme: typeof lightTheme) => ({
  // Layout
  container: {
    padding: currentTheme.spacing.xl,
    maxWidth: '900px',
    margin: '0 auto'
  },
  card: {
    background: currentTheme.colors.background.secondary,
    border: `1px solid ${currentTheme.colors.border.primary}`,
    borderRadius: '12px',
    padding: currentTheme.spacing.xl,
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)', // Adds "Lift"
  },
  section: {
    marginBottom: currentTheme.spacing.xl
  },

  // Typography
  heading1: {
    fontSize: currentTheme.fontSize.xxl,
    fontWeight: currentTheme.fontWeight.bold,
    color: currentTheme.colors.text.primary,
    marginBottom: currentTheme.spacing.lg
  },
  heading2: {
    fontSize: currentTheme.fontSize.xl,
    color: currentTheme.colors.text.primary,
    marginBottom: currentTheme.spacing.md
  },
  text: {
    color: currentTheme.colors.text.primary
  },
  textSecondary: {
    color: currentTheme.colors.text.secondary
  },
  textMuted: {
    color: currentTheme.colors.text.muted
  },

  // Form elements
  label: {
    display: 'block',
    marginBottom: currentTheme.spacing.sm,
    color: currentTheme.colors.text.secondary
  },
  input: {
    width: '100%',
    padding: currentTheme.spacing.md,
    background: currentTheme.colors.background.input,
    border: `1px solid ${currentTheme.colors.border.secondary}`,
    borderRadius: currentTheme.borderRadius,
    color: currentTheme.colors.text.primary,
    fontSize: currentTheme.fontSize.md
  },
  textarea: {
    width: '100%',
    padding: currentTheme.spacing.md,
    background: currentTheme.colors.background.input,
    border: `1px solid ${currentTheme.colors.border.secondary}`,
    borderRadius: currentTheme.borderRadius,
    color: currentTheme.colors.text.primary,
    fontFamily: 'monospace',
    fontSize: currentTheme.fontSize.sm,
    resize: 'vertical' as const,
    lineHeight: 1.6
  },
  select: {
    width: '100%',
    padding: currentTheme.spacing.md,
    background: currentTheme.colors.background.secondary,
    border: `1px solid ${currentTheme.colors.border.secondary}`,
    borderRadius: currentTheme.borderRadius,
    color: currentTheme.colors.text.primary,
    fontSize: currentTheme.fontSize.md
  },

  // Buttons
  button: {
    primary: {
      padding: `${currentTheme.spacing.md} ${currentTheme.spacing.lg}`,
      background: currentTheme.colors.primary,
      color: '#FFFFFF', // Light text on primary background
      border: 'none',
      borderRadius: currentTheme.borderRadius,
      cursor: 'pointer',
      fontWeight: currentTheme.fontWeight.bold,
      fontSize: currentTheme.fontSize.sm
    },
    secondary: {
      padding: `${currentTheme.spacing.md} ${currentTheme.spacing.lg}`,
      background: currentTheme.colors.background.secondary,
      color: currentTheme.colors.text.primary,
      border: `1px solid ${currentTheme.colors.border.tertiary}`,
      borderRadius: currentTheme.borderRadius,
      cursor: 'pointer',
      fontWeight: currentTheme.fontWeight.bold,
      fontSize: currentTheme.fontSize.sm
    },
    danger: {
      padding: `${currentTheme.spacing.md} ${currentTheme.spacing.lg}`,
      background: 'transparent',
      color: currentTheme.colors.danger,
      border: `1px solid ${currentTheme.colors.danger}`,
      borderRadius: currentTheme.borderRadius,
      cursor: 'pointer',
      fontWeight: currentTheme.fontWeight.bold,
      fontSize: currentTheme.fontSize.sm
    }
  },

  // Shorthand button styles for convenience
  buttonPrimary: {
    padding: `${currentTheme.spacing.md} ${currentTheme.spacing.lg}`,
    background: currentTheme.colors.primary,
    color: '#FFFFFF', // White text on blood red background
    border: 'none',
    borderRadius: currentTheme.borderRadius,
    cursor: 'pointer',
    fontWeight: currentTheme.fontWeight.bold,
    fontSize: currentTheme.fontSize.sm,
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)' // Subtle shadow for depth
  },
  buttonSecondary: {
    padding: `${currentTheme.spacing.md} ${currentTheme.spacing.lg}`,
    background: currentTheme.colors.background.secondary,
    color: currentTheme.colors.text.primary,
    border: `1px solid ${currentTheme.colors.border.secondary}`,
    borderRadius: currentTheme.borderRadius,
    cursor: 'pointer',
    fontWeight: currentTheme.fontWeight.bold,
    fontSize: currentTheme.fontSize.sm,
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)' // Subtle shadow for secondary buttons
  },
  buttonDanger: {
    padding: `${currentTheme.spacing.md} ${currentTheme.spacing.lg}`,
    background: 'transparent',
    color: currentTheme.colors.danger,
    border: `1px solid ${currentTheme.colors.danger}`,
    borderRadius: currentTheme.borderRadius,
    cursor: 'pointer',
    fontWeight: currentTheme.fontWeight.bold,
    fontSize: currentTheme.fontSize.sm,
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)' // Very subtle shadow for danger buttons
  },

  // Tabs
  tabContainer: {
    display: 'flex',
    gap: currentTheme.spacing.sm,
    marginBottom: currentTheme.spacing.sm,
    borderBottom: `1px solid ${currentTheme.colors.border.primary}`
  },
  tab: {
    active: {
      padding: `${currentTheme.spacing.sm} ${currentTheme.spacing.md}`,
      background: currentTheme.colors.background.secondary,
      color: currentTheme.colors.text.primary,
      border: 'none',
      borderBottom: `2px solid ${currentTheme.colors.primary}`,
      cursor: 'pointer',
      fontSize: currentTheme.fontSize.sm
    },
    inactive: {
      padding: `${currentTheme.spacing.sm} ${currentTheme.spacing.md}`,
      background: 'transparent',
      color: currentTheme.colors.text.muted,
      border: 'none',
      borderBottom: `2px solid transparent`,
      cursor: 'pointer',
      fontSize: currentTheme.fontSize.sm
    }
  },

  // Preview
  preview: {
    padding: currentTheme.spacing.md,
    background: currentTheme.colors.background.tertiary,
    border: `1px solid ${currentTheme.colors.border.secondary}`,
    borderRadius: currentTheme.borderRadius,
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
    gap: currentTheme.spacing.lg,
    flexWrap: 'wrap' as const
  },

  // Specific components
  sessionCard: {
    background: currentTheme.colors.background.secondary,
    border: `1px solid ${currentTheme.colors.border.primary}`,
    borderRadius: '12px',
    padding: currentTheme.spacing.xl,
    marginBottom: currentTheme.spacing.lg,
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)' // Consistent with card style
  },
  sessionDetails: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gridTemplateRows: 'auto auto auto',
    gap: currentTheme.spacing.sm,
    marginBottom: 0
  },
  detailItem: {
    background: currentTheme.colors.background.tertiary,
    border: `1px solid ${currentTheme.colors.border.primary}`,
    borderRadius: '6px',
    padding: currentTheme.spacing.sm,
    textAlign: 'center' as const,
    fontSize: currentTheme.fontSize.sm,
    color: currentTheme.colors.text.primary,
    minHeight: '50px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: currentTheme.fontWeight.bold
  },
  gameSystemItem: {
    gridColumn: '1 / -1',
    background: currentTheme.colors.background.tertiary,
    border: `1px solid ${currentTheme.colors.border.primary}`,
    borderRadius: '6px',
    padding: currentTheme.spacing.sm,
    textAlign: 'center' as const,
    fontSize: currentTheme.fontSize.md,
    color: currentTheme.colors.text.primary,
    minHeight: '50px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: currentTheme.fontWeight.bold
  }
})

// Legacy export for backward compatibility
export const styles = createStyles(lightTheme)