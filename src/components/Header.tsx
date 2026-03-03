'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect, useMemo } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import type { User } from '@supabase/supabase-js'
import {
  AppBar,
  Toolbar,
  Button,
  IconButton,
  Drawer,
  Box,
  Divider,
  Avatar,
  Chip,
} from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import CloseIcon from '@mui/icons-material/Close'
import SearchIcon from '@mui/icons-material/Search'
import AddBusinessIcon from '@mui/icons-material/AddBusiness'
import FavoriteIcon from '@mui/icons-material/Favorite'
import LogoutIcon from '@mui/icons-material/Logout'
import LoginIcon from '@mui/icons-material/Login'

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const supabase = useMemo(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ), [])

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    window.location.href = '/'
  }

  return (
    <>
      <AppBar
        position="fixed"
        elevation={isScrolled ? 2 : 0}
        sx={{
          bgcolor: isScrolled ? 'background.paper' : 'transparent',
          backdropFilter: isScrolled ? 'blur(12px)' : 'none',
          transition: 'all 0.3s ease',
          borderBottom: isScrolled ? '1px solid' : 'none',
          borderColor: 'divider',
        }}
      >
        <Toolbar className="max-w-7xl mx-auto w-full px-4 sm:px-6" sx={{ minHeight: { xs: 64 } }}>
          {/* Logo */}
          <Link href="/" prefetch={true} className="flex items-center gap-3 group no-underline">
            <Image
              src="/images/logos/logo.webp"
              alt="Registre du Québec"
              width={36}
              height={36}
              priority
              className="rounded-xl drop-shadow-lg group-hover:scale-105 transition-transform brightness-0 invert"
            />
            <Box className="hidden sm:flex items-center gap-2">
              <Box component="span" sx={{ fontWeight: 700, fontSize: '0.875rem', color: 'text.primary' }}>
                Registre du Québec
              </Box>
              <Chip label="Bêta" size="small" color="primary" variant="outlined" sx={{ fontSize: '0.6rem', height: 20 }} />
            </Box>
          </Link>

          <Box sx={{ flexGrow: 1 }} />

          {/* Desktop Navigation */}
          <Box className="hidden lg:flex items-center gap-1">
            <Button
              component={Link}
              href="/"
              color="inherit"
              sx={{ fontSize: '0.875rem', color: 'text.secondary', '&:hover': { color: 'text.primary', bgcolor: 'action.hover' } }}
            >
              Accueil
            </Button>
            <Button
              component={Link}
              href="/recherche"
              color="inherit"
              startIcon={<SearchIcon sx={{ fontSize: 18 }} />}
              sx={{ fontSize: '0.875rem', color: 'text.secondary', '&:hover': { color: 'text.primary', bgcolor: 'action.hover' } }}
            >
              Recherche
            </Button>
            <Button
              component={Link}
              href="/entreprise/nouvelle"
              color="inherit"
              startIcon={<AddBusinessIcon sx={{ fontSize: 18 }} />}
              sx={{ fontSize: '0.875rem', color: 'text.secondary', '&:hover': { color: 'text.primary', bgcolor: 'action.hover' } }}
            >
              Ajouter
            </Button>

            <Divider orientation="vertical" flexItem sx={{ mx: 1, borderColor: 'divider' }} />

            {!loading && (
              <>
                {user ? (
                  <Box className="flex items-center gap-1">
                    <Button
                      component={Link}
                      href="/tableau-de-bord"
                      variant="outlined"
                      size="small"
                      startIcon={
                        user.user_metadata?.avatar_url ? (
                          <Avatar src={user.user_metadata.avatar_url} sx={{ width: 24, height: 24 }} />
                        ) : (
                          <Avatar sx={{ width: 24, height: 24, bgcolor: 'primary.main', fontSize: '0.75rem' }}>
                            {user.email?.charAt(0).toUpperCase()}
                          </Avatar>
                        )
                      }
                      sx={{ borderColor: 'divider', color: 'text.primary', textTransform: 'none' }}
                    >
                      <Box component="span" className="hidden xl:inline">
                        {user.user_metadata?.full_name || user.email?.split('@')[0]}
                      </Box>
                    </Button>
                    <IconButton onClick={handleLogout} size="small" sx={{ color: 'text.secondary' }}>
                      <LogoutIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ) : (
                  <Button
                    component={Link}
                    href="/connexion"
                    variant="contained"
                    size="small"
                    startIcon={<LoginIcon />}
                  >
                    Connexion
                  </Button>
                )}
              </>
            )}

            <Button
              component="a"
              href="https://www.paypal.com/donate/?hosted_button_id=GUPL4K5WR3ZG4"
              target="_blank"
              rel="noopener noreferrer"
              variant="contained"
              size="small"
              startIcon={<FavoriteIcon />}
              sx={{
                ml: 1,
                background: 'linear-gradient(to right, #ec4899, #f43f5e)',
                '&:hover': { background: 'linear-gradient(to right, #db2777, #e11d48)' },
              }}
            >
              <Box component="span" className="hidden xl:inline">Don</Box>
            </Button>

            <Button
              component={Link}
              href="/en"
              color="inherit"
              size="small"
              sx={{ ml: 1, minWidth: 'auto', color: 'text.secondary', fontWeight: 600 }}
            >
              EN
            </Button>
          </Box>

          {/* Mobile */}
          <Box className="flex lg:hidden items-center gap-1">
            <Button
              component={Link}
              href="/en"
              color="inherit"
              size="small"
              sx={{ minWidth: 'auto', color: 'text.secondary', fontWeight: 600 }}
            >
              EN
            </Button>
            <IconButton
              color="inherit"
              onClick={() => setDrawerOpen(true)}
              sx={{ color: 'text.primary' }}
            >
              <MenuIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        slotProps={{
          paper: {
            sx: {
              width: 300,
              bgcolor: 'background.paper',
              p: 2,
            },
          },
        }}
      >
        <Box className="flex justify-between items-center mb-4">
          <Box sx={{ fontWeight: 700, fontSize: '1rem', color: 'text.primary' }}>Menu</Box>
          <IconButton onClick={() => setDrawerOpen(false)} sx={{ color: 'text.secondary' }}>
            <CloseIcon />
          </IconButton>
        </Box>

        {user && (
          <Button
            component={Link}
            href="/tableau-de-bord"
            onClick={() => setDrawerOpen(false)}
            fullWidth
            startIcon={
              user.user_metadata?.avatar_url ? (
                <Avatar src={user.user_metadata.avatar_url} sx={{ width: 36, height: 36 }} />
              ) : (
                <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main' }}>
                  {user.email?.charAt(0).toUpperCase()}
                </Avatar>
              )
            }
            sx={{
              justifyContent: 'flex-start',
              color: 'text.primary',
              textTransform: 'none',
              mb: 2,
              py: 1.5,
              bgcolor: 'action.hover',
              borderRadius: 3,
            }}
          >
            <Box>
              <Box sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                {user.user_metadata?.full_name || user.email?.split('@')[0]}
              </Box>
              <Box sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>Tableau de bord</Box>
            </Box>
          </Button>
        )}

        <Box className="flex flex-col gap-1">
          <Button
            component={Link}
            href="/"
            onClick={() => setDrawerOpen(false)}
            fullWidth
            sx={{ justifyContent: 'flex-start', color: 'text.primary', py: 1.5 }}
          >
            Accueil
          </Button>
          <Button
            component={Link}
            href="/recherche"
            onClick={() => setDrawerOpen(false)}
            fullWidth
            startIcon={<SearchIcon />}
            sx={{ justifyContent: 'flex-start', color: 'text.primary', py: 1.5 }}
          >
            Recherche
          </Button>
          <Button
            component={Link}
            href="/entreprise/nouvelle"
            onClick={() => setDrawerOpen(false)}
            fullWidth
            startIcon={<AddBusinessIcon />}
            sx={{ justifyContent: 'flex-start', color: 'text.primary', py: 1.5 }}
          >
            Ajouter une entreprise
          </Button>
        </Box>

        <Divider sx={{ my: 2 }} />

        {user ? (
          <Button
            onClick={() => {
              handleLogout()
              setDrawerOpen(false)
            }}
            fullWidth
            color="error"
            startIcon={<LogoutIcon />}
            sx={{ justifyContent: 'flex-start', py: 1.5 }}
          >
            Déconnexion
          </Button>
        ) : (
          <Button
            component={Link}
            href="/connexion"
            onClick={() => setDrawerOpen(false)}
            fullWidth
            variant="contained"
            startIcon={<LoginIcon />}
            sx={{ py: 1.5 }}
          >
            Connexion avec Google
          </Button>
        )}

        <Button
          component="a"
          href="https://www.paypal.com/donate/?hosted_button_id=GUPL4K5WR3ZG4"
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => setDrawerOpen(false)}
          fullWidth
          variant="contained"
          startIcon={<FavoriteIcon />}
          sx={{
            mt: 2,
            py: 1.5,
            background: 'linear-gradient(to right, #ec4899, #f43f5e)',
            '&:hover': { background: 'linear-gradient(to right, #db2777, #e11d48)' },
          }}
        >
          Faire un don
        </Button>
      </Drawer>
    </>
  )
}
