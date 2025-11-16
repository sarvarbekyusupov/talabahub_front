'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { api } from '@/lib/api';
import { getToken } from '@/lib/auth';
import { useToast } from '@/components/ui/Toast';
import { SavedItem } from '@/types';

export default function SavedItemsPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'discount' | 'job' | 'event' | 'course'>('all');
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);

  useEffect(() => {
    loadSavedItems();
  }, []);

  const loadSavedItems = async () => {
    const token = getToken();
    if (!token) {
      router.push('/login');
      return;
    }

    setLoading(true);
    try {
      const data = await api.getSavedItems(token) as SavedItem[];
      setSavedItems(data);
    } catch (error: any) {
      console.error('Error loading saved items:', error);
      showToast(error.message || 'Saqlanganlarni yuklashda xatolik', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUnsave = async (itemId: string) => {
    const token = getToken();
    if (!token) return;

    try {
      await api.unsaveItem(token, itemId);
      showToast('O\'chirildi', 'success');
      setSavedItems(savedItems.filter(item => item.id !== itemId));
    } catch (error: any) {
      console.error('Error unsaving item:', error);
      showToast(error.message || 'O\'chirishda xatolik', 'error');
    }
  };

  const filteredItems = activeTab === 'all'
    ? savedItems
    : savedItems.filter(item => item.itemType === activeTab);

  const getItemTypeLabel = (type: string) => {
    switch (type) {
      case 'discount': return 'Chegirma';
      case 'job': return 'Ish';
      case 'event': return 'Tadbir';
      case 'course': return 'Kurs';
      default: return type;
    }
  };

  const getItemTypeBadgeVariant = (type: string) => {
    switch (type) {
      case 'discount': return 'info';
      case 'job': return 'success';
      case 'event': return 'warning';
      case 'course': return 'primary';
      default: return 'default';
    }
  };

  const getItemLink = (item: SavedItem) => {
    switch (item.itemType) {
      case 'discount': return `/discounts/${item.itemId}`;
      case 'job': return `/jobs/${item.itemId}`;
      case 'event': return `/events/${item.itemId}`;
      case 'course': return `/courses/${item.itemId}`;
      default: return '#';
    }
  };

  const getItemTitle = (item: SavedItem) => {
    if ('title' in item.item) return item.item.title;
    return 'Unknown';
  };

  const getItemDescription = (item: SavedItem) => {
    if ('description' in item.item) return item.item.description;
    return '';
  };

  if (loading) {
    return (
      <Container className="py-12">
        <div className="text-center">Yuklanmoqda...</div>
      </Container>
    );
  }

  return (
    <Container className="py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Saqlangan elementlar</h1>
        <p className="text-gray-600 mt-1">Siz saqlagan barcha chegirmalar, ishlar, tadbirlar va kurslar</p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition ${
            activeTab === 'all'
              ? 'bg-brand text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Hammasi ({savedItems.length})
        </button>
        <button
          onClick={() => setActiveTab('discount')}
          className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition ${
            activeTab === 'discount'
              ? 'bg-brand text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Chegirmalar ({savedItems.filter(i => i.itemType === 'discount').length})
        </button>
        <button
          onClick={() => setActiveTab('job')}
          className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition ${
            activeTab === 'job'
              ? 'bg-brand text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Ishlar ({savedItems.filter(i => i.itemType === 'job').length})
        </button>
        <button
          onClick={() => setActiveTab('event')}
          className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition ${
            activeTab === 'event'
              ? 'bg-brand text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Tadbirlar ({savedItems.filter(i => i.itemType === 'event').length})
        </button>
        <button
          onClick={() => setActiveTab('course')}
          className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition ${
            activeTab === 'course'
              ? 'bg-brand text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Kurslar ({savedItems.filter(i => i.itemType === 'course').length})
        </button>
      </div>

      {/* Saved Items List */}
      {filteredItems.length === 0 ? (
        <Card className="text-center py-12">
          <svg
            className="w-16 h-16 mx-auto text-gray-400 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
            />
          </svg>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Hech narsa saqlanmagan
          </h3>
          <p className="text-gray-600 mb-4">
            {activeTab === 'all'
              ? 'Siz hali hech narsani saqlamadingiz'
              : `Siz hali hech qanday ${getItemTypeLabel(activeTab).toLowerCase()} saqlamadingiz`
            }
          </p>
          <Link href={activeTab === 'all' ? '/discounts' : `/${activeTab}s`}>
            <Button>Ko'rib chiqish</Button>
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredItems.map((item) => (
            <Card key={item.id} hover>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant={getItemTypeBadgeVariant(item.itemType)}>
                      {getItemTypeLabel(item.itemType)}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      Saqlangan: {new Date(item.savedAt).toLocaleDateString('uz-UZ')}
                    </span>
                  </div>
                  <Link href={getItemLink(item)}>
                    <h3 className="text-lg font-bold text-gray-900 hover:text-brand transition mb-1">
                      {getItemTitle(item)}
                    </h3>
                  </Link>
                  <p className="text-gray-600 line-clamp-2">{getItemDescription(item)}</p>

                  <div className="flex items-center gap-3 mt-3">
                    <Link href={getItemLink(item)}>
                      <Button variant="ghost" size="sm">
                        Ko'rish
                      </Button>
                    </Link>
                    <button
                      onClick={() => handleUnsave(item.id)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      O'chirish
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </Container>
  );
}
