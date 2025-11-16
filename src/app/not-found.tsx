import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function NotFound() {
  return (
    <Container className="py-20">
      <Card className="max-w-2xl mx-auto text-center">
        <div className="mb-6">
          <div className="text-8xl font-bold text-brand mb-4">404</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Sahifa topilmadi
          </h1>
          <p className="text-gray-600 mb-6">
            Kechirasiz, siz qidirayotgan sahifa mavjud emas yoki o'chirilgan bo'lishi mumkin.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Link href="/jobs" className="block">
            <Card hover className="p-4 text-center">
              <div className="text-3xl mb-2">💼</div>
              <h3 className="font-semibold text-gray-900 mb-1">Ish o'rinlari</h3>
              <p className="text-sm text-gray-600">Ish izlash</p>
            </Card>
          </Link>

          <Link href="/courses" className="block">
            <Card hover className="p-4 text-center">
              <div className="text-3xl mb-2">📚</div>
              <h3 className="font-semibold text-gray-900 mb-1">Kurslar</h3>
              <p className="text-sm text-gray-600">Ta'lim olish</p>
            </Card>
          </Link>

          <Link href="/events" className="block">
            <Card hover className="p-4 text-center">
              <div className="text-3xl mb-2">🎯</div>
              <h3 className="font-semibold text-gray-900 mb-1">Tadbirlar</h3>
              <p className="text-sm text-gray-600">Ishtirok etish</p>
            </Card>
          </Link>

          <Link href="/discounts" className="block">
            <Card hover className="p-4 text-center">
              <div className="text-3xl mb-2">🎁</div>
              <h3 className="font-semibold text-gray-900 mb-1">Chegirmalar</h3>
              <p className="text-sm text-gray-600">Tejash</p>
            </Card>
          </Link>
        </div>

        <Link href="/">
          <Button size="lg">
            Bosh sahifaga qaytish
          </Button>
        </Link>
      </Card>
    </Container>
  );
}
