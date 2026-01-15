'use client'

import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import Link from 'next/link'
import { useState, useEffect } from 'react'

export default function Navbar() {
  const { user, profile, signOut } = useAuth()
  const { isDark, toggleTheme, theme, themeReady } = useTheme()
  const [menuOpen, setMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  const handleAuth = async () => {
    if (user) {
      await signOut()
      window.location.href = '/login'
    } else {
      window.location.href = '/login'
    }
  }

 useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 500)
    }

    // Set initial value
    handleResize()

    // Add event listener for window resize
    window.addEventListener('resize', handleResize)

    // Cleanup event listener on unmount
    return () => window.removeEventListener('resize', handleResize)
  }, [])


  if (!themeReady) {
    return null // Wait until theme is initialized
  }

  return (
    (!isMobile) ? (
      //Layout for tablets and desktops
      <nav
        id="navbar-container"
        style={{
          padding: '0.5rem 1rem',
          background: theme.colors.background.secondary,
          borderBottom: `1px solid ${theme.colors.border.primary}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          zIndex: 1000,
        }}
      >
        {/* App Name */}
        <Link
          href="/"
          style={{
            fontSize: 'clamp(1rem, 2vw, 1.5rem)',
            fontWeight: 'bold',
            color: theme.colors.primary,
          }}
        >
          The Loom
        </Link>

        {/* Navigation Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link id="sessions-nav-link" href="/sessions" style={{ color: theme.colors.text.primary }}>
            Sessions
          </Link>
          <Link href="/tables" style={{ color: theme.colors.text.primary }}>
            Tables
          </Link>
          <Link id="wiki-nav-link" href="/wiki" style={{ color: theme.colors.text.primary }}>
            Wiki
          </Link>
          <Link href="/map" style={{ color: theme.colors.text.primary }}>
            Map
          </Link>
          <Link href="/profile" style={{ color: theme.colors.text.primary }}>
            Profile
          </Link>
            {/* Theme Toggle */}
          <label className="switch">
            <input
              type="checkbox"
              checked={!isDark}
              onChange={toggleTheme}
            />
            <span className="slider">
              <div className="star star_1"></div>
              <div className="star star_2"></div>
              <div className="star star_3"></div>
              <svg viewBox="0 0 16 16" className="cloud_1 cloud">
                <path
                  transform="matrix(.77976 0 0 .78395-299.99-418.63)"
                  fill="#fff"
                  d="m391.84 540.91c-.421-.329-.949-.524-1.523-.524-1.351 0-2.451 1.084-2.485 2.435-1.395.526-2.388 1.88-2.388 3.466 0 1.874 1.385 3.423 3.182 3.667v.034h12.73v-.006c1.775-.104 3.182-1.584 3.182-3.395 0-1.747-1.309-3.186-2.994-3.379.007-.106.011-.214.011-.322 0-2.707-2.271-4.901-5.072-4.901-2.073 0-3.856 1.202-4.643 2.925"
                ></path>
              </svg>
            </span>
          </label>
        <button
          onClick={handleAuth}
          style={{
            padding: '0.25rem 0.5rem',
            border: '2px solid',
            borderRadius: '100px',
            marginLeft: '-0.5rem',
            backgroundColor: theme.colors.background.main,
            color: theme.colors.primary,
            fontWeight: 'bold',
            transition: 'all 0.5s',
            WebkitTransition: 'all 0.5s',
          }}
        >
          {user ? 'Logout' : 'Login'}
        </button>


        </div>
      </nav>
    
  ) : (

    //Layout for mobile devices
    <nav
      style={{
        padding: '1rem 1rem',
        background: theme.colors.background.secondary,
        borderBottom: `1px solid ${theme.colors.border.primary}`,
        display: 'flex',
        justifyContent: 'space-between', // Adjusted to space out left and right content
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
      }}
    >
      <div>
        <Link
          href="/"
          style={{
            fontSize: 'clamp(1.25rem, 2vw, 2rem)',
            fontWeight: 'bold',
            color: theme.colors.primary,
            marginLeft: '0.5rem'
          }}
        >
          The Loom
        </Link>
      </div>
      <div style={{ display: 'flex', alignItems: 'flex',marginRight: '0.5rem' }}>
    {/* Replace the existing hamburger menu with the new popup menu */}
          <label className="switch">
            <input
              type="checkbox"
              checked={!isDark}
              onChange={toggleTheme}
            />
            <span className="slider">
              <div className="star star_1"></div>
              <div className="star star_2"></div>
              <div className="star star_3"></div>
              <svg viewBox="0 0 16 16" className="cloud_1 cloud">
                <path
                  transform="matrix(.77976 0 0 .78395-299.99-418.63)"
                  fill="#fff"
                  d="m391.84 540.91c-.421-.329-.949-.524-1.523-.524-1.351 0-2.451 1.084-2.485 2.435-1.395.526-2.388 1.88-2.388 3.466 0 1.874 1.385 3.423 3.182 3.667v.034h12.73v-.006c1.775-.104 3.182-1.584 3.182-3.395 0-1.747-1.309-3.186-2.994-3.379.007-.106.011-.214.011-.322 0-2.707-2.271-4.901-5.072-4.901-2.073 0-3.856 1.202-4.643 2.925"
                ></path>
              </svg>
            </span>
          </label>
      <label className="popup">
        <input type="checkbox" />
        <div className="burger" tabIndex={0}>
          <span></span>
          <span></span>
          <span></span>
        </div>
        <nav
          className="popup-window"
          style={{
            background: theme.colors.background.secondary,
            color: theme.colors.text.primary,
            borderColor: theme.colors.border.primary,
          }}
        >
          <legend style={{ color: theme.colors.text.secondary, fontWeight: 'normal' }}>Navigation</legend>
          <ul>
            <li>
              <Link href="/sessions">
                <button style={{ color: theme.colors.text.primary, fontWeight: 'normal' }}>
                  <svg
                    stroke-linejoin="round"
                    stroke-linecap="round"
                    stroke-width="2"
                    stroke={theme.colors.text.primary}
                    fill="none"
                    viewBox="0 0 24 24"
                    height="17.5"
                    width="17.5"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle r="4" cy="7" cx="9"></circle>
                  </svg>
                  <span>Sessions</span>
                </button>
              </Link>
            </li>
            <li>
              <Link href="/tables">
                <button style={{ color: theme.colors.text.primary, fontWeight: 'normal' }}>
                  <svg
                    stroke-linejoin="round"
                    stroke-linecap="round"
                    stroke-width="2"
                    stroke={theme.colors.text.primary}
                    fill="none"
                    viewBox="0 0 24 24"
                    height="17.5"
                    width="17.5"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="3" y1="9" x2="21" y2="9"></line>
                    <line x1="3" y1="15" x2="21" y2="15"></line>
                    <line x1="9" y1="3" x2="9" y2="21"></line>
                    <line x1="15" y1="3" x2="15" y2="21"></line>
                  </svg>
                  <span>Tables</span>
                </button>
              </Link>
            </li>
            <li>
              <Link href="/wiki">
                <button style={{ color: theme.colors.text.primary, fontWeight: 'normal' }}>
                  <svg
                    stroke-linejoin="round"
                    stroke-linecap="round"
                    stroke-width="2"
                    stroke={theme.colors.text.primary}
                    fill="none"
                    viewBox="0 0 24 24"
                    height="17.5"
                    width="17.5"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                  </svg>
                  <span>Wiki</span>
                </button>
              </Link>
            </li>
            <li>
              <Link href="/map">
                <button style={{ color: theme.colors.text.primary, fontWeight: 'normal' }}>
                  <svg
                    stroke-linejoin="round"
                    stroke-linecap="round"
                    stroke-width="2"
                    stroke={theme.colors.text.primary}
                    fill="none"
                    viewBox="0 0 24 24"
                    height="17.5"
                    width="17.5"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <polygon points="16 3 21 8 8 21 3 21 3 16 16 3"></polygon>
                  </svg>
                  <span>Map</span>
                </button>
              </Link>
            </li>
            <hr style={{ borderColor: theme.colors.border.secondary, fontWeight: 'normal' }} />
            <li>
              <Link href="/profile">
                <button style={{ color: theme.colors.text.secondary, fontWeight: 'normal' }}>
                  <svg
                    stroke-linejoin="round"
                    stroke-linecap="round"
                    stroke-width="2"
                    stroke={theme.colors.text.secondary}
                    fill="none"
                    viewBox="0 0 24 24"
                    height="17.5"
                    width="17.5"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4z"></path>
                    <path d="M4 20v-1c0-2.21 1.79-4 4-4h8c2.21 0 4 1.79 4 4v1"></path>
                  </svg>
                  <span>Profile</span>
                </button>
              </Link>
            </li>
            <li>
              <button
                onClick={handleAuth}
                style={{ color: theme.colors.primary }}
              >
                <svg
                  stroke-linejoin="round"
                  stroke-linecap="round"
                  stroke-width="2"
                  stroke={theme.colors.primary}
                  fill="none"
                  viewBox="0 0 24 24"
                  height="17.5"
                  width="17.5"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M15 12H3m6-6l-6 6 6 6"></path>
                </svg>
                <span>{user ? 'Logout' : 'Login'}</span>
              </button>
            </li>
          </ul>
        </nav>
      </label>
    </div>

      <style>{`
        @media (max-width: 450px) {
          .menu {
            display: none; /* Default hidden */
          }
          .menu.open {
            display: flex; /* Visible when open */
            flex-direction: column; /* Vertical layout for small screens */
          }
          .menu-toggle {
            display: block; /* Ensure toggle button is visible */
          }
        }

        @media (min-width: 501px) {
          .menu {
            display: flex; /* Always visible on larger screens */
            flex-direction: row; /* Horizontal layout for larger screens */
            justify-content: space-between; /* Spread out items */
            gap: 1rem; /* Add spacing between items */
          }
          .menu-toggle {
            display: none; /* Hide toggle button on larger screens */
          }
        }
        /* From Uiverse.io by Galahhad */
        .popup {
          --burger-line-width: 1.125em;
          --burger-line-height: 0.125em;
          --burger-offset: 0.625em;
          --burger-bg: rgba(0, 0, 0, .15);
          --burger-color: #333;
          --burger-line-border-radius: 0.1875em;
          --burger-diameter: 2.125em;
          --burger-btn-border-radius: calc(var(--burger-diameter) / 2);
          --burger-line-transition: .3s;
          --burger-transition: all .1s ease-in-out;
          --burger-hover-scale: 1.1;
          --burger-active-scale: .95;
          --burger-enable-outline-color: var(--burger-bg);
          --burger-enable-outline-width: 0.125em;
          --burger-enable-outline-offset: var(--burger-enable-outline-width);
          /* nav */
          --nav-padding-x: 0.25em;
          --nav-padding-y: 0.625em;
          --nav-border-radius: 0.375em;
          --nav-border-color: #ccc;
          --nav-border-width: 0.0625em;
          --nav-shadow-color: rgba(0, 0, 0, .2);
          --nav-shadow-width: 0 1px 5px;
          --nav-bg: #eee;
          --nav-font-family: Menlo, Roboto Mono, monospace;
          --nav-default-scale: .8;
          --nav-active-scale: 1;
          --nav-position-left: 0;
          --nav-position-right: unset;
          /* title */
          --nav-title-size: 0.625em;
          --nav-title-color: #777;
          --nav-title-padding-x: 1rem;
          --nav-title-padding-y: 0.25em;
          /* nav button */
          --nav-button-padding-x: 1rem;
          --nav-button-padding-y: 0.375em;
          --nav-button-border-radius: 0.375em;
          --nav-button-font-size: 12px;
          --nav-button-hover-bg: #6495ed;
          --nav-button-hover-text-color: #fff;
          --nav-button-distance: 0.875em;
          /* underline */
          --underline-border-width: 0.0625em;
          --underline-border-color: #ccc;
          --underline-margin-y: 0.3125em;
        }

        .popup {
          display: inline-block;
          text-rendering: optimizeLegibility;
          position: relative;
        }

        .popup input {
          display: none;
        }

        .burger {
          display: flex;
          position: relative;
          align-items: center;
          justify-content: center;
          background: ${theme.colors.background.secondary};
          width: var(--burger-diameter);
          height: var(--burger-diameter);
          border-radius: var(--burger-btn-border-radius);
          border: none;
          cursor: pointer;
          overflow: hidden;
          transition: var(--burger-transition);
          outline: var(--burger-enable-outline-width) solid transparent;
          outline-offset: 0;
        }

        .burger span {
          height: var(--burger-line-height);
          width: var(--burger-line-width);
          background: ${theme.colors.text.primary};
          border-radius: var(--burger-line-border-radius);
          position: absolute;
          transition: var(--burger-line-transition);
        }

        .burger span:nth-child(1) {
          top: var(--burger-offset);
        }

        .burger span:nth-child(2) {
          bottom: var(--burger-offset);
        }

        .burger span:nth-child(3) {
          top: 50%;
          transform: translateY(-50%);
        }

        .popup-window {
          transform: scale(var(--nav-default-scale) * 1.5) translateX(-50%);
          visibility: hidden;
          opacity: 0;
          position: absolute;
          padding: var(--nav-padding-y) var(--nav-padding-x);
          background: var(--nav-bg);
          font-family: var(--nav-font-family);
          color: var(--nav-text-color);
          border-radius: var(--nav-border-radius);
          box-shadow: var(--nav-shadow-width) var(--nav-shadow-color);
          border: var(--nav-border-width) solid var(--nav-border-color);
          top: calc(var(--burger-diameter) + var(--burger-enable-outline-width) + var(--burger-enable-outline-offset));
          left: var(--nav-position-left);
          right: var(--nav-position-right);
          transition: var(--burger-transition);
        }

        .popup-window legend {
          padding: var(--nav-title-padding-y) var(--nav-title-padding-x);
          margin: 0;
          color: var(--nav-title-color);
          font-size: calc(var(--nav-title-size) * 1.5);
          text-transform: uppercase;
        }

        .popup-window ul {
          margin: 0;
          padding: 0;
          list-style-type: none;
        }

        .popup-window ul button {
          outline: none;
          width: 100%;
          border: none;
          background: none;
          display: flex;
          align-items: center;
          color: var(--burger-color);
          font-size: calc(var(--nav-button-font-size) * 1.5);
          padding: calc(var(--nav-button-padding-y) * 1.5) calc(var(--nav-button-padding-x) * 1.5);
          white-space: nowrap;
          border-radius: var(--nav-button-border-radius);
          cursor: pointer;
          column-gap: var(--nav-button-distance);
        }

        .popup-window ul button svg {
          height: calc(14px * 1.25);
          width: calc(14px * 1.25);
        }

        .popup-window ul li:nth-child(1) svg,
        .popup-window ul li:nth-child(2) svg {
          color: cornflowerblue;
        }

        .popup-window ul li:nth-child(4) svg,
        .popup-window ul li:nth-child(5) svg {
          color: rgb(153, 153, 153);
        }

        .popup-window ul li:nth-child(7) svg {
          color: red;
        }

        .popup-window hr {
          margin: var(--underline-margin-y) 0;
          border: none;
          border-bottom: var(--underline-border-width) solid var(--underline-border-color);
        }

        /* actions */

        .popup-window ul button:hover,
        .popup-window ul button:focus-visible,
        .popup-window ul button:hover svg,
        .popup-window ul button:focus-visible svg {
          color: var(--nav-button-hover-text-color);
          background: var(--nav-button-hover-bg);
        }

        .burger:hover {
          background: ${theme.colors.background.secondary};
        }

        .burger:active {
          background: ${theme.colors.background};
        }

        .burger:focus:not(:hover) {
          outline-color: var(--burger-enable-outline-color);
          outline-offset: var(--burger-enable-outline-offset);
        }

        .popup input:checked+.burger span:nth-child(1) {
          top: 50%;
          transform: translateY(-50%) rotate(45deg);
        }

        .popup input:checked+.burger span:nth-child(2) {
          bottom: 50%;
          transform: translateY(50%) rotate(-45deg);
        }

        .popup input:checked+.burger span:nth-child(3) {
          transform: translateX(calc(var(--burger-diameter) * -1 - var(--burger-line-width)));
        }

        .popup input:checked~nav {
          transform: scale(var(--nav-active-scale)) translateX(-75%);
          visibility: visible;
          opacity: 1;
        }

        /* Ensure Logout button matches the title's red color */
        .popup-window ul button:last-child {
          color: ${theme.colors.primary};
        }

        .popup-window ul button:last-child svg {
          stroke: ${theme.colors.primary};
        }

        /* From Uiverse.io by JustCode14 */
        .switch {
          font-size: 17px;
          position: relative;
          display: inline-block;
          width: 4em;
          height: 2.2em;
          border-radius: 30px;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }

        .switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }

        .slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #2a2a2a;
          transition: 0.4s;
          border-radius: 30px;
          overflow: hidden;
        }

        .slider:before {
          position: absolute;
          content: "";
          height: 1.2em;
          width: 1.2em;
          border-radius: 20px;
          left: 0.5em;
          bottom: 0.5em;
          transition: 0.4s;
          transition-timing-function: cubic-bezier(0.81, -0.04, 0.38, 1.5);
          box-shadow: inset 8px -4px 0px 0px #fff;
        }

        .switch input:checked + .slider {
          background-color: #00a6ff;
        }

        .switch input:checked + .slider:before {
          transform: translateX(1.8em);
          box-shadow: inset 15px -4px 0px 15px #ffcf48;
        }

        .star {
          background-color: #fff;
          border-radius: 50%;
          position: absolute;
          width: 5px;
          transition: all 0.4s;
          height: 5px;
        }

        .star_1 {
          left: 2.5em;
          top: 0.5em;
        }

        .star_2 {
          left: 2.2em;
          top: 1.2em;
        }

        .star_3 {
          left: 3em;
          top: 0.9em;
        }

        .switch input:checked ~ .slider .star {
          opacity: 0;
        }

        .cloud {
          width: 3.5em;
          position: absolute;
          bottom: -1.4em;
          left: -1.1em;
          opacity: 0;
          transition: all 0.4s;
        }

        .switch input:checked ~ .slider .cloud {
          opacity: 1;
        }

        
      `}</style>
    </nav>
  )
)
}