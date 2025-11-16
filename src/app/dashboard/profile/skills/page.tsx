'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { api } from '@/lib/api';
import { getToken } from '@/lib/auth';
import { useToast } from '@/components/ui/Toast';

interface Skill {
  id: string;
  name: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  yearsOfExperience?: number;
}

interface Interest {
  id: string;
  name: string;
  category: string;
}

export default function SkillsAndInterestsPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [interests, setInterests] = useState<Interest[]>([]);
  const [newSkill, setNewSkill] = useState({ name: '', level: 'beginner' as const });
  const [newInterest, setNewInterest] = useState({ name: '', category: '' });

  useEffect(() => {
    loadSkillsAndInterests();
  }, []);

  const loadSkillsAndInterests = async () => {
    const token = getToken();
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const profile = await api.getProfile(token) as any;
      setSkills(profile.skills || []);
      setInterests(profile.interests || []);
    } catch (error) {
      console.error('Error loading skills and interests:', error);
    } finally {
      setLoading(false);
    }
  };

  const addSkill = () => {
    if (!newSkill.name.trim()) {
      showToast('Iltimos, ko\'nikmani kiriting', 'error');
      return;
    }

    const skill: Skill = {
      id: Date.now().toString(),
      name: newSkill.name.trim(),
      level: newSkill.level,
    };

    setSkills([...skills, skill]);
    setNewSkill({ name: '', level: 'beginner' });
  };

  const removeSkill = (id: string) => {
    setSkills(skills.filter((s) => s.id !== id));
  };

  const addInterest = () => {
    if (!newInterest.name.trim()) {
      showToast('Iltimos, qiziqishni kiriting', 'error');
      return;
    }

    const interest: Interest = {
      id: Date.now().toString(),
      name: newInterest.name.trim(),
      category: newInterest.category || 'Other',
    };

    setInterests([...interests, interest]);
    setNewInterest({ name: '', category: '' });
  };

  const removeInterest = (id: string) => {
    setInterests(interests.filter((i) => i.id !== id));
  };

  const handleSave = async () => {
    const token = getToken();
    if (!token) return;

    setSaving(true);
    try {
      await api.updateProfile(token, { skills, interests });
      showToast('Ko\'nikmalar va qiziqishlar saqlandi', 'success');
      router.push('/dashboard');
    } catch (error) {
      console.error('Error saving skills and interests:', error);
      showToast('Saqlashda xatolik yuz berdi', 'error');
    } finally {
      setSaving(false);
    }
  };

  const getLevelBadge = (level: string) => {
    const variants: Record<string, any> = {
      beginner: 'default',
      intermediate: 'primary',
      advanced: 'success',
      expert: 'accent',
    };
    const labels: Record<string, string> = {
      beginner: 'Boshlang\'ich',
      intermediate: 'O\'rta',
      advanced: 'Ilg\'or',
      expert: 'Ekspert',
    };
    return <Badge variant={variants[level] || 'default'}>{labels[level] || level}</Badge>;
  };

  if (loading) {
    return (
      <Container className="py-12">
        <div className="text-center">Yuklanmoqda...</div>
      </Container>
    );
  }

  return (
    <Container className="py-12">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Button variant="ghost" onClick={() => router.push('/dashboard')} className="mb-4">
            ← Bosh sahifaga qaytish
          </Button>
          <h1 className="text-4xl font-bold text-dark mb-2">Ko'nikmalar va qiziqishlar</h1>
          <p className="text-lg text-dark/60">
            O'z ko'nikmalaringiz va qiziqishlaringizni qo'shing
          </p>
        </div>

        <div className="space-y-6">
          {/* Skills Section */}
          <Card>
            <h2 className="text-2xl font-bold text-dark mb-6">Ko'nikmalar</h2>

            {/* Add New Skill */}
            <div className="mb-6 p-4 bg-lavender-50 rounded-lg">
              <h3 className="font-semibold text-dark mb-3">Yangi ko'nikma qo'shish</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  type="text"
                  value={newSkill.name}
                  onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
                  placeholder="Ko'nikma nomi (masalan: JavaScript)"
                  className="px-4 py-2 border border-lavender-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
                  onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                />
                <select
                  value={newSkill.level}
                  onChange={(e) => setNewSkill({ ...newSkill, level: e.target.value as any })}
                  className="px-4 py-2 border border-lavender-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
                >
                  <option value="beginner">Boshlang'ich</option>
                  <option value="intermediate">O'rta</option>
                  <option value="advanced">Ilg'or</option>
                  <option value="expert">Ekspert</option>
                </select>
                <Button onClick={addSkill}>Qo'shish</Button>
              </div>
            </div>

            {/* Skills List */}
            {skills.length === 0 ? (
              <div className="text-center py-8 text-dark/60">
                Hali ko'nikmalar qo'shilmagan. Yuqorida yangi ko'nikma qo'shing.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {skills.map((skill) => (
                  <div
                    key={skill.id}
                    className="flex items-center justify-between p-4 bg-white border border-lavender-200 rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-dark mb-1">{skill.name}</p>
                      {getLevelBadge(skill.level)}
                    </div>
                    <button
                      onClick={() => removeSkill(skill.id)}
                      className="text-red-500 hover:text-red-700 ml-4"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Interests Section */}
          <Card>
            <h2 className="text-2xl font-bold text-dark mb-6">Qiziqishlar</h2>

            {/* Add New Interest */}
            <div className="mb-6 p-4 bg-lavender-50 rounded-lg">
              <h3 className="font-semibold text-dark mb-3">Yangi qiziqish qo'shish</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  type="text"
                  value={newInterest.name}
                  onChange={(e) => setNewInterest({ ...newInterest, name: e.target.value })}
                  placeholder="Qiziqish nomi (masalan: Web Development)"
                  className="px-4 py-2 border border-lavender-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
                  onKeyPress={(e) => e.key === 'Enter' && addInterest()}
                />
                <select
                  value={newInterest.category}
                  onChange={(e) => setNewInterest({ ...newInterest, category: e.target.value })}
                  className="px-4 py-2 border border-lavender-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
                >
                  <option value="">Kategoriya tanlang</option>
                  <option value="Technology">Texnologiya</option>
                  <option value="Design">Dizayn</option>
                  <option value="Business">Biznes</option>
                  <option value="Arts">San'at</option>
                  <option value="Sports">Sport</option>
                  <option value="Science">Fan</option>
                  <option value="Other">Boshqa</option>
                </select>
                <Button onClick={addInterest}>Qo'shish</Button>
              </div>
            </div>

            {/* Interests List */}
            {interests.length === 0 ? (
              <div className="text-center py-8 text-dark/60">
                Hali qiziqishlar qo'shilmagan. Yuqorida yangi qiziqish qo'shing.
              </div>
            ) : (
              <div className="flex flex-wrap gap-3">
                {interests.map((interest) => (
                  <div
                    key={interest.id}
                    className="flex items-center gap-2 px-4 py-2 bg-brand-100 text-brand rounded-full hover:bg-brand-200 transition-colors"
                  >
                    <span className="font-medium">{interest.name}</span>
                    {interest.category && (
                      <span className="text-sm text-brand/70">({interest.category})</span>
                    )}
                    <button
                      onClick={() => removeInterest(interest.id)}
                      className="text-brand hover:text-brand-700 ml-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Suggested Skills */}
          <Card>
            <h2 className="text-2xl font-bold text-dark mb-4">Mashhur ko'nikmalar</h2>
            <p className="text-dark/60 mb-4">Tez qo'shish uchun bosing:</p>
            <div className="flex flex-wrap gap-2">
              {[
                'JavaScript',
                'Python',
                'React',
                'Node.js',
                'TypeScript',
                'SQL',
                'Git',
                'HTML/CSS',
                'Adobe Photoshop',
                'Figma',
                'Excel',
                'Communication',
                'Leadership',
                'Problem Solving',
              ].map((skillName) => (
                <button
                  key={skillName}
                  onClick={() => {
                    if (!skills.some((s) => s.name === skillName)) {
                      setNewSkill({ ...newSkill, name: skillName });
                    }
                  }}
                  className="px-3 py-1 bg-gray-100 text-dark/70 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                >
                  + {skillName}
                </button>
              ))}
            </div>
          </Card>
        </div>

        <div className="mt-8 flex items-center justify-end gap-4">
          <Button variant="outline" onClick={() => router.push('/dashboard')}>
            Bekor qilish
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Saqlanmoqda...' : 'Saqlash'}
          </Button>
        </div>
      </div>
    </Container>
  );
}
