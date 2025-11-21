'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { useArticleResponses } from '@/lib/hooks';
import { api } from '@/lib/api';
import { getToken } from '@/lib/auth';
import { ArticleResponse } from '@/types';

interface ResponseSectionProps {
  articleId: string;
}

export function ResponseSection({ articleId }: ResponseSectionProps) {
  const token = getToken();
  const { responses, isLoading, error, mutate } = useArticleResponses(articleId);

  const [newResponse, setNewResponse] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('uz-UZ', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !newResponse.trim()) return;

    setIsSubmitting(true);
    try {
      await api.createArticleResponse(token, articleId, {
        content: { text: newResponse.trim() },
      });
      setNewResponse('');
      mutate();
    } catch (err) {
      console.error('Failed to submit response:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReply = async (parentId: string) => {
    if (!token || !replyContent.trim()) return;

    setIsSubmitting(true);
    try {
      await api.createArticleResponse(token, articleId, {
        content: replyContent.trim(),
        parentId,
      });
      setReplyTo(null);
      setReplyContent('');
      mutate();
    } catch (err) {
      console.error('Failed to submit reply:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async (responseId: string) => {
    if (!token || !editContent.trim()) return;

    setIsSubmitting(true);
    try {
      await api.updateArticleResponse(token, responseId, {
        content: editContent.trim(),
      });
      setEditingId(null);
      setEditContent('');
      mutate();
    } catch (err) {
      console.error('Failed to edit response:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (responseId: string) => {
    if (!token || !confirm('Javobni o\'chirmoqchimisiz?')) return;

    try {
      await api.deleteArticleResponse(token, responseId);
      mutate();
    } catch (err) {
      console.error('Failed to delete response:', err);
    }
  };

  const handleClap = async (responseId: string) => {
    if (!token) return;

    try {
      await api.clapArticleResponse(token, responseId);
      mutate();
    } catch (err) {
      console.error('Failed to clap response:', err);
    }
  };

  const startEdit = (response: ArticleResponse) => {
    setEditingId(response.id);
    setEditContent(response.content);
  };

  const renderResponse = (response: ArticleResponse, depth = 0) => {
    const isEditing = editingId === response.id;
    const isReplying = replyTo === response.id;

    return (
      <div key={response.id} className={`${depth > 0 ? 'ml-8 border-l-2 border-gray-100 pl-4' : ''}`}>
        <div className="py-4">
          {/* Author info */}
          <div className="flex items-start gap-3">
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

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-gray-900">
                  {response.author.firstName} {response.author.lastName}
                </span>
                <span className="text-sm text-gray-500">
                  {formatDate(response.createdAt)}
                </span>
                {response.isEdited && (
                  <span className="text-xs text-gray-400">(tahrirlangan)</span>
                )}
              </div>

              {/* Content */}
              {isEditing ? (
                <div className="mt-2">
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows={3}
                  />
                  <div className="flex gap-2 mt-2">
                    <Button
                      size="sm"
                      onClick={() => handleEdit(response.id)}
                      disabled={isSubmitting || !editContent.trim()}
                    >
                      Saqlash
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingId(null)}
                    >
                      Bekor qilish
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-gray-700 whitespace-pre-wrap">{response.content}</p>
              )}

              {/* Actions */}
              {!isEditing && (
                <div className="flex items-center gap-4 mt-3">
                  <button
                    onClick={() => handleClap(response.id)}
                    disabled={!token}
                    className={`flex items-center gap-1 text-sm ${
                      token ? 'text-gray-500 hover:text-green-600' : 'text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <span>{response.clapsCount || 0}</span>
                  </button>

                  {token && depth < 2 && (
                    <button
                      onClick={() => {
                        setReplyTo(isReplying ? null : response.id);
                        setReplyContent('');
                      }}
                      className="text-sm text-gray-500 hover:text-blue-600"
                    >
                      Javob berish
                    </button>
                  )}

                  {token && response.isOwner && (
                    <>
                      <button
                        onClick={() => startEdit(response)}
                        className="text-sm text-gray-500 hover:text-blue-600"
                      >
                        Tahrirlash
                      </button>
                      <button
                        onClick={() => handleDelete(response.id)}
                        className="text-sm text-gray-500 hover:text-red-600"
                      >
                        O'chirish
                      </button>
                    </>
                  )}
                </div>
              )}

              {/* Reply form */}
              {isReplying && (
                <div className="mt-4">
                  <textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Javobingizni yozing..."
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows={3}
                  />
                  <div className="flex gap-2 mt-2">
                    <Button
                      size="sm"
                      onClick={() => handleReply(response.id)}
                      disabled={isSubmitting || !replyContent.trim()}
                    >
                      Javob yuborish
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setReplyTo(null)}
                    >
                      Bekor qilish
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Nested replies */}
        {response.replies && response.replies.length > 0 && (
          <div className="mt-2">
            {response.replies.map((reply: ArticleResponse) => renderResponse(reply, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <Card>
      <h3 className="text-xl font-bold mb-6">
        Javoblar {responses.length > 0 && `(${responses.length})`}
      </h3>

      {/* New response form */}
      {token ? (
        <form onSubmit={handleSubmit} className="mb-8">
          <textarea
            value={newResponse}
            onChange={(e) => setNewResponse(e.target.value)}
            placeholder="O'z fikringizni yozing..."
            className="w-full p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={4}
          />
          <div className="flex justify-end mt-3">
            <Button
              type="submit"
              disabled={isSubmitting || !newResponse.trim()}
            >
              {isSubmitting ? 'Yuborilmoqda...' : 'Javob yuborish'}
            </Button>
          </div>
        </form>
      ) : (
        <Card className="bg-gray-50 text-center py-6 mb-8">
          <p className="text-gray-600">Javob yozish uchun hisobingizga kiring</p>
        </Card>
      )}

      {/* Responses list */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="w-10 h-10 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-16" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <p className="text-red-600">Xatolik yuz berdi: {error.message}</p>
      ) : responses.length === 0 ? (
        <p className="text-gray-500 text-center py-8">
          Hali hech qanday javob yo'q. Birinchi bo'lib javob yozing!
        </p>
      ) : (
        <div className="divide-y divide-gray-100">
          {responses.map((response: ArticleResponse) => renderResponse(response))}
        </div>
      )}
    </Card>
  );
}
