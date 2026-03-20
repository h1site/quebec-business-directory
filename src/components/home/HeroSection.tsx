'use client'

import Link from 'next/link'
import { Button, Chip, TextField, InputAdornment } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'

interface HeroSectionProps {
  totalBusinesses: number
}

const quickSearches = [
  { icon: '🍔', label: 'Restaurants', query: 'restaurants' },
  { icon: '☕', label: 'Cafés', query: 'cafés' },
  { icon: '🔧', label: 'Plombiers', query: 'plombiers' },
  { icon: '✂️', label: 'Coiffure', query: 'salon de coiffure' },
]

export default function HeroSection({ totalBusinesses }: HeroSectionProps) {
  return (
    <section
      className="relative min-h-[600px] flex items-center justify-center overflow-hidden bg-slate-950 bg-cover bg-center"
      style={{
        backgroundImage: 'url(https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&q=80)',
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950/95 via-slate-900/90 to-sky-900/80" />
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10 w-full max-w-4xl mx-auto px-4 py-24 text-center">
        <div className="mb-8 animate-fade-in">
          <Chip
            label="Bêta — Version en développement"
            variant="outlined"
            sx={{
              color: 'white',
              borderColor: 'rgba(255,255,255,0.2)',
              bgcolor: 'rgba(255,255,255,0.05)',
              backdropFilter: 'blur(8px)',
              fontWeight: 500,
            }}
          />
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 animate-slide-up">
          Trouvez les meilleures
          <span className="block gradient-text">entreprises du Québec</span>
        </h1>

        <p className="text-xl text-slate-300 mb-10 animate-slide-up animation-delay-100">
          Plus de{' '}
          <span className="font-bold text-sky-400">
            {totalBusinesses.toLocaleString('fr-CA')}
          </span>
          {' '}entreprises québécoises vérifiées
        </p>

        <form
          action="/recherche"
          method="GET"
          className="glass rounded-2xl overflow-hidden mb-8 animate-slide-up animation-delay-200"
        >
          <div className="flex flex-col md:flex-row">
            <div className="flex-1 p-4 border-b md:border-b-0 md:border-r border-white/10">
              <TextField
                name="q"
                placeholder="Restaurant, plombier, avocat..."
                variant="standard"
                fullWidth
                label="Quoi?"
                slotProps={{
                  input: {
                    disableUnderline: true,
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: 'rgba(148,163,184,0.6)' }} />
                      </InputAdornment>
                    ),
                    sx: { color: 'white', fontSize: '1.1rem' },
                  },
                  inputLabel: {
                    sx: { color: '#0ea5e9', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' },
                    shrink: true,
                  },
                }}
              />
            </div>
            <div className="flex-1 p-4 border-b md:border-b-0 md:border-r border-white/10">
              <TextField
                name="ville"
                placeholder="Montréal, Québec, Laval..."
                variant="standard"
                fullWidth
                label="Où?"
                slotProps={{
                  input: {
                    disableUnderline: true,
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocationOnIcon sx={{ color: 'rgba(148,163,184,0.6)' }} />
                      </InputAdornment>
                    ),
                    sx: { color: 'white', fontSize: '1.1rem' },
                  },
                  inputLabel: {
                    sx: { color: '#0ea5e9', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' },
                    shrink: true,
                  },
                }}
              />
            </div>
            <Button
              type="submit"
              variant="contained"
              startIcon={<SearchIcon />}
              sx={{
                background: 'linear-gradient(to right, #0ea5e9, #06b6d4)',
                '&:hover': { background: 'linear-gradient(to right, #38bdf8, #22d3ee)' },
                px: 5,
                py: { xs: 2, md: 0 },
                borderRadius: 0,
                fontSize: '1rem',
                fontWeight: 600,
              }}
            >
              <span className="hidden md:inline">Rechercher</span>
            </Button>
          </div>
        </form>

        <div className="flex flex-wrap justify-center gap-3 animate-slide-up animation-delay-300">
          {quickSearches.map((item) => (
            <Chip
              key={item.query}
              component={Link}
              href={`/recherche?q=${encodeURIComponent(item.query)}`}
              icon={<span>{item.icon}</span>}
              label={item.label}
              clickable
              variant="outlined"
              sx={{
                color: 'white',
                borderColor: 'rgba(255,255,255,0.15)',
                bgcolor: 'rgba(255,255,255,0.05)',
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.1)',
                  borderColor: 'rgba(14,165,233,0.5)',
                  transform: 'translateY(-2px)',
                },
                transition: 'all 0.2s ease',
                fontWeight: 500,
                py: 2.5,
                px: 1,
              }}
            />
          ))}
        </div>

        <div className="mt-12 glass rounded-2xl p-8 max-w-2xl mx-auto animate-slide-up animation-delay-400">
          <h3 className="text-white font-bold text-lg mb-3">Ajoutez votre entreprise gratuitement</h3>
          <p className="text-slate-300 text-sm mb-5">
            Créez votre fiche en quelques minutes et augmentez votre visibilité auprès de milliers de Québécois.
          </p>
          <Button
            component={Link}
            href="/entreprise/nouvelle"
            variant="contained"
            startIcon={<AutoAwesomeIcon />}
            sx={{
              bgcolor: 'primary.main',
              '&:hover': {
                bgcolor: 'primary.dark',
                transform: 'translateY(-2px)',
              },
              transition: 'all 0.2s ease',
              fontWeight: 600,
              mb: 3,
            }}
          >
            Ajouter mon entreprise
          </Button>
          <p className="text-slate-400 text-xs leading-relaxed">
            Vous voyez une entreprise qui vous appartient et qui n&apos;a pas été réclamée ? Rendez-vous sur sa fiche et faites une demande pour en prendre possession. Pour toute question, écrivez-nous à{' '}
            <a href="mailto:info@h1site.com" className="text-sky-400 hover:text-sky-300 underline">info@h1site.com</a>
          </p>
        </div>
      </div>
    </section>
  )
}
