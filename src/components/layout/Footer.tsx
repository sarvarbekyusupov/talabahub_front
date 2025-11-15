import Link from 'next/link';
import { Container } from '../ui/Container';

export const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 py-12 mt-20">
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">TALABA HUB</h3>
            <p className="text-sm">
              Talabalar uchun zamonaviy platforma. Chegirmalar, ish o'rinlari,
              tadbirlar va kurslar bitta joyda.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Tezkor havolalar</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/discounts" className="hover:text-white transition">
                  Chegirmalar
                </Link>
              </li>
              <li>
                <Link href="/jobs" className="hover:text-white transition">
                  Ish o'rinlari
                </Link>
              </li>
              <li>
                <Link href="/events" className="hover:text-white transition">
                  Tadbirlar
                </Link>
              </li>
              <li>
                <Link href="/courses" className="hover:text-white transition">
                  Kurslar
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-white font-semibold mb-4">Yordam</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="hover:text-white transition">
                  Biz haqimizda
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition">
                  Bog'lanish
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-white transition">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4">Aloqa</h4>
            <ul className="space-y-2 text-sm">
              <li>Email: info@talabahub.com</li>
              <li>Tel: +998 90 123 45 67</li>
              <li>Toshkent, O'zbekiston</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
          <p>&copy; 2024 TALABA HUB. Barcha huquqlar himoyalangan.</p>
        </div>
      </Container>
    </footer>
  );
};
