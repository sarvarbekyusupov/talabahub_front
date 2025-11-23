'use client';

import { useState } from 'react';
import { useResumes } from '@/lib/hooks';
import { api } from '@/lib/api';
import { getToken } from '@/lib/auth';
import { useToast } from '@/components/ui/Toast';
import { Resume, ResumeEducation, ResumeExperience, ResumeSkill, ResumeLanguage, ResumeCertification, ResumeProject } from '@/types';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Container } from '@/components/ui/Container';

export default function ResumesPage() {
  const { resumes, isLoading, error, mutate } = useResumes();
  const { showToast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editingResume, setEditingResume] = useState<Resume | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    isPrimary: false,
    educations: [] as Omit<ResumeEducation, 'id'>[],
    experiences: [] as Omit<ResumeExperience, 'id'>[],
    skills: [] as Omit<ResumeSkill, 'id'>[],
    languages: [] as Omit<ResumeLanguage, 'id'>[],
    certifications: [] as Omit<ResumeCertification, 'id'>[],
    projects: [] as Omit<ResumeProject, 'id'>[],
  });

  const resetForm = () => {
    setFormData({
      title: '',
      summary: '',
      isPrimary: false,
      educations: [],
      experiences: [],
      skills: [],
      languages: [],
      certifications: [],
      projects: [],
    });
    setEditingResume(null);
  };

  const handleCreate = () => {
    resetForm();
    setShowForm(true);
  };

  const handleEdit = (resume: Resume) => {
    setEditingResume(resume);
    setFormData({
      title: resume.title,
      summary: resume.summary || '',
      isPrimary: resume.isPrimary,
      educations: resume.educations.map(({ id, ...rest }) => rest),
      experiences: resume.experiences.map(({ id, ...rest }) => rest),
      skills: resume.skills.map(({ id, ...rest }) => rest),
      languages: resume.languages.map(({ id, ...rest }) => rest),
      certifications: resume.certifications.map(({ id, ...rest }) => rest),
      projects: resume.projects.map(({ id, ...rest }) => rest),
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getToken();
    if (!token) {
      showToast('Iltimos, tizimga kiring', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingResume) {
        await api.updateResume(token, editingResume.id, formData);
        showToast('Rezyume yangilandi', 'success');
      } else {
        await api.createResume(token, formData);
        showToast('Rezyume yaratildi', 'success');
      }
      mutate();
      setShowForm(false);
      resetForm();
    } catch (err: any) {
      showToast(err.message || 'Xatolik yuz berdi', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (resumeId: number) => {
    const token = getToken();
    if (!token) return;

    if (!confirm('Haqiqatan ham bu rezyumeni o\'chirmoqchimisiz?')) return;

    setDeletingId(resumeId);
    try {
      await api.deleteResume(token, resumeId);
      showToast('Rezyume o\'chirildi', 'success');
      mutate();
    } catch (err: any) {
      showToast(err.message || 'Xatolik yuz berdi', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  const handleSetPrimary = async (resumeId: number) => {
    const token = getToken();
    if (!token) return;

    try {
      await api.setResumePrimary(token, resumeId);
      showToast('Asosiy rezyume o\'rnatildi', 'success');
      mutate();
    } catch (err: any) {
      showToast(err.message || 'Xatolik yuz berdi', 'error');
    }
  };

  // Helper functions for adding items to arrays
  const addEducation = () => {
    setFormData({
      ...formData,
      educations: [...formData.educations, {
        institution: '',
        degree: '',
        field: '',
        startDate: '',
        endDate: '',
      }],
    });
  };

  const addExperience = () => {
    setFormData({
      ...formData,
      experiences: [...formData.experiences, {
        company: '',
        title: '',
        location: '',
        startDate: '',
        endDate: '',
        current: false,
        description: '',
      }],
    });
  };

  const addSkill = () => {
    setFormData({
      ...formData,
      skills: [...formData.skills, {
        name: '',
        level: 'beginner',
      }],
    });
  };

  const addLanguage = () => {
    setFormData({
      ...formData,
      languages: [...formData.languages, {
        name: '',
        proficiency: 'basic',
      }],
    });
  };

  const removeItem = (field: string, index: number) => {
    setFormData({
      ...formData,
      [field]: (formData as any)[field].filter((_: any, i: number) => i !== index),
    });
  };

  const updateItem = (field: string, index: number, key: string, value: any) => {
    const items = [...(formData as any)[field]];
    items[index] = { ...items[index], [key]: value };
    setFormData({ ...formData, [field]: items });
  };

  if (isLoading) {
    return (
      <Container className="py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-8">
        <div className="text-center text-red-500">
          <p>Xatolik yuz berdi: {error.message}</p>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-dark">Mening rezyumelarim</h1>
        <Button onClick={handleCreate}>
          Yangi rezyume
        </Button>
      </div>

      {/* Resume List */}
      {resumes.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-gray-500 mb-4">Sizda hali rezyume yo&apos;q</p>
          <Button onClick={handleCreate}>
            Birinchi rezyumeni yarating
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4">
          {resumes.map((resume) => (
            <Card key={resume.id} className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-dark">{resume.title}</h3>
                    {resume.isPrimary && (
                      <span className="px-2 py-0.5 bg-brand/10 text-brand text-xs rounded-full">
                        Asosiy
                      </span>
                    )}
                  </div>
                  {resume.summary && (
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{resume.summary}</p>
                  )}
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                    {resume.educations.length > 0 && (
                      <span>{resume.educations.length} ta&apos;lim</span>
                    )}
                    {resume.experiences.length > 0 && (
                      <span>{resume.experiences.length} tajriba</span>
                    )}
                    {resume.skills.length > 0 && (
                      <span>{resume.skills.length} ko&apos;nikma</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  {!resume.isPrimary && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSetPrimary(resume.id)}
                    >
                      Asosiy qilish
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(resume)}
                  >
                    Tahrirlash
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(resume.id)}
                    loading={deletingId === resume.id}
                  >
                    O&apos;chirish
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-dark">
                {editingResume ? 'Rezyumeni tahrirlash' : 'Yangi rezyume'}
              </h2>
              <button
                onClick={() => { setShowForm(false); resetForm(); }}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <h3 className="font-semibold text-dark">Asosiy ma&apos;lumotlar</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rezyume nomi *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand/20 focus:border-brand"
                    placeholder="Masalan: Frontend Developer Resume"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Qisqacha ma&apos;lumot
                  </label>
                  <textarea
                    value={formData.summary}
                    onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand/20 focus:border-brand"
                    rows={3}
                    placeholder="O'zingiz haqingizda qisqacha..."
                  />
                </div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isPrimary}
                    onChange={(e) => setFormData({ ...formData, isPrimary: e.target.checked })}
                    className="rounded border-gray-300 text-brand focus:ring-brand"
                  />
                  <span className="text-sm text-gray-700">Asosiy rezyume sifatida belgilash</span>
                </label>
              </div>

              {/* Education */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-dark">Ta&apos;lim</h3>
                  <Button type="button" variant="outline" size="sm" onClick={addEducation}>
                    Qo&apos;shish
                  </Button>
                </div>
                {formData.educations.map((edu, index) => (
                  <Card key={index} className="p-4 space-y-3">
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => removeItem('educations', index)}
                        className="text-red-500 text-sm hover:text-red-700"
                      >
                        O&apos;chirish
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={edu.institution}
                        onChange={(e) => updateItem('educations', index, 'institution', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        placeholder="Ta'lim muassasasi"
                      />
                      <input
                        type="text"
                        value={edu.degree}
                        onChange={(e) => updateItem('educations', index, 'degree', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        placeholder="Daraja"
                      />
                      <input
                        type="text"
                        value={edu.field}
                        onChange={(e) => updateItem('educations', index, 'field', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        placeholder="Yo'nalish"
                      />
                      <input
                        type="date"
                        value={edu.startDate}
                        onChange={(e) => updateItem('educations', index, 'startDate', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                  </Card>
                ))}
              </div>

              {/* Experience */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-dark">Ish tajribasi</h3>
                  <Button type="button" variant="outline" size="sm" onClick={addExperience}>
                    Qo&apos;shish
                  </Button>
                </div>
                {formData.experiences.map((exp, index) => (
                  <Card key={index} className="p-4 space-y-3">
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => removeItem('experiences', index)}
                        className="text-red-500 text-sm hover:text-red-700"
                      >
                        O&apos;chirish
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={exp.company}
                        onChange={(e) => updateItem('experiences', index, 'company', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        placeholder="Kompaniya"
                      />
                      <input
                        type="text"
                        value={exp.title}
                        onChange={(e) => updateItem('experiences', index, 'title', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        placeholder="Lavozim"
                      />
                      <input
                        type="date"
                        value={exp.startDate}
                        onChange={(e) => updateItem('experiences', index, 'startDate', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={exp.current}
                          onChange={(e) => updateItem('experiences', index, 'current', e.target.checked)}
                          className="rounded border-gray-300"
                        />
                        <span className="text-sm">Hozirgi</span>
                      </label>
                    </div>
                    <textarea
                      value={exp.description || ''}
                      onChange={(e) => updateItem('experiences', index, 'description', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      rows={2}
                      placeholder="Tavsif"
                    />
                  </Card>
                ))}
              </div>

              {/* Skills */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-dark">Ko&apos;nikmalar</h3>
                  <Button type="button" variant="outline" size="sm" onClick={addSkill}>
                    Qo&apos;shish
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {formData.skills.map((skill, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={skill.name}
                        onChange={(e) => updateItem('skills', index, 'name', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        placeholder="Ko'nikma nomi"
                      />
                      <select
                        value={skill.level}
                        onChange={(e) => updateItem('skills', index, 'level', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      >
                        <option value="beginner">Boshlang&apos;ich</option>
                        <option value="intermediate">O&apos;rta</option>
                        <option value="advanced">Yuqori</option>
                        <option value="expert">Ekspert</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => removeItem('skills', index)}
                        className="text-red-500"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Languages */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-dark">Tillar</h3>
                  <Button type="button" variant="outline" size="sm" onClick={addLanguage}>
                    Qo&apos;shish
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {formData.languages.map((lang, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={lang.name}
                        onChange={(e) => updateItem('languages', index, 'name', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        placeholder="Til nomi"
                      />
                      <select
                        value={lang.proficiency}
                        onChange={(e) => updateItem('languages', index, 'proficiency', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      >
                        <option value="basic">Boshlang&apos;ich</option>
                        <option value="conversational">Suhbat</option>
                        <option value="fluent">Ravon</option>
                        <option value="native">Ona tili</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => removeItem('languages', index)}
                        className="text-red-500"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => { setShowForm(false); resetForm(); }}
                >
                  Bekor qilish
                </Button>
                <Button type="submit" loading={isSubmitting}>
                  {editingResume ? 'Saqlash' : 'Yaratish'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Container>
  );
}
