'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Container } from '../ui/Container';
import { Button } from '../ui/Button';
import { SearchBar } from '../ui/SearchBar';
import { NotificationBell } from '../ui/NotificationBell';
import { NotificationPanel } from '../ui/NotificationPanel';
import { isAuthenticated, removeTokens } from '@/lib/auth';
import { useRouter } from 'next/navigation';

export const Header = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsLoggedIn(isAuthenticated());
  }, []);

  const handleLogout = () => {
    removeTokens();
    setIsLoggedIn(false);
    router.push('/');
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <Container>
        <div className="flex items-center justify-between gap-4 h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 flex-shrink-0">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">T</span>
            </div>
            <span className="text-xl font-bold text-gray-900 hidden sm:block">TALABA HUB</span>
          </Link>

          {/* Search Bar - Desktop */}
          <div className="hidden lg:block flex-1 max-w-md">
            <SearchBar />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/discounts" className="text-gray-600 hover:text-blue-600 transition">
              Chegirmalar
            </Link>
            <Link href="/jobs" className="text-gray-600 hover:text-blue-600 transition">
              Ish o'rinlari
            </Link>
            <Link href="/events" className="text-gray-600 hover:text-blue-600 transition">
              Tadbirlar
            </Link>
            <Link href="/courses" className="text-gray-600 hover:text-blue-600 transition">
              Kurslar
            </Link>
          </nav>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {isLoggedIn ? (
              <>
                <NotificationBell onClick={() => setIsNotificationPanelOpen(true)} />
                <Link href="/dashboard">
                  <Button variant="ghost">Dashboard</Button>
                </Link>
                <Link href="/profile">
                  <Button variant="ghost">Profil</Button>
                </Link>
                <Button variant="outline" onClick={handleLogout}>
                  Chiqish
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost">Kirish</Button>
                </Link>
                <Link href="/register">
                  <Button>Ro'yxatdan o'tish</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t">
            {/* Search Bar - Mobile */}
            <div className="mb-4">
              <SearchBar />
            </div>
            <nav className="flex flex-col space-y-4">
              <Link href="/discounts" className="text-gray-600 hover:text-blue-600">
                Chegirmalar
              </Link>
              <Link href="/jobs" className="text-gray-600 hover:text-blue-600">
                Ish o'rinlari
              </Link>
              <Link href="/events" className="text-gray-600 hover:text-blue-600">
                Tadbirlar
              </Link>
              <Link href="/courses" className="text-gray-600 hover:text-blue-600">
                Kurslar
              </Link>
              <div className="pt-4 border-t space-y-2">
                {isLoggedIn ? (
                  <>
                    <Link href="/profile">
                      <Button fullWidth variant="ghost">Profil</Button>
                    </Link>
                    <Button fullWidth variant="outline" onClick={handleLogout}>
                      Chiqish
                    </Button>
                  </>
                ) : (
                  <>
                    <Link href="/login">
                      <Button fullWidth variant="ghost">Kirish</Button>
                    </Link>
                    <Link href="/register">
                      <Button fullWidth>Ro'yxatdan o'tish</Button>
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </Container>

      {/* Notification Panel */}
      <NotificationPanel
        isOpen={isNotificationPanelOpen}
        onClose={() => setIsNotificationPanelOpen(false)}
      />
    </header>
  );
};
