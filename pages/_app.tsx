import '../app/globals.css';
import { ThemeProvider } from '../contexts/ThemeContext';

export default function App({ Component, pageProps }: { Component: any; pageProps: any }) {
  return (
    <ThemeProvider>
      <Component {...pageProps} />
    </ThemeProvider>
  );
}