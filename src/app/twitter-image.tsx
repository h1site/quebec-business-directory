import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = 'Registre des entreprises du Québec'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#1e3a5f',
          backgroundImage: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a87 50%, #1e3a5f 100%)',
        }}
      >
        {/* Fleur de lys decoration */}
        <div
          style={{
            position: 'absolute',
            top: 40,
            left: 60,
            fontSize: 48,
            color: 'rgba(255,255,255,0.15)',
            display: 'flex',
          }}
        >
          ⚜️
        </div>
        <div
          style={{
            position: 'absolute',
            bottom: 40,
            right: 60,
            fontSize: 48,
            color: 'rgba(255,255,255,0.15)',
            display: 'flex',
          }}
        >
          ⚜️
        </div>

        {/* Main content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '40px 60px',
          }}
        >
          {/* Icon */}
          <div
            style={{
              width: 100,
              height: 100,
              borderRadius: '50%',
              backgroundColor: 'rgba(255,255,255,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 30,
              border: '3px solid rgba(255,255,255,0.3)',
            }}
          >
            <span style={{ fontSize: 50 }}>🏢</span>
          </div>

          {/* Title */}
          <h1
            style={{
              fontSize: 64,
              fontWeight: 'bold',
              color: 'white',
              margin: 0,
              marginBottom: 20,
              textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
            }}
          >
            Registre du Québec
          </h1>

          {/* Subtitle */}
          <p
            style={{
              fontSize: 32,
              color: 'rgba(255,255,255,0.9)',
              margin: 0,
              marginBottom: 40,
            }}
          >
            Annuaire des entreprises québécoises
          </p>

          {/* Stats */}
          <div
            style={{
              display: 'flex',
              gap: 60,
              marginTop: 20,
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '20px 40px',
                backgroundColor: 'rgba(255,255,255,0.1)',
                borderRadius: 16,
              }}
            >
              <span style={{ fontSize: 48, fontWeight: 'bold', color: '#4ade80' }}>46 000+</span>
              <span style={{ fontSize: 20, color: 'rgba(255,255,255,0.8)' }}>Entreprises</span>
            </div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '20px 40px',
                backgroundColor: 'rgba(255,255,255,0.1)',
                borderRadius: 16,
              }}
            >
              <span style={{ fontSize: 48, fontWeight: 'bold', color: '#60a5fa' }}>17</span>
              <span style={{ fontSize: 20, color: 'rgba(255,255,255,0.8)' }}>Régions</span>
            </div>
          </div>
        </div>

        {/* Domain */}
        <div
          style={{
            position: 'absolute',
            bottom: 30,
            fontSize: 24,
            color: 'rgba(255,255,255,0.6)',
            display: 'flex',
          }}
        >
          registreduquebec.com
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
