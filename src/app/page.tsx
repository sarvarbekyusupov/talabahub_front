import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function Home() {
  return (
    <div className="bg-lavender-200 bg-topo min-h-screen">
      {/* Hero Section - 60/40 Split */}
      <section className="py-20 md:py-32">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-center">
            {/* Left Column - Text Content (60%) */}
            <div className="lg:col-span-3 space-y-8">
              <div className="inline-block">
                <span className="px-6 py-2 rounded-full bg-white/60 backdrop-blur-sm text-dark text-sm font-medium shadow-sm">
                  🎓 Talabalar uchun maxsus platforma
                </span>
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight">
                Talaba hayotini{' '}
                <span className="relative inline-block">
                  <span className="relative z-10 text-gray-900">osonlashtiring</span>
                  <span className="absolute bottom-2 left-0 w-full h-4 bg-brand/20 -rotate-1"></span>
                </span>
              </h1>

              <p className="text-xl md:text-2xl text-gray-700 leading-relaxed max-w-2xl">
                Chegirmalar, ish o'rinlari, tadbirlar va kurslar — barcha imkoniyatlar bitta joyda
              </p>

              <div className="flex flex-wrap gap-3 pt-4">
                <span className="px-4 py-2 rounded-full bg-white shadow-sm text-dark/60 text-sm">💰 Chegirmalar</span>
                <span className="px-4 py-2 rounded-full bg-white shadow-sm text-dark/60 text-sm">💼 Ish</span>
                <span className="px-4 py-2 rounded-full bg-white shadow-sm text-dark/60 text-sm">📅 Tadbirlar</span>
                <span className="px-4 py-2 rounded-full bg-white shadow-sm text-dark/60 text-sm">📚 Kurslar</span>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link href="/register">
                  <Button
                    size="lg"
                    className="bg-dark text-white hover:bg-dark/90 shadow-lg hover:shadow-xl transition-all duration-300 px-8 py-6 text-lg rounded-2xl"
                  >
                    Boshlash
                  </Button>
                </Link>
                <Link href="/discounts">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-2 border-dark text-dark hover:bg-dark hover:text-white transition-all duration-300 px-8 py-6 text-lg rounded-2xl"
                  >
                    Chegirmalarni ko'rish →
                  </Button>
                </Link>
              </div>

              <div className="flex items-center gap-8 pt-8">
                <div className="flex -space-x-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand to-lavender-600 border-2 border-white"></div>
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent to-accent-600 border-2 border-white"></div>
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-lavender-400 to-brand-400 border-2 border-white"></div>
                </div>
                <div className="text-gray-600">
                  <div className="font-semibold text-gray-900">2,500+ talaba</div>
                  <div className="text-sm">bizga ishonadi</div>
                </div>
              </div>
            </div>

            {/* Right Column - Visual Card (40%) */}
            <div className="lg:col-span-2">
              <div className="relative">
                {/* Main Card */}
                <div className="bg-dark rounded-3xl p-8 shadow-2xl transform hover:scale-105 transition-transform duration-300 relative overflow-hidden">
                  {/* Accent Glow */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-brand/20 rounded-full blur-3xl"></div>
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-accent/20 rounded-full blur-3xl"></div>

                  <div className="relative z-10">
                    {/* Computer Icon */}
                    <div className="w-16 h-16 rounded-2xl bg-brand/10 border-2 border-brand/30 flex items-center justify-center mb-6">
                      <svg className="w-8 h-8 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>

                    <h3 className="text-2xl font-bold text-white mb-3">
                      500+ chegirma
                    </h3>
                    <p className="text-white/60 mb-6">
                      Restoran, transport, kitob, texnologiya va boshqa ko'plab kategoriyalarda
                    </p>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                        <div className="text-accent font-bold text-2xl">50%</div>
                        <div className="text-white/50 text-sm">gacha chegirma</div>
                      </div>
                      <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                        <div className="text-brand font-bold text-2xl">200+</div>
                        <div className="text-white/50 text-sm">brendlar</div>
                      </div>
                    </div>

                    {/* Yellow Outline Effect */}
                    <div className="absolute -bottom-2 -right-2 w-24 h-24 border-4 border-accent rounded-3xl opacity-40"></div>
                  </div>
                </div>

                {/* Floating Badge */}
                <div className="absolute -top-4 -left-4 bg-accent text-dark px-6 py-3 rounded-full shadow-glow-accent font-bold transform -rotate-6">
                  🔥 Yangi!
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-white">
        <Container>
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-dark mb-4">
              Nima taklif qilamiz?
            </h2>
            <p className="text-xl text-dark/60 max-w-2xl mx-auto">
              Talaba hayotingizni yanada qiziqarli qiluvchi imkoniyatlar
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Discounts */}
            <Card hover className="p-8 rounded-3xl shadow-card hover:shadow-card-hover transition-all duration-300 border-2 border-transparent hover:border-brand/20">
              <div className="w-16 h-16 bg-brand/10 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-dark mb-3">Chegirmalar</h3>
              <p className="text-dark/60 mb-6 leading-relaxed">
                Brendlardan maxsus talaba chegirmalari
              </p>
              <Link href="/discounts">
                <Button variant="ghost" className="text-brand hover:bg-brand/5 rounded-xl">
                  Ko'rish →
                </Button>
              </Link>
            </Card>

            {/* Jobs */}
            <Card hover className="p-8 rounded-3xl shadow-card hover:shadow-card-hover transition-all duration-300 border-2 border-transparent hover:border-accent/20">
              <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-accent-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-dark mb-3">Ish o'rinlari</h3>
              <p className="text-dark/60 mb-6 leading-relaxed">
                Part-time va full-time ishlar
              </p>
              <Link href="/jobs">
                <Button variant="ghost" className="text-accent-700 hover:bg-accent/5 rounded-xl">
                  Ko'rish →
                </Button>
              </Link>
            </Card>

            {/* Events */}
            <Card hover className="p-8 rounded-3xl shadow-card hover:shadow-card-hover transition-all duration-300 border-2 border-transparent hover:border-lavender-400/40">
              <div className="w-16 h-16 bg-lavender-400/10 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-lavender-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-dark mb-3">Tadbirlar</h3>
              <p className="text-dark/60 mb-6 leading-relaxed">
                Konferensiya va networking
              </p>
              <Link href="/events">
                <Button variant="ghost" className="text-lavender-700 hover:bg-lavender-400/5 rounded-xl">
                  Ko'rish →
                </Button>
              </Link>
            </Card>

            {/* Courses */}
            <Card hover className="p-8 rounded-3xl shadow-card hover:shadow-card-hover transition-all duration-300 border-2 border-transparent hover:border-brand/20">
              <div className="w-16 h-16 bg-brand/10 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-dark mb-3">Kurslar</h3>
              <p className="text-dark/60 mb-6 leading-relaxed">
                O'quv kurslari va treninglar
              </p>
              <Link href="/courses">
                <Button variant="ghost" className="text-brand hover:bg-brand/5 rounded-xl">
                  Ko'rish →
                </Button>
              </Link>
            </Card>
          </div>
        </Container>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-dark text-white">
        <Container>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="space-y-2">
              <div className="text-5xl font-bold bg-gradient-to-r from-brand to-lavender-400 bg-clip-text text-transparent">500+</div>
              <div className="text-white/60">Chegirmalar</div>
            </div>
            <div className="space-y-2">
              <div className="text-5xl font-bold bg-gradient-to-r from-accent to-accent-400 bg-clip-text text-transparent">200+</div>
              <div className="text-white/60">Ish o'rinlari</div>
            </div>
            <div className="space-y-2">
              <div className="text-5xl font-bold bg-gradient-to-r from-lavender-400 to-brand bg-clip-text text-transparent">100+</div>
              <div className="text-white/60">Tadbirlar</div>
            </div>
            <div className="space-y-2">
              <div className="text-5xl font-bold bg-gradient-to-r from-brand to-accent bg-clip-text text-transparent">50+</div>
              <div className="text-white/60">Kurslar</div>
            </div>
          </div>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-lavender-200 bg-topo">
        <Container>
          <div className="bg-gradient-to-br from-brand to-brand-700 rounded-3xl p-12 md:p-16 text-center shadow-glow relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl"></div>

            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Hoziroq qo'shiling!
              </h2>
              <p className="text-xl md:text-2xl text-white mb-10 max-w-2xl mx-auto">
                Talabalar uchun maxsus imtiyozlardan foydalaning va karyerangizni boshlang
              </p>
              <Link href="/register">
                <Button
                  size="lg"
                  className="bg-white text-brand hover:bg-white/90 shadow-xl hover:shadow-2xl transition-all duration-300 px-12 py-7 text-lg rounded-2xl font-bold"
                >
                  Ro'yxatdan o'tish
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
