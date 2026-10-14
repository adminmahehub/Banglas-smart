import React from 'react';

// Plain, readable page used for the legal pages that the Play Store listing links to.
export default function LegalPage({ title, updated, children }: { title: string; updated: string; children: React.ReactNode }) {
  return (
    <main style={{ background: '#f6f8f7', minHeight: '100vh', color: '#13201c', fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif' }}>
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '40px 20px 80px', lineHeight: 1.7 }}>
        <a href="/" style={{ color: '#0b7a55', fontWeight: 700, textDecoration: 'none' }}>MaheHub</a>
        <h1 style={{ fontSize: 32, margin: '12px 0 4px', lineHeight: 1.2 }}>{title}</h1>
        <p style={{ color: '#5a6b65', margin: '0 0 28px' }}>Last updated: {updated}</p>
        {children}
      </div>
    </main>
  );
}

export const H2 = ({ children }: { children: React.ReactNode }) => <h2 style={{ fontSize: 21, margin: '32px 0 8px' }}>{children}</h2>;
export const P = ({ children }: { children: React.ReactNode }) => <p style={{ margin: '0 0 12px' }}>{children}</p>;
export const UL = ({ children }: { children: React.ReactNode }) => <ul style={{ margin: '0 0 12px', paddingLeft: 22 }}>{children}</ul>;
