export default function Home() {
  return (
    <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>
        🎲 TTRPG Colab Builder
      </h1>
      <p style={{ fontSize: '1.25rem', marginBottom: '2rem', color: '#888' }}>
        Collaborative worldbuilding and session management for West Marches campaigns
      </p>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
        gap: '1.5rem',
        marginTop: '3rem'
      }}>
        <div style={{ 
          border: '1px solid #333', 
          padding: '1.5rem', 
          borderRadius: '8px',
          background: '#111'
        }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>📅 Session Management</h2>
          <p style={{ color: '#aaa' }}>
            Schedule sessions, manage attendance, and coordinate your West Marches adventures.
          </p>
          <p style={{ marginTop: '1rem', color: '#666', fontSize: '0.875rem' }}>Coming Soon</p>
        </div>

        <div style={{ 
          border: '1px solid #333', 
          padding: '1.5rem', 
          borderRadius: '8px',
          background: '#111'
        }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🗺️ World Building</h2>
          <p style={{ color: '#aaa' }}>
            Collaboratively create locations, NPCs, quests, and lore in your shared world.
          </p>
          <p style={{ marginTop: '1rem', color: '#666', fontSize: '0.875rem' }}>Coming Soon</p>
        </div>

        <div style={{ 
          border: '1px solid #333', 
          padding: '1.5rem', 
          borderRadius: '8px',
          background: '#111'
        }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>⚔️ Character Tracking</h2>
          <p style={{ color: '#aaa' }}>
            Manage your Daggerheart characters, track progression, and coordinate with your party.
          </p>
          <p style={{ marginTop: '1rem', color: '#666', fontSize: '0.875rem' }}>Coming Soon</p>
        </div>
      </div>

      <div style={{ 
        marginTop: '3rem', 
        padding: '1.5rem', 
        border: '1px solid #2a5', 
        borderRadius: '8px',
        background: '#0a1a0a'
      }}>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: '#4f8' }}>
          ✅ Development Started!
        </h3>
        <p style={{ color: '#aaa' }}>
          Your TTRPG Colab Builder is up and running. Check the GitHub repository for the development roadmap and start contributing to your campaign's digital home!
        </p>
      </div>
    </main>
  )
}