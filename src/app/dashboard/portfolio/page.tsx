'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { api } from '@/lib/api';
import { getToken } from '@/lib/auth';
import { useToast } from '@/components/ui/Toast';

interface PortfolioProject {
  id: string;
  title: string;
  description: string;
  category: string;
  images: string[];
  videoUrl?: string;
  liveUrl?: string;
  githubUrl?: string;
  technologies: string[];
  startDate: string;
  endDate?: string;
  featured: boolean;
  achievements?: string[];
}

export default function PortfolioPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [projects, setProjects] = useState<PortfolioProject[]>([]);
  const [editingProject, setEditingProject] = useState<PortfolioProject | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadPortfolio();
  }, []);

  const loadPortfolio = async () => {
    const token = getToken();
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const profile = await api.getProfile(token) as any;
      setProjects(profile.portfolio || []);
    } catch (error) {
      console.error('Error loading portfolio:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (project: PortfolioProject) => {
    const token = getToken();
    if (!token) return;

    setSaving(true);
    try {
      let updatedProjects;
      if (project.id) {
        // Update existing
        updatedProjects = projects.map((p) => (p.id === project.id ? project : p));
      } else {
        // Add new
        updatedProjects = [...projects, { ...project, id: Date.now().toString() }];
      }

      await api.updateProfile(token, { portfolio: updatedProjects });
      setProjects(updatedProjects);
      setShowModal(false);
      setEditingProject(null);
      showToast('Portfolio saqlandi', 'success');
    } catch (error) {
      console.error('Error saving portfolio:', error);
      showToast('Xatolik yuz berdi', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Ushbu loyihani o\'chirishni xohlaysizmi?')) return;

    const token = getToken();
    if (!token) return;

    try {
      const updatedProjects = projects.filter((p) => p.id !== id);
      await api.updateProfile(token, { portfolio: updatedProjects });
      setProjects(updatedProjects);
      showToast('Loyiha o\'chirildi', 'success');
    } catch (error) {
      console.error('Error deleting project:', error);
      showToast('Xatolik yuz berdi', 'error');
    }
  };

  const openModal = (project?: PortfolioProject) => {
    if (project) {
      setEditingProject(project);
    } else {
      setEditingProject({
        id: '',
        title: '',
        description: '',
        category: 'Web Development',
        images: [],
        technologies: [],
        startDate: '',
        featured: false,
      });
    }
    setShowModal(true);
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
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <Button variant="ghost" onClick={() => router.push('/dashboard')} className="mb-4">
            ← Bosh sahifaga qaytish
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-dark mb-2">Mening portfolio</h1>
              <p className="text-lg text-dark/60">
                O'z loyihalaringiz va ishlaringizni namoyish qiling
              </p>
            </div>
            <Button onClick={() => openModal()}>+ Yangi loyiha</Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-brand to-brand-700 text-white">
            <p className="text-white/80 text-sm mb-1">Jami loyihalar</p>
            <h3 className="text-3xl font-bold">{projects.length}</h3>
          </Card>
          <Card className="bg-gradient-to-br from-green-500 to-green-700 text-white">
            <p className="text-white/80 text-sm mb-1">Tanlangan</p>
            <h3 className="text-3xl font-bold">
              {projects.filter((p) => p.featured).length}
            </h3>
          </Card>
          <Card className="bg-gradient-to-br from-blue-500 to-blue-700 text-white">
            <p className="text-white/80 text-sm mb-1">Kategoriyalar</p>
            <h3 className="text-3xl font-bold">
              {new Set(projects.map((p) => p.category)).size}
            </h3>
          </Card>
          <Card className="bg-gradient-to-br from-purple-500 to-purple-700 text-white">
            <p className="text-white/80 text-sm mb-1">Texnologiyalar</p>
            <h3 className="text-3xl font-bold">
              {new Set(projects.flatMap((p) => p.technologies)).size}
            </h3>
          </Card>
        </div>

        {/* Projects Grid */}
        {projects.length === 0 ? (
          <Card className="text-center py-12">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-lavender-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-12 h-12 text-brand"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-dark mb-3">Portfolio bo'sh</h2>
              <p className="text-dark/60 mb-6">
                Birinchi loyihangizni qo'shing va professional portfolio yarating
              </p>
              <Button onClick={() => openModal()}>Loyiha qo'shish</Button>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Card
                key={project.id}
                className="overflow-hidden hover:shadow-card-hover transition-shadow"
              >
                {project.featured && (
                  <div className="bg-gradient-to-r from-accent to-accent-600 text-white px-3 py-1 text-xs font-semibold">
                    ⭐ Tanlangan
                  </div>
                )}
                {project.images.length > 0 && (
                  <div className="relative w-full h-48">
                    <Image
                      src={project.images[0]}
                      alt={project.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-xl font-bold text-dark">{project.title}</h3>
                    <Badge variant="primary">{project.category}</Badge>
                  </div>
                  <p className="text-dark/70 mb-4 line-clamp-3">{project.description}</p>

                  <div className="flex flex-wrap gap-1 mb-4">
                    {project.technologies.slice(0, 3).map((tech, index) => (
                      <Badge key={index} variant="info" size="sm">
                        {tech}
                      </Badge>
                    ))}
                    {project.technologies.length > 3 && (
                      <Badge variant="info" size="sm">
                        +{project.technologies.length - 3}
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mb-4">
                    {project.liveUrl && (
                      <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-brand hover:underline text-sm"
                      >
                        🔗 Live Demo
                      </a>
                    )}
                    {project.githubUrl && (
                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-dark/70 hover:underline text-sm"
                      >
                        📁 GitHub
                      </a>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => openModal(project)}>
                      Tahrirlash
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(project.id)}
                    >
                      O'chirish
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Modal */}
        {showModal && editingProject && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6">
              <h2 className="text-2xl font-bold text-dark mb-6">
                {editingProject.id ? 'Loyihani tahrirlash' : 'Yangi loyiha'}
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-dark mb-2">
                    Loyiha nomi
                  </label>
                  <input
                    type="text"
                    value={editingProject.title}
                    onChange={(e) =>
                      setEditingProject({ ...editingProject, title: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-lavender-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-dark mb-2">
                    Kategoriya
                  </label>
                  <select
                    value={editingProject.category}
                    onChange={(e) =>
                      setEditingProject({ ...editingProject, category: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-lavender-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
                  >
                    <option value="Web Development">Web Development</option>
                    <option value="Mobile App">Mobile App</option>
                    <option value="Desktop App">Desktop App</option>
                    <option value="UI/UX Design">UI/UX Design</option>
                    <option value="Data Science">Data Science</option>
                    <option value="Game Development">Game Development</option>
                    <option value="Other">Boshqa</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-dark mb-2">Tavsif</label>
                  <textarea
                    value={editingProject.description}
                    onChange={(e) =>
                      setEditingProject({ ...editingProject, description: e.target.value })
                    }
                    rows={4}
                    className="w-full px-4 py-2 border border-lavender-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-dark mb-2">
                      Live Demo URL
                    </label>
                    <input
                      type="url"
                      value={editingProject.liveUrl}
                      onChange={(e) =>
                        setEditingProject({ ...editingProject, liveUrl: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-lavender-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
                      placeholder="https://example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-dark mb-2">
                      GitHub URL
                    </label>
                    <input
                      type="url"
                      value={editingProject.githubUrl}
                      onChange={(e) =>
                        setEditingProject({ ...editingProject, githubUrl: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-lavender-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
                      placeholder="https://github.com/user/repo"
                    />
                  </div>
                </div>

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={editingProject.featured}
                      onChange={(e) =>
                        setEditingProject({ ...editingProject, featured: e.target.checked })
                      }
                      className="mr-2"
                    />
                    <span className="text-sm font-semibold text-dark">
                      Tanlangan loyiha sifatida belgilash
                    </span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowModal(false);
                    setEditingProject(null);
                  }}
                >
                  Bekor qilish
                </Button>
                <Button onClick={() => handleSave(editingProject)} disabled={saving}>
                  {saving ? 'Saqlanmoqda...' : 'Saqlash'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Container>
  );
}
