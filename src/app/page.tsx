import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function Home() {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <Container>
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              TALABA HUB
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Talabalar uchun chegirmalar, ish o'rinlari, tadbirlar va kurslar bitta platformada
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/register">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                  Boshlash
                </Button>
              </Link>
              <Link href="/discounts">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-blue-700">
                  Chegirmalarni ko'rish
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <Container>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Nima taklif qilamiz?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Talabalar uchun maxsus imtiyozlar va imkoniyatlar
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Discounts */}
            <Card hover className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Chegirmalar</h3>
              <p className="text-gray-600 mb-4">
                Brendlardan maxsus talaba chegirmalari
              </p>
              <Link href="/discounts">
                <Button variant="ghost" size="sm">Ko'rish</Button>
              </Link>
            </Card>

            {/* Jobs */}
            <Card hover className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Ish o'rinlari</h3>
              <p className="text-gray-600 mb-4">
                Talabalar uchun part-time va full-time ishlar
              </p>
              <Link href="/jobs">
                <Button variant="ghost" size="sm">Ko'rish</Button>
              </Link>
            </Card>

            {/* Events */}
            <Card hover className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Tadbirlar</h3>
              <p className="text-gray-600 mb-4">
                Konferensiyalar, seminarlar va networking
              </p>
              <Link href="/events">
                <Button variant="ghost" size="sm">Ko'rish</Button>
              </Link>
            </Card>

            {/* Courses */}
            <Card hover className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Kurslar</h3>
              <p className="text-gray-600 mb-4">
                O'quv kurslari va treninglar
              </p>
              <Link href="/courses">
                <Button variant="ghost" size="sm">Ko'rish</Button>
              </Link>
            </Card>
          </div>
        </Container>
      </section>

      {/* Stats Section */}
      <section className="bg-gray-100 py-16">
        <Container>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">500+</div>
              <div className="text-gray-600">Chegirmalar</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">200+</div>
              <div className="text-gray-600">Ish o'rinlari</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">100+</div>
              <div className="text-gray-600">Tadbirlar</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">50+</div>
              <div className="text-gray-600">Kurslar</div>
            </div>
          </div>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <Container>
          <Card className="bg-gradient-to-r from-blue-600 to-blue-800 text-white text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Hoziroq qo'shiling!
            </h2>
            <p className="text-xl mb-8 text-blue-100">
              Talabalar uchun maxsus imtiyozlardan foydalaning
            </p>
            <Link href="/register">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                Ro'yxatdan o'tish
              </Button>
            </Link>
          </Card>
        </Container>
      </section>
    </div>
  );
}
