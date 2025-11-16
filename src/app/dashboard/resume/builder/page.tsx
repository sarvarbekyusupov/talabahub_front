'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { api } from '@/lib/api';
import { getToken } from '@/lib/auth';
import { useToast } from '@/components/ui/Toast';

interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  current: boolean;
  gpa?: string;
}

interface Experience {
  id: string;
  company: string;
  position: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

interface Project {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  link?: string;
  startDate: string;
  endDate: string;
}

interface ResumeData {
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    location: string;
    website?: string;
    linkedin?: string;
    github?: string;
    summary: string;
  };
  education: Education[];
  experience: Experience[];
  skills: string[];
  projects: Project[];
  languages: Array<{ name: string; proficiency: string }>;
  certifications: Array<{ name: string; issuer: string; date: string }>;
}

export default function ResumeBuilderPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState('personal');
  const [template, setTemplate] = useState('modern');

  const [resumeData, setResumeData] = useState<ResumeData>({
    personalInfo: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      location: '',
      website: '',
      linkedin: '',
      github: '',
      summary: '',
    },
    education: [],
    experience: [],
    skills: [],
    projects: [],
    languages: [],
    certifications: [],
  });

  useEffect(() => {
    loadResumeData();
  }, []);

  const loadResumeData = async () => {
    const token = getToken();
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const profile = await api.getProfile(token) as any;

      // Load existing resume data from profile
      setResumeData({
        personalInfo: {
          firstName: profile.firstName || '',
          lastName: profile.lastName || '',
          email: profile.email || '',
          phone: profile.phone || '',
          location: profile.location || '',
          website: profile.website || '',
          linkedin: profile.linkedin || '',
          github: profile.github || '',
          summary: profile.summary || '',
        },
        education: profile.education || [],
        experience: profile.experience || [],
        skills: profile.skills?.map((s: any) => s.name) || [],
        projects: profile.projects || [],
        languages: profile.languages || [],
        certifications: profile.certifications || [],
      });
    } catch (error) {
      console.error('Error loading resume data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    const token = getToken();
    if (!token) return;

    setSaving(true);
    try {
      await api.updateProfile(token, {
        ...resumeData.personalInfo,
        education: resumeData.education,
        experience: resumeData.experience,
        skills: resumeData.skills,
        projects: resumeData.projects,
        languages: resumeData.languages,
        certifications: resumeData.certifications,
      });

      showToast('Resume saqlandi', 'success');
    } catch (error) {
      console.error('Error saving resume:', error);
      showToast('Resume saqlanmadi', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleExportPDF = () => {
    showToast('PDF eksport funksiyasi tez orada qo\'shiladi', 'info');
    // TODO: Implement PDF export
  };

  const addEducation = () => {
    setResumeData({
      ...resumeData,
      education: [
        ...resumeData.education,
        {
          id: Date.now().toString(),
          institution: '',
          degree: '',
          field: '',
          startDate: '',
          endDate: '',
          current: false,
        },
      ],
    });
  };

  const updateEducation = (id: string, field: string, value: any) => {
    setResumeData({
      ...resumeData,
      education: resumeData.education.map((edu) =>
        edu.id === id ? { ...edu, [field]: value } : edu
      ),
    });
  };

  const removeEducation = (id: string) => {
    setResumeData({
      ...resumeData,
      education: resumeData.education.filter((edu) => edu.id !== id),
    });
  };

  const addExperience = () => {
    setResumeData({
      ...resumeData,
      experience: [
        ...resumeData.experience,
        {
          id: Date.now().toString(),
          company: '',
          position: '',
          location: '',
          startDate: '',
          endDate: '',
          current: false,
          description: '',
        },
      ],
    });
  };

  const updateExperience = (id: string, field: string, value: any) => {
    setResumeData({
      ...resumeData,
      experience: resumeData.experience.map((exp) =>
        exp.id === id ? { ...exp, [field]: value } : exp
      ),
    });
  };

  const removeExperience = (id: string) => {
    setResumeData({
      ...resumeData,
      experience: resumeData.experience.filter((exp) => exp.id !== id),
    });
  };

  const addProject = () => {
    setResumeData({
      ...resumeData,
      projects: [
        ...resumeData.projects,
        {
          id: Date.now().toString(),
          name: '',
          description: '',
          technologies: [],
          link: '',
          startDate: '',
          endDate: '',
        },
      ],
    });
  };

  const updateProject = (id: string, field: string, value: any) => {
    setResumeData({
      ...resumeData,
      projects: resumeData.projects.map((proj) =>
        proj.id === id ? { ...proj, [field]: value } : proj
      ),
    });
  };

  const removeProject = (id: string) => {
    setResumeData({
      ...resumeData,
      projects: resumeData.projects.filter((proj) => proj.id !== id),
    });
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
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Button variant="ghost" onClick={() => router.push('/dashboard')} className="mb-4">
            ← Bosh sahifaga qaytish
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-dark mb-2">Resume Builder</h1>
              <p className="text-lg text-dark/60">
                Professional resume yarating
              </p>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={template}
                onChange={(e) => setTemplate(e.target.value)}
                className="px-4 py-2 border border-lavender-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
              >
                <option value="modern">Modern</option>
                <option value="classic">Classic</option>
                <option value="minimal">Minimal</option>
                <option value="creative">Creative</option>
              </select>
              <Button variant="outline" onClick={handleExportPDF}>
                PDF eksport
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? 'Saqlanmoqda...' : 'Saqlash'}
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar */}
          <div className="col-span-3">
            <Card>
              <h3 className="font-bold text-dark mb-4">Bo'limlar</h3>
              <div className="space-y-2">
                {[
                  { id: 'personal', label: 'Shaxsiy ma\'lumotlar', icon: '👤' },
                  { id: 'summary', label: 'Qisqacha', icon: '📝' },
                  { id: 'education', label: 'Ta\'lim', icon: '🎓' },
                  { id: 'experience', label: 'Ish tajribasi', icon: '💼' },
                  { id: 'skills', label: 'Ko\'nikmalar', icon: '⚡' },
                  { id: 'projects', label: 'Loyihalar', icon: '🚀' },
                  { id: 'languages', label: 'Tillar', icon: '🌐' },
                  { id: 'certifications', label: 'Sertifikatlar', icon: '🏆' },
                ].map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                      activeSection === section.id
                        ? 'bg-brand text-white'
                        : 'hover:bg-lavender-50 text-dark'
                    }`}
                  >
                    <span className="mr-2">{section.icon}</span>
                    {section.label}
                  </button>
                ))}
              </div>
            </Card>
          </div>

          {/* Main Content */}
          <div className="col-span-9">
            <Card>
              {/* Personal Info */}
              {activeSection === 'personal' && (
                <div>
                  <h2 className="text-2xl font-bold text-dark mb-6">Shaxsiy ma'lumotlar</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-dark mb-2">
                        Ism
                      </label>
                      <input
                        type="text"
                        value={resumeData.personalInfo.firstName}
                        onChange={(e) =>
                          setResumeData({
                            ...resumeData,
                            personalInfo: { ...resumeData.personalInfo, firstName: e.target.value },
                          })
                        }
                        className="w-full px-4 py-2 border border-lavender-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-dark mb-2">
                        Familiya
                      </label>
                      <input
                        type="text"
                        value={resumeData.personalInfo.lastName}
                        onChange={(e) =>
                          setResumeData({
                            ...resumeData,
                            personalInfo: { ...resumeData.personalInfo, lastName: e.target.value },
                          })
                        }
                        className="w-full px-4 py-2 border border-lavender-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-dark mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={resumeData.personalInfo.email}
                        onChange={(e) =>
                          setResumeData({
                            ...resumeData,
                            personalInfo: { ...resumeData.personalInfo, email: e.target.value },
                          })
                        }
                        className="w-full px-4 py-2 border border-lavender-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-dark mb-2">
                        Telefon
                      </label>
                      <input
                        type="tel"
                        value={resumeData.personalInfo.phone}
                        onChange={(e) =>
                          setResumeData({
                            ...resumeData,
                            personalInfo: { ...resumeData.personalInfo, phone: e.target.value },
                          })
                        }
                        className="w-full px-4 py-2 border border-lavender-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-dark mb-2">
                        Joylashuv
                      </label>
                      <input
                        type="text"
                        value={resumeData.personalInfo.location}
                        onChange={(e) =>
                          setResumeData({
                            ...resumeData,
                            personalInfo: { ...resumeData.personalInfo, location: e.target.value },
                          })
                        }
                        className="w-full px-4 py-2 border border-lavender-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
                        placeholder="Toshkent, O'zbekiston"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-dark mb-2">
                        Website (ixtiyoriy)
                      </label>
                      <input
                        type="url"
                        value={resumeData.personalInfo.website}
                        onChange={(e) =>
                          setResumeData({
                            ...resumeData,
                            personalInfo: { ...resumeData.personalInfo, website: e.target.value },
                          })
                        }
                        className="w-full px-4 py-2 border border-lavender-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
                        placeholder="https://mywebsite.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-dark mb-2">
                        LinkedIn (ixtiyoriy)
                      </label>
                      <input
                        type="url"
                        value={resumeData.personalInfo.linkedin}
                        onChange={(e) =>
                          setResumeData({
                            ...resumeData,
                            personalInfo: { ...resumeData.personalInfo, linkedin: e.target.value },
                          })
                        }
                        className="w-full px-4 py-2 border border-lavender-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
                        placeholder="https://linkedin.com/in/username"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-dark mb-2">
                        GitHub (ixtiyoriy)
                      </label>
                      <input
                        type="url"
                        value={resumeData.personalInfo.github}
                        onChange={(e) =>
                          setResumeData({
                            ...resumeData,
                            personalInfo: { ...resumeData.personalInfo, github: e.target.value },
                          })
                        }
                        className="w-full px-4 py-2 border border-lavender-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
                        placeholder="https://github.com/username"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Summary */}
              {activeSection === 'summary' && (
                <div>
                  <h2 className="text-2xl font-bold text-dark mb-6">Qisqacha tavsif</h2>
                  <textarea
                    value={resumeData.personalInfo.summary}
                    onChange={(e) =>
                      setResumeData({
                        ...resumeData,
                        personalInfo: { ...resumeData.personalInfo, summary: e.target.value },
                      })
                    }
                    rows={6}
                    className="w-full px-4 py-2 border border-lavender-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
                    placeholder="O'zingiz haqingizda qisqacha yozing. Sizning maqsadlaringiz, kuchli tomonlaringiz va nima qilishni xohlayotganingizni ko'rsating."
                  />
                  <p className="text-sm text-dark/60 mt-2">
                    Maslahat: 3-5 ta gapda o'zingizni tushuntiring
                  </p>
                </div>
              )}

              {/* Education */}
              {activeSection === 'education' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-dark">Ta'lim</h2>
                    <Button onClick={addEducation}>+ Ta'lim qo'shish</Button>
                  </div>

                  {resumeData.education.length === 0 ? (
                    <div className="text-center py-8 text-dark/60">
                      Hali ta'lim ma'lumotlari qo'shilmagan
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {resumeData.education.map((edu) => (
                        <div key={edu.id} className="p-4 bg-lavender-50 rounded-lg">
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                              <label className="block text-sm font-semibold text-dark mb-2">
                                O'quv muassasasi
                              </label>
                              <input
                                type="text"
                                value={edu.institution}
                                onChange={(e) =>
                                  updateEducation(edu.id, 'institution', e.target.value)
                                }
                                className="w-full px-4 py-2 border border-lavender-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
                                placeholder="Universitet nomi"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-semibold text-dark mb-2">
                                Daraja
                              </label>
                              <input
                                type="text"
                                value={edu.degree}
                                onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                                className="w-full px-4 py-2 border border-lavender-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
                                placeholder="Bakalavr, Magistr..."
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-semibold text-dark mb-2">
                                Mutaxassislik
                              </label>
                              <input
                                type="text"
                                value={edu.field}
                                onChange={(e) => updateEducation(edu.id, 'field', e.target.value)}
                                className="w-full px-4 py-2 border border-lavender-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
                                placeholder="Computer Science"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-semibold text-dark mb-2">
                                GPA (ixtiyoriy)
                              </label>
                              <input
                                type="text"
                                value={edu.gpa}
                                onChange={(e) => updateEducation(edu.id, 'gpa', e.target.value)}
                                className="w-full px-4 py-2 border border-lavender-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
                                placeholder="3.8/4.0"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-semibold text-dark mb-2">
                                Boshlanish
                              </label>
                              <input
                                type="month"
                                value={edu.startDate}
                                onChange={(e) =>
                                  updateEducation(edu.id, 'startDate', e.target.value)
                                }
                                className="w-full px-4 py-2 border border-lavender-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-semibold text-dark mb-2">
                                Tugash
                              </label>
                              <input
                                type="month"
                                value={edu.endDate}
                                onChange={(e) =>
                                  updateEducation(edu.id, 'endDate', e.target.value)
                                }
                                disabled={edu.current}
                                className="w-full px-4 py-2 border border-lavender-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand disabled:bg-gray-100"
                              />
                              <label className="flex items-center mt-2">
                                <input
                                  type="checkbox"
                                  checked={edu.current}
                                  onChange={(e) =>
                                    updateEducation(edu.id, 'current', e.target.checked)
                                  }
                                  className="mr-2"
                                />
                                <span className="text-sm text-dark/70">Hozir o'qiyapman</span>
                              </label>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeEducation(edu.id)}
                          >
                            O'chirish
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Experience */}
              {activeSection === 'experience' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-dark">Ish tajribasi</h2>
                    <Button onClick={addExperience}>+ Tajriba qo'shish</Button>
                  </div>

                  {resumeData.experience.length === 0 ? (
                    <div className="text-center py-8 text-dark/60">
                      Hali ish tajribasi qo'shilmagan
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {resumeData.experience.map((exp) => (
                        <div key={exp.id} className="p-4 bg-lavender-50 rounded-lg">
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                              <label className="block text-sm font-semibold text-dark mb-2">
                                Kompaniya
                              </label>
                              <input
                                type="text"
                                value={exp.company}
                                onChange={(e) =>
                                  updateExperience(exp.id, 'company', e.target.value)
                                }
                                className="w-full px-4 py-2 border border-lavender-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
                                placeholder="Kompaniya nomi"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-semibold text-dark mb-2">
                                Lavozim
                              </label>
                              <input
                                type="text"
                                value={exp.position}
                                onChange={(e) =>
                                  updateExperience(exp.id, 'position', e.target.value)
                                }
                                className="w-full px-4 py-2 border border-lavender-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
                                placeholder="Software Engineer"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-semibold text-dark mb-2">
                                Joylashuv
                              </label>
                              <input
                                type="text"
                                value={exp.location}
                                onChange={(e) =>
                                  updateExperience(exp.id, 'location', e.target.value)
                                }
                                className="w-full px-4 py-2 border border-lavender-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
                                placeholder="Toshkent"
                              />
                            </div>
                            <div className="col-span-2 grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-semibold text-dark mb-2">
                                  Boshlanish
                                </label>
                                <input
                                  type="month"
                                  value={exp.startDate}
                                  onChange={(e) =>
                                    updateExperience(exp.id, 'startDate', e.target.value)
                                  }
                                  className="w-full px-4 py-2 border border-lavender-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-semibold text-dark mb-2">
                                  Tugash
                                </label>
                                <input
                                  type="month"
                                  value={exp.endDate}
                                  onChange={(e) =>
                                    updateExperience(exp.id, 'endDate', e.target.value)
                                  }
                                  disabled={exp.current}
                                  className="w-full px-4 py-2 border border-lavender-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand disabled:bg-gray-100"
                                />
                                <label className="flex items-center mt-2">
                                  <input
                                    type="checkbox"
                                    checked={exp.current}
                                    onChange={(e) =>
                                      updateExperience(exp.id, 'current', e.target.checked)
                                    }
                                    className="mr-2"
                                  />
                                  <span className="text-sm text-dark/70">Hozir ishlayman</span>
                                </label>
                              </div>
                            </div>
                          </div>
                          <div className="mb-4">
                            <label className="block text-sm font-semibold text-dark mb-2">
                              Vazifalar va yutuqlar
                            </label>
                            <textarea
                              value={exp.description}
                              onChange={(e) =>
                                updateExperience(exp.id, 'description', e.target.value)
                              }
                              rows={4}
                              className="w-full px-4 py-2 border border-lavender-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
                              placeholder="• Loyihalarni boshqarish&#10;• Jamoada ishlash&#10;• Texnologiyalardan foydalanish"
                            />
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeExperience(exp.id)}
                          >
                            O'chirish
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Skills */}
              {activeSection === 'skills' && (
                <div>
                  <h2 className="text-2xl font-bold text-dark mb-6">Ko'nikmalar</h2>
                  <div className="mb-4">
                    <input
                      type="text"
                      placeholder="Ko'nikma yozing va Enter bosing"
                      className="w-full px-4 py-2 border border-lavender-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          const value = e.currentTarget.value.trim();
                          if (value && !resumeData.skills.includes(value)) {
                            setResumeData({
                              ...resumeData,
                              skills: [...resumeData.skills, value],
                            });
                            e.currentTarget.value = '';
                          }
                        }
                      }}
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {resumeData.skills.map((skill, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 px-3 py-1 bg-brand-100 text-brand rounded-full"
                      >
                        <span>{skill}</span>
                        <button
                          onClick={() =>
                            setResumeData({
                              ...resumeData,
                              skills: resumeData.skills.filter((_, i) => i !== index),
                            })
                          }
                          className="text-brand hover:text-brand-700"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Projects */}
              {activeSection === 'projects' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-dark">Loyihalar</h2>
                    <Button onClick={addProject}>+ Loyiha qo'shish</Button>
                  </div>

                  {resumeData.projects.length === 0 ? (
                    <div className="text-center py-8 text-dark/60">
                      Hali loyihalar qo'shilmagan
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {resumeData.projects.map((project) => (
                        <div key={project.id} className="p-4 bg-lavender-50 rounded-lg">
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                              <label className="block text-sm font-semibold text-dark mb-2">
                                Loyiha nomi
                              </label>
                              <input
                                type="text"
                                value={project.name}
                                onChange={(e) => updateProject(project.id, 'name', e.target.value)}
                                className="w-full px-4 py-2 border border-lavender-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-semibold text-dark mb-2">
                                Havola (ixtiyoriy)
                              </label>
                              <input
                                type="url"
                                value={project.link}
                                onChange={(e) => updateProject(project.id, 'link', e.target.value)}
                                className="w-full px-4 py-2 border border-lavender-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
                              />
                            </div>
                          </div>
                          <div className="mb-4">
                            <label className="block text-sm font-semibold text-dark mb-2">
                              Tavsif
                            </label>
                            <textarea
                              value={project.description}
                              onChange={(e) =>
                                updateProject(project.id, 'description', e.target.value)
                              }
                              rows={3}
                              className="w-full px-4 py-2 border border-lavender-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
                            />
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeProject(project.id)}
                          >
                            O'chirish
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </Container>
  );
}
