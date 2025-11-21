'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { useArticleBySlug, useArticleResponses, useRelatedArticles } from '@/lib/hooks';
import { api } from '@/lib/api';
import { getToken } from '@/lib/auth';
import { Article, ArticleResponse, Tag, ContentBlock } from '@/types';

export default function ArticlePage() {
  const params = useParams();
  const slug = params.slug as string;
  const token = getToken();

  const { article, isLoading, error, mutate } = useArticleBySlug(slug);
  const { responses, total: responsesTotal, mutate: mutateResponses } = useArticleResponses(article?.id || '');
  const { articles: relatedArticles } = useRelatedArticles(article?.id || '');

  const [clapping, setClapping] = useState(false);
  const [yourClaps, setYourClaps] = useState(0);
  const [totalClaps, setTotalClaps] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarking, setBookmarking] = useState(false);
  const [responseText, setResponseText] = useState('');
  const [submittingResponse, setSubmittingResponse] = useState(false);

  // Track view
  useEffect(() => {
    if (article?.id) {
      api.trackArticleView(article.id, { referrer: document.referrer });
      setTotalClaps(article.stats?.clapsCount || 0);
      setYourClaps(article.yourClaps || 0);
      setIsBookmarked(article.isBookmarked || false);
    }
  }, [article]);

  const handleClap = async () => {
    if (!token) {
      alert('Clap qilish uchun tizimga kiring');
      return;
    }
    if (clapping || yourClaps >= 50) return;

    setClapping(true);
    try {
      const result = await api.clapArticle(token, article!.id, 1) as { totalClaps: number; yourClaps: number };
      setTotalClaps(result.totalClaps);
      setYourClaps(result.yourClaps);
    } catch (err) {
      console.error('Clap error:', err);
    } finally {
      setClapping(false);
    }
  };

  const handleBookmark = async () => {
    if (!token) {
      alert('Saqlash uchun tizimga kiring');
      return;
    }
    if (bookmarking) return;

    setBookmarking(true);
    try {
      if (isBookmarked) {
        await api.removeBookmark(token, article!.id);
        setIsBookmarked(false);
      } else {
        await api.bookmarkArticle(token, article!.id);
        setIsBookmarked(true);
      }
    } catch (err) {
      console.error('Bookmark error:', err);
    } finally {
      setBookmarking(false);
    }
  };

  const handleShare = async (platform: string) => {
    const url = window.location.href;
    const text = article?.title || '';

    if (token) {
      api.shareArticle(token, article!.id, platform);
    }

    switch (platform) {
      case 'telegram':
        window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`);
        break;
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`);
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`);
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`);
        break;
      case 'copy_link':
        navigator.clipboard.writeText(url);
        alert('Havola nusxalandi!');
        break;
    }
  };

  const handleSubmitResponse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      alert('Izoh qoldirish uchun tizimga kiring');
      return;
    }
    if (!responseText.trim() || submittingResponse) return;

    setSubmittingResponse(true);
    try {
      await api.createArticleResponse(token, article!.id, {
        content: { text: responseText.trim() }
      });
      setResponseText('');
      mutateResponses();
    } catch (err) {
      console.error('Response error:', err);
      alert('Izoh yuborishda xatolik');
    } finally {
      setSubmittingResponse(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('uz-UZ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const renderContent = (blocks: ContentBlock[]) => {
    return blocks.map((block, index) => {
      switch (block.type) {
        case 'paragraph':
          return (
            <p key={index} className="mb-4 text-gray-700 leading-relaxed">
              {block.content.text}
            </p>
          );
        case 'heading':
          const HeadingTag = `h${block.content.level || 2}` as keyof JSX.IntrinsicElements;
          return (
            <HeadingTag key={index} className="font-bold text-gray-900 mt-8 mb-4">
              {block.content.text}
            </HeadingTag>
          );
        case 'image':
          return (
            <figure key={index} className="my-8">
              <Image
                src={block.content.url || ''}
                alt={block.content.caption || ''}
                width={800}
                height={450}
                className="rounded-lg w-full"
              />
              {block.content.caption && (
                <figcaption className="text-sm text-gray-500 text-center mt-2">
                  {block.content.caption}
                </figcaption>
              )}
            </figure>
          );
        case 'code':
          return (
            <pre key={index} className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto my-4">
              <code>{block.content.text}</code>
            </pre>
          );
        case 'quote':
          return (
            <blockquote key={index} className="border-l-4 border-blue-500 pl-4 italic my-4 text-gray-600">
              {block.content.text}
            </blockquote>
          );
        case 'list':
          const ListTag = block.content.ordered ? 'ol' : 'ul';
          return (
            <ListTag key={index} className={`my-4 pl-6 ${block.content.ordered ? 'list-decimal' : 'list-disc'}`}>
              {block.content.items?.map((item, i) => (
                <li key={i} className="mb-2">{item}</li>
              ))}
            </ListTag>
          );
        default:
          return null;
      }
    });
  };

  if (isLoading) {
    return (
      <Container className="py-8">
        <div className="max-w-4xl mx-auto">
          <Skeleton className="h-12 mb-4" />
          <Skeleton className="h-6 w-1/2 mb-8" />
          <Skeleton className="h-96 mb-8" />
          <Skeleton className="h-6 mb-4" />
          <Skeleton className="h-6 mb-4" />
        </div>
      </Container>
    );
  }

  if (error || !article) {
    return (
      <Container className="py-20">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Maqola topilmadi</h2>
          <p className="text-gray-600 mb-6">Kechirasiz, bu maqola mavjud emas</p>
          <Link href="/blog">
            <Button>Blog sahifasiga qaytish</Button>
          </Link>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Link href="/blog">
          <Button variant="ghost" className="mb-6">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Orqaga
          </Button>
        </Link>

        <article>
          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {article.tags.map((tag: Tag) => (
                <Badge key={tag.id} variant="info">#{tag.name}</Badge>
              ))}
            </div>
          )}

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {article.title}
          </h1>

          {/* Subtitle */}
          {article.subtitle && (
            <p className="text-xl text-gray-600 mb-6">{article.subtitle}</p>
          )}

          {/* Author Info */}
          <div className="flex items-center justify-between py-6 border-y border-gray-200 mb-8">
            <Link href={`/students/${article.author.username}`} className="flex items-center gap-3 group">
              {article.author.avatarUrl ? (
                <Image
                  src={article.author.avatarUrl}
                  alt={article.author.firstName}
                  width={48}
                  height={48}
                  className="rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600 font-semibold">
                    {article.author.firstName[0]}{article.author.lastName[0]}
                  </span>
                </div>
              )}
              <div>
                <p className="font-semibold text-gray-900 group-hover:text-blue-600 transition">
                  {article.author.firstName} {article.author.lastName}
                </p>
                <p className="text-sm text-gray-600">
                  {formatDate(article.publishedAt || article.createdAt)} · {article.readingTimeMinutes} min o'qish
                </p>
              </div>
            </Link>

            {/* Quick Stats */}
            <div className="flex items-center gap-4 text-gray-500">
              <span className="flex items-center gap-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                {article.stats?.viewsCount || 0}
              </span>
            </div>
          </div>

          {/* Featured Image */}
          {article.featuredImageUrl && (
            <div className="mb-8 rounded-lg overflow-hidden">
              <Image
                src={article.featuredImageUrl}
                alt={article.title}
                width={1200}
                height={675}
                className="w-full h-auto"
              />
            </div>
          )}

          {/* Content */}
          <div className="prose prose-lg max-w-none mb-8">
            {renderContent(article.content)}
          </div>

          {/* Engagement Bar */}
          <div className="sticky bottom-4 bg-white border border-gray-200 rounded-full shadow-lg p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Clap Button */}
              <button
                onClick={handleClap}
                disabled={clapping || yourClaps >= 50}
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition ${
                  yourClaps > 0
                    ? 'bg-red-100 text-red-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <svg className="w-5 h-5" fill={yourClaps > 0 ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span>{totalClaps}</span>
              </button>

              {/* Responses Count */}
              <a href="#responses" className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span>{responsesTotal}</span>
              </a>
            </div>

            <div className="flex items-center gap-2">
              {/* Bookmark Button */}
              <button
                onClick={handleBookmark}
                disabled={bookmarking}
                className={`p-2 rounded-full transition ${
                  isBookmarked
                    ? 'bg-blue-100 text-blue-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <svg className="w-5 h-5" fill={isBookmarked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              </button>

              {/* Share Buttons */}
              <button onClick={() => handleShare('telegram')} className="p-2 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18 1.897-.962 6.502-1.359 8.627-.168.9-.5 1.201-.82 1.23-.697.064-1.226-.461-1.901-.903-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.015-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.139-5.062 3.345-.479.329-.913.489-1.302.481-.428-.009-1.252-.242-1.865-.442-.752-.244-1.349-.374-1.297-.789.027-.216.324-.437.893-.663 3.498-1.524 5.831-2.529 6.998-3.015 3.333-1.386 4.025-1.627 4.477-1.635.099-.002.321.023.465.141.121.1.154.234.17.331.015.098.034.322.019.496z"/>
                </svg>
              </button>
              <button onClick={() => handleShare('copy_link')} className="p-2 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Responses Section */}
          <div id="responses" className="mt-12 pt-8 border-t">
            <h3 className="text-2xl font-bold mb-6">Izohlar ({responsesTotal})</h3>

            {/* Response Form */}
            <form onSubmit={handleSubmitResponse} className="mb-8">
              <textarea
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                placeholder="Izoh qoldiring..."
                className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={4}
              />
              <div className="flex justify-end mt-2">
                <Button type="submit" disabled={!responseText.trim() || submittingResponse}>
                  {submittingResponse ? 'Yuborilmoqda...' : 'Yuborish'}
                </Button>
              </div>
            </form>

            {/* Responses List */}
            <div className="space-y-6">
              {responses.map((response: ArticleResponse) => (
                <div key={response.id} className="flex gap-4">
                  {response.author.avatarUrl ? (
                    <Image
                      src={response.author.avatarUrl}
                      alt={response.author.firstName}
                      width={40}
                      height={40}
                      className="rounded-full object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-600 text-sm font-semibold">
                        {response.author.firstName[0]}{response.author.lastName[0]}
                      </span>
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-900">
                        {response.author.firstName} {response.author.lastName}
                      </span>
                      <span className="text-sm text-gray-500">
                        {formatDate(response.createdAt)}
                      </span>
                      {response.isEdited && (
                        <span className="text-xs text-gray-400">(tahrirlangan)</span>
                      )}
                    </div>
                    <p className="text-gray-700">{response.content.text}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <button className="flex items-center gap-1 hover:text-gray-700">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        {response.clapsCount}
                      </button>
                      <button className="hover:text-gray-700">Javob berish</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Related Articles */}
          {relatedArticles.length > 0 && (
            <div className="mt-12 pt-8 border-t">
              <h3 className="text-2xl font-bold mb-6">O'xshash maqolalar</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {relatedArticles.slice(0, 4).map((related: Article) => (
                  <Link key={related.id} href={`/blog/${related.slug}`}>
                    <Card hover className="h-full">
                      <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-blue-600 transition">
                        {related.title}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {related.author.firstName} {related.author.lastName}
                      </p>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </article>
      </div>
    </Container>
  );
}
