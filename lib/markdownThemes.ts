/**
 * Markdown CSS Themes - Collection of beautiful markdown styling options
 * Based on markdowncss.org themes
 */

export type MarkdownTheme = 'air' | 'modest' | 'retro' | 'splendor' | 'github'

export interface MarkdownThemeConfig {
  id: MarkdownTheme
  name: string
  description: string
  css: string
}

export const markdownThemes: Record<MarkdownTheme, MarkdownThemeConfig> = {
  air: {
    id: 'air',
    name: 'Air',
    description: 'Light and airy styling',
    css: `
.markdown-content {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
  font-size: 16px;
  line-height: 1.6;
  color: #333;
}

[data-theme="dark"] .markdown-content {
  color: #F4EFE6;
}

[data-theme="dark"] .markdown-content h1,
[data-theme="dark"] .markdown-content h2,
[data-theme="dark"] .markdown-content h3,
[data-theme="dark"] .markdown-content h4,
[data-theme="dark"] .markdown-content h5,
[data-theme="dark"] .markdown-content h6 {
  color: #FFFFFF !important;
}

.markdown-content h1,
.markdown-content h2,
.markdown-content h3,
.markdown-content h4,
.markdown-content h5,
.markdown-content h6 {
  font-weight: 600;
  margin: 1.5em 0 0.5em 0;
  line-height: 1.2;
}

.markdown-content h1 { font-size: 2.5em; border-bottom: 2px solid #eee; padding-bottom: 0.3em; }
.markdown-content h2 { font-size: 2em; border-bottom: 1px solid #eee; padding-bottom: 0.3em; }
.markdown-content h3 { font-size: 1.5em; }
.markdown-content h4 { font-size: 1.25em; }
.markdown-content h5 { font-size: 1.1em; }
.markdown-content h6 { font-size: 1em; }

.markdown-content p { margin: 0.8em 0; }

.markdown-content a {
  color: #0084b8;
  text-decoration: none;
}

.markdown-content a:hover {
  text-decoration: underline;
}

.markdown-content code {
  background-color: #f4f4f4;
  padding: 0.2em 0.4em;
  border-radius: 3px;
  font-family: 'Courier New', monospace;
  font-size: 0.9em;
}

.markdown-content pre {
  background-color: #f8f8f8;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 1em;
  overflow-x: auto;
  margin: 1em 0;
}

.markdown-content pre code {
  background-color: transparent;
  padding: 0;
}

.markdown-content blockquote {
  border-left: 4px solid #ddd;
  margin: 0;
  padding-left: 1em;
  color: #666;
}

.markdown-content ul,
.markdown-content ol {
  margin: 0.8em 0;
  padding-left: 2em;
}

.markdown-content li {
  margin: 0.4em 0;
}

.markdown-content table {
  border-collapse: collapse;
  width: 100%;
  margin: 1em 0;
}

.markdown-content table th,
.markdown-content table td {
  border: 1px solid #ddd;
  padding: 0.5em;
  text-align: left;
}

.markdown-content table th {
  background-color: #f8f8f8;
  font-weight: 600;
}

.markdown-content hr {
  border: none;
  border-top: 1px solid #eee;
  margin: 2em 0;
}

.markdown-content img {
  max-width: 100%;
  height: auto;
}
    `,
  },

  modest: {
    id: 'modest',
    name: 'Modest',
    description: 'Rather modest and clean',
    css: `
.markdown-content {
  font-family: Georgia, serif;
  font-size: 1em;
  line-height: 1.7;
  color: #444;
  max-width: 100%;
}

[data-theme="dark"] .markdown-content {
  color: #F4EFE6;
}

[data-theme="dark"] .markdown-content h1,
[data-theme="dark"] .markdown-content h2,
[data-theme="dark"] .markdown-content h3,
[data-theme="dark"] .markdown-content h4,
[data-theme="dark"] .markdown-content h5,
[data-theme="dark"] .markdown-content h6 {
  color: #FFFFFF !important;
}

.markdown-content h1,
.markdown-content h2,
.markdown-content h3,
.markdown-content h4,
.markdown-content h5,
.markdown-content h6 {
  font-family: Georgia, serif;
  font-weight: normal;
  margin: 0.5em 0;
}

.markdown-content h1 { font-size: 2.5em; text-align: left; }
.markdown-content h2 { font-size: 1.5em; text-align: left; }
.markdown-content h3 { font-size: 1.5em; }
.markdown-content h4 { font-size: 1.25em; }
.markdown-content h5 { font-size: 1.1em; }
.markdown-content h6 { font-size: 1em; }

.markdown-content p { margin: 0.8em 0; }

.markdown-content a {
  color: #0084b8;
  text-decoration: none;
  border-bottom: 1px dotted #0084b8;
}

.markdown-content a:hover {
  border-bottom-style: solid;
}

.markdown-content code {
  font-family: Menlo, Monaco, 'Courier New', monospace;
  font-size: 0.9em;
  background-color: #f5f5f5;
  padding: 0.1em 0.4em;
}

.markdown-content pre {
  background-color: #f5f5f5;
  border: 1px solid #ccc;
  padding: 1em;
  margin: 1em 0;
  overflow-x: auto;
}

.markdown-content pre code {
  background-color: transparent;
  padding: 0;
}

.markdown-content blockquote {
  border-left: 5px solid #ddd;
  margin: 0;
  padding: 0 0 0 1em;
  color: #666;
}

.markdown-content ul,
.markdown-content ol {
  margin: 0.8em 0;
  padding-left: 2em;
}

.markdown-content li { margin: 0.4em 0; }

.markdown-content table {
  border-collapse: collapse;
  border-spacing: 0;
  empty-cells: show;
  border: 1px solid #cbccce;
  margin: 1em 0;
  width: 100%;
}

.markdown-content table th,
.markdown-content table td {
  border-left: 1px solid #cbccce;
  border-width: 0 0 0 1px;
  margin: 0;
  padding: 0.5em 1em;
  text-align: left;
}

.markdown-content table th {
  background-color: #e0e0e0;
  color: #000;
  font-weight: bold;
}

.markdown-content hr {
  background: none;
  border: none;
  border-top: 1px solid #ddd;
  margin: 2em 0;
}

.markdown-content img {
  max-width: 100%;
  height: auto;
}
    `,
  },

  retro: {
    id: 'retro',
    name: 'Retro',
    description: 'A blast to the past',
    css: `
.markdown-content {
  font-family: 'Courier New', Courier, monospace;
  font-size: 14px;
  line-height: 1.6;
  color: #333;
}

.markdown-content h1,
.markdown-content h2,
.markdown-content h3,
.markdown-content h4,
.markdown-content h5,
.markdown-content h6 {
  font-family: 'Courier New', Courier, monospace;
  font-weight: bold;
  border: 2px solid #999;
  background-color: #ddd;
  padding: 0.3em 0.5em;
  margin: 1em 0;
  color: #000000 !important;
}

.markdown-content h1 { font-size: 2em; }
.markdown-content h2 { font-size: 1.5em; }
.markdown-content h3 { font-size: 1.25em; }
.markdown-content h4 { font-size: 1.1em; }
.markdown-content h5 { font-size: 1em; }
.markdown-content h6 { font-size: 0.9em; }

.markdown-content p { margin: 0.8em 0; }

.markdown-content a {
  color: #0066cc;
  font-weight: bold;
  text-decoration: underline;
}

.markdown-content code {
  background-color: #ddd;
  border: 1px solid #999;
  padding: 0.2em 0.4em;
  font-family: 'Courier New', Courier, monospace;
}

.markdown-content pre {
  background-color: #ddd;
  border: 2px solid #999;
  padding: 1em;
  margin: 1em 0;
  overflow-x: auto;
}

.markdown-content pre code {
  background-color: transparent;
  border: none;
  padding: 0;
}

.markdown-content blockquote {
  border-left: 4px solid #999;
  padding-left: 1em;
  margin-left: 0;
  font-style: italic;
}

.markdown-content ul,
.markdown-content ol {
  margin: 0.8em 0;
  padding-left: 2em;
}

.markdown-content li { margin: 0.4em 0; }

.markdown-content table {
  border-collapse: collapse;
  border: 2px solid #999;
  margin: 1em 0;
  width: 100%;
}

.markdown-content table th,
.markdown-content table td {
  border: 1px solid #999;
  padding: 0.5em;
}

.markdown-content table th {
  background-color: #ccc;
  font-weight: bold;
}

.markdown-content hr {
  border: none;
  border-top: 2px solid #999;
  margin: 2em 0;
}

.markdown-content img {
  max-width: 100%;
  height: auto;
  border: 1px solid #999;
}
    `,
  },

  splendor: {
    id: 'splendor',
    name: 'Splendor',
    description: 'Absolutely splendid',
    css: `
.markdown-content {
  font-family: 'Palatino Linotype', 'Book Antiqua', Palatino, serif;
  font-size: 16px;
  line-height: 1.8;
  color: #333;
}

.markdown-content h1,
.markdown-content h2,
.markdown-content h3,
.markdown-content h4,
.markdown-content h5,
.markdown-content h6 {
  font-family: Georgia, serif;
  font-weight: normal;
}

.markdown-content h1 {
  font-size: 2.5em;
  border-bottom: 3px solid #333;
  padding-bottom: 0.3em;
  text-align: center;
  margin: 1em 0;
}

.markdown-content h2 {
  font-size: 1.5em;
  border-bottom: 1px solid #ccc;
  padding-bottom: 0.2em;
  margin: 1.2em 0 0.5em 0;
}

.markdown-content h3 {
  font-size: 1.5em;
  margin: 1em 0 0.5em 0;
}

.markdown-content h4 {
  font-size: 1.25em;
}

.markdown-content h5 {
  font-size: 1.1em;
}

.markdown-content h6 {
  font-size: 1em;
}

.markdown-content p {
  margin: 1em 0;
  text-align: justify;
}

.markdown-content a {
  color: #c41e3a;
  text-decoration: none;
}

.markdown-content a:hover {
  text-decoration: underline;
}

.markdown-content code {
  font-family: 'Courier New', monospace;
  background-color: #f5f5f5;
  padding: 0.2em 0.4em;
  border-radius: 3px;
}

.markdown-content pre {
  background-color: #f5f5f5;
  border: 1px solid #ddd;
  border-left: 4px solid #c41e3a;
  padding: 1em;
  margin: 1em 0;
  overflow-x: auto;
}

.markdown-content pre code {
  background-color: transparent;
  padding: 0;
}

.markdown-content blockquote {
  border-left: 4px solid #c41e3a;
  margin: 0;
  padding-left: 1em;
  color: #666;
}

.markdown-content ul,
.markdown-content ol {
  margin: 1em 0;
  padding-left: 2em;
}

.markdown-content li {
  margin: 0.5em 0;
}

.markdown-content table {
  border-collapse: collapse;
  width: 100%;
  margin: 1em 0;
}

.markdown-content table th,
.markdown-content table td {
  border: 1px solid #ddd;
  padding: 0.75em;
  text-align: left;
}

.markdown-content table th {
  background-color: #f5f5f5;
  font-weight: bold;
  border-bottom: 2px solid #c41e3a;
}

.markdown-content hr {
  border: none;
  border-top: 2px solid #c41e3a;
  margin: 2em 0;
}

.markdown-content img {
  max-width: 100%;
  height: auto;
}
    `,
  },

  github: {
    id: 'github',
    name: 'GitHub',
    description: 'GitHub-flavored markdown styling',
    css: `
.markdown-content {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
  font-size: 16px;
  line-height: 1.6;
  color: #24292e;
}

.markdown-content h1,
.markdown-content h2,
.markdown-content h3,
.markdown-content h4,
.markdown-content h5,
.markdown-content h6 {
  margin-top: 24px;
  margin-bottom: 16px;
  font-weight: 600;
  line-height: 1.25;
}

.markdown-content h1 {
  font-size: 2em;
  padding-bottom: 0.3em;
  border-bottom: 1px solid #eaecef;
}

.markdown-content h2 {
  font-size: 1.5em;
  padding-bottom: 0.3em;
  border-bottom: 1px solid #eaecef;
}

.markdown-content h3 {
  font-size: 1.25em;
}

.markdown-content h4 {
  font-size: 1em;
}

.markdown-content h5 {
  font-size: 0.875em;
}

.markdown-content h6 {
  font-size: 0.85em;
}

.markdown-content p {
  margin-bottom: 16px;
}

.markdown-content a {
  color: #0366d6;
  text-decoration: none;
}

.markdown-content a:hover {
  text-decoration: underline;
}

.markdown-content code {
  padding: 0.2em 0.4em;
  margin: 0;
  font-size: 85%;
  background-color: rgba(27, 31, 35, 0.05);
  border-radius: 3px;
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
}

.markdown-content pre {
  background-color: #f6f8fa;
  border-radius: 6px;
  padding: 16px;
  overflow: auto;
  font-size: 85%;
  line-height: 1.45;
  margin-bottom: 16px;
}

.markdown-content pre code {
  display: inline;
  padding: 0;
  margin: 0;
  overflow: visible;
  line-height: inherit;
  background-color: transparent;
}

.markdown-content blockquote {
  padding: 0 1em;
  color: #6a737d;
  border-left: 0.25em solid #dfe2e5;
  margin: 0 0 16px 0;
}

.markdown-content ul,
.markdown-content ol {
  margin-bottom: 16px;
  padding-left: 2em;
}

.markdown-content li {
  margin-bottom: 8px;
}

.markdown-content ul ul,
.markdown-content ol ol,
.markdown-content ul ol,
.markdown-content ol ul {
  margin-top: 0;
  margin-bottom: 0;
}

.markdown-content table {
  border-collapse: collapse;
  width: 100%;
  margin-bottom: 16px;
}

.markdown-content table th,
.markdown-content table td {
  padding: 6px 13px;
  border: 1px solid #dfe2e5;
}

.markdown-content table th {
  background-color: #f6f8fa;
  font-weight: 600;
}

.markdown-content table tr:nth-child(2n) {
  background-color: #f6f8fa;
}

.markdown-content hr {
  height: 0.25em;
  padding: 0;
  margin: 24px 0;
  background-color: #e1e4e8;
  border: 0;
}

.markdown-content img {
  max-width: 100%;
  height: auto;
}
    `,
  },
}

/**
 * Get CSS for a specific markdown theme
 */
export function getMarkdownThemeCSS(theme: MarkdownTheme): string {
  return markdownThemes[theme]?.css || markdownThemes.github.css
}

/**
 * Get all available themes for dropdown
 */
export function getMarkdownThemeOptions() {
  return Object.values(markdownThemes).map(theme => ({
    value: theme.id,
    label: theme.name,
    description: theme.description,
  }))
}
