'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { useMyDrafts, useTags } from '@/lib/hooks';
import { api } from '@/lib/api';
import { getToken } from '@/lib/auth';
import { ArticleDraft, ContentBlock, Tag } from '@/types';

export default function WriteArticlePage() {
  const router = useRouter();
  const token = getToken();
  const { mutate: mutateDrafts } = useMyDrafts();
  const { tags: availableTags } = useTags({ limit: 50 });

  // Draft state
  const [draftId, setDraftId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [content, setContent] = useState('');
  const [featuredImageUrl, setFeaturedImageUrl] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isUnlisted, setIsUnlisted] = useState(false);

  // UI state
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showTagSelector, setShowTagSelector] = useState(false);

  // Convert plain text to content blocks
  const textToContentBlocks = (text: string): ContentBlock[] => {
    const paragraphs = text.split('\n\n').filter(p => p.trim());
    return paragraphs.map((paragraph, index) => ({
      type: 'paragraph' as const,
      content: { text: paragraph.trim() },
      position: index,
    }));
  };

  // Convert content blocks to plain text
  const contentBlocksToText = (blocks: ContentBlock[]): string => {
    return blocks
      .sort((a, b) => a.position - b.position)
      .map(block => {
        switch (block.type) {
          case 'paragraph':
          case 'heading':
          case 'quote':
            return block.content.text || '';
          case 'code':
            return `\`\`\`${block.content.language || ''}\n${block.content.text || ''}\n\`\`\``;
          case 'list':
            return (block.content.items || []).map(item => `- ${item}`).join('\n');
          case 'image':
            return `[Image: ${block.content.caption || block.content.url || ''}]`;
          default:
            return block.content.text || '';
        }
      })
      .join('\n\n');
  };

  // Auto-save function
  const saveDraft = useCallback(async () => {
    if (!token || !title.trim()) return;

    setIsSaving(true);
    setError(null);

    try {
      const draftData = {
        title: title.trim(),
        subtitle: subtitle.trim() || undefined,
        content: textToContentBlocks(content),
        featuredImageUrl: featuredImageUrl || undefined,
        tags: selectedTags,
        isUnlisted,
      };

      if (draftId) {
        // Update existing draft
        await api.updateArticleDraft(token, draftId, draftData);
      } else {
        // Create new draft
        const newDraft = await api.createArticleDraft(token, draftData) as ArticleDraft;
        setDraftId(newDraft.id);
      }

      setLastSaved(new Date());
      mutateDrafts();
    } catch (err: any) {
      setError(err.message || 'Saqlashda xatolik yuz berdi');
    } finally {
      setIsSaving(false);
    }
  }, [token, draftId, title, subtitle, content, featuredImageUrl, selectedTags, isUnlisted, mutateDrafts]);

  // Auto-save every 30 seconds when content changes
  useEffect(() => {
    if (!title.trim()) return;

    const timer = setTimeout(() => {
      saveDraft();
    }, 30000);

    return () => clearTimeout(timer);
  }, [title, subtitle, content, featuredImageUrl, selectedTags, isUnlisted, saveDraft]);

  // Publish article
  const handlePublish = async () => {
    if (!token || !title.trim() || !content.trim()) {
      setError('Sarlavha va kontent kiritilishi shart');
      return;
    }

    setIsPublishing(true);
    setError(null);

    try {
      // First save the draft
      let currentDraftId = draftId;
      if (!currentDraftId) {
        const draftData = {
          title: title.trim(),
          subtitle: subtitle.trim() || undefined,
          content: textToContentBlocks(content),
          featuredImageUrl: featuredImageUrl || undefined,
          tags: selectedTags,
          isUnlisted,
        };
        const newDraft = await api.createArticleDraft(token, draftData) as ArticleDraft;
        currentDraftId = newDraft.id;
      } else {
        await saveDraft();
      }

      // Then publish
      await api.publishArticle(token, currentDraftId!);
      mutateDrafts();
      router.push('/blog');
    } catch (err: any) {
      setError(err.message || 'Nashr qilishda xatolik yuz berdi');
    } finally {
      setIsPublishing(false);
    }
  };

  // Toggle tag selection
  const toggleTag = (tagSlug: string) => {
    setSelectedTags(prev =>
      prev.includes(tagSlug)
        ? prev.filter(t => t !== tagSlug)
        : prev.length < 5
        ? [...prev, tagSlug]
        : prev
    );
  };

  // Check if user is authenticated
  if (!token) {
    return (
      <Container className="py-8">
        <Card className="text-center py-12">
          <h2 className="text-xl font-bold mb-4">Kirish talab qilinadi</h2>
          <p className="text-gray-600 mb-6">Maqola yozish uchun hisobingizga kiring</p>
          <Button onClick={() => router.push('/login')}>Kirish</Button>
        </Card>
      </Container>
    );
  }

  return (
    <Container className="py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Yangi maqola</h1>
        <div className="flex items-center gap-4">
          {lastSaved && (
            <span className="text-sm text-gray-500">
              Saqlandi: {lastSaved.toLocaleTimeString('uz-UZ')}
            </span>
          )}
          {isSaving && (
            <span className="text-sm text-blue-600">Saqlanmoqda...</span>
          )}
          <Button
            variant="outline"
            onClick={saveDraft}
            disabled={isSaving || !title.trim()}
          >
            Saqlash
          </Button>
          <Button
            onClick={handlePublish}
            disabled={isPublishing || !title.trim() || !content.trim()}
          >
            {isPublishing ? 'Nashr qilinmoqda...' : 'Nashr qilish'}
          </Button>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <Card className="bg-red-50 border-red-200 mb-6">
          <p className="text-red-600">{error}</p>
        </Card>
      )}

      {/* Editor */}
      <Card className="mb-6">
        {/* Title */}
        <input
          type="text"
          placeholder="Sarlavha..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full text-3xl font-bold border-none outline-none mb-4 placeholder-gray-400"
        />

        {/* Subtitle */}
        <input
          type="text"
          placeholder="Qisqa tavsif (ixtiyoriy)..."
          value={subtitle}
          onChange={(e) => setSubtitle(e.target.value)}
          className="w-full text-lg text-gray-600 border-none outline-none mb-6 placeholder-gray-400"
        />

        {/* Content */}
        <textarea
          placeholder="Maqolangizni bu yerga yozing...

Matn formatlash:
- Yangi paragraf uchun bo'sh qator qoldiring
- Kod uchun ``` belgisidan foydalaning
- Ro'yxat uchun har bir qatorni - bilan boshlang"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full min-h-[400px] border-none outline-none resize-none placeholder-gray-400"
        />
      </Card>

      {/* Settings */}
      <Card className="mb-6">
        <h3 className="font-bold mb-4">Sozlamalar</h3>

        {/* Featured Image */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Asosiy rasm URL
          </label>
          <Input
            type="url"
            placeholder="https://example.com/image.jpg"
            value={featuredImageUrl}
            onChange={(e) => setFeaturedImageUrl(e.target.value)}
          />
          {featuredImageUrl && (
            <div className="mt-2 relative h-48 rounded-lg overflow-hidden">
              <Image
                src={featuredImageUrl}
                alt="Preview"
                fill
                className="object-cover"
                onError={() => setFeaturedImageUrl('')}
              />
            </div>
          )}
        </div>

        {/* Tags */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Teglar (5 tagacha)
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {selectedTags.map((tagSlug) => {
              const tag = availableTags.find((t: Tag) => t.slug === tagSlug);
              return (
                <Badge
                  key={tagSlug}
                  variant="info"
                  className="cursor-pointer"
                  onClick={() => toggleTag(tagSlug)}
                >
                  #{tag?.name || tagSlug} ×
                </Badge>
              );
            })}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowTagSelector(!showTagSelector)}
          >
            {showTagSelector ? 'Yopish' : 'Teg qo\'shish'}
          </Button>

          {showTagSelector && (
            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
              <div className="flex flex-wrap gap-2">
                {availableTags
                  .filter((tag: Tag) => !selectedTags.includes(tag.slug))
                  .map((tag: Tag) => (
                    <button
                      key={tag.id}
                      onClick={() => toggleTag(tag.slug)}
                      className="px-3 py-1 bg-white border border-gray-200 rounded-full text-sm hover:bg-blue-50 hover:border-blue-300 transition"
                    >
                      #{tag.name}
                    </button>
                  ))}
              </div>
            </div>
          )}
        </div>

        {/* Unlisted option */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="unlisted"
            checked={isUnlisted}
            onChange={(e) => setIsUnlisted(e.target.checked)}
            className="rounded"
          />
          <label htmlFor="unlisted" className="text-sm text-gray-700">
            Yashirin maqola (faqat havola orqali kirish mumkin)
          </label>
        </div>
      </Card>

      {/* Tips */}
      <Card className="bg-blue-50 border-blue-100">
        <h3 className="font-bold mb-2">Maslahatlar</h3>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>• Maqolangiz avtomatik ravishda har 30 sekundda saqlanadi</li>
          <li>• Nashr qilgandan so'ng maqola moderatsiya jarayonidan o'tadi</li>
          <li>• Yaxshi sarlavha va qisqa tavsif ko'proq o'quvchilarni jalb qiladi</li>
          <li>• Teglar maqolangizni topish imkonini oshiradi</li>
        </ul>
      </Card>
    </Container>
  );
}
