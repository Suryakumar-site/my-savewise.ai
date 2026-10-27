import React, { useState, useEffect } from 'react';
import { 
  BookOpen, CheckCircle, Award, PlayCircle, HelpCircle, 
  Search, ToggleLeft, ToggleRight, Sparkles, ChevronRight, X
} from 'lucide-react';

export default function LearningCenter({ user, onLessonCompleted }) {
  const [activeTab, setActiveTab] = useState('courses'); // 'courses' or 'glossary'
  const [curriculumData, setCurriculumData] = useState(null);
  const [glossaryTerms, setGlossaryTerms] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [explainNewbieMode, setExplainNewbieMode] = useState(true); // "Explain like I'm new" toggle
  const [activeLessonModal, setActiveLessonModal] = useState(null);
  const [selectedQuizOption, setSelectedQuizOption] = useState(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch curriculum & glossary from API
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const token = localStorage.getItem('savewise_token');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

        const [currRes, glossRes] = await Promise.all([
          fetch('/api/learning/curriculum', { headers }),
          fetch('/api/learning/glossary')
        ]);

        const curr = await currRes.json();
        const gloss = await glossRes.json();

        setCurriculumData(curr);
        setGlossaryTerms(gloss.terms || []);
      } catch (e) {
        console.error('Error fetching learning data:', e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleOpenLesson = (lesson, level) => {
    setActiveLessonModal({ ...lesson, level });
    setSelectedQuizOption(null);
    setQuizSubmitted(false);
  };

  const handleQuizSubmit = async () => {
    if (selectedQuizOption === null) return;
    setQuizSubmitted(true);

    const isCorrect = selectedQuizOption === activeLessonModal.quiz.correct;
    const score = isCorrect ? 100 : 50;

    const token = localStorage.getItem('savewise_token');
    if (token) {
      try {
        await fetch('/api/learning/complete-lesson', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            lessonId: activeLessonModal.id,
            level: activeLessonModal.level,
            quizScore: score,
            lessonTitle: activeLessonModal.title
          })
        });

        // Update local state
        setCurriculumData(prev => {
          if (!prev) return prev;
          let newCompleted = prev.completedCount + 1;
          const updatedCurriculum = prev.curriculum.map(lvl => {
            if (lvl.level === activeLessonModal.level) {
              const updatedLessons = lvl.lessons.map(l => {
                if (l.id === activeLessonModal.id) return { ...l, completed: true, quizScore: score };
                return l;
              });
              return { ...lvl, lessons: updatedLessons, completedLessons: updatedLessons.filter(x => x.completed).length };
            }
            return lvl;
          });
          return {
            ...prev,
            curriculum: updatedCurriculum,
            completedCount: newCompleted,
            progressPercentage: Math.round((newCompleted / prev.totalLessons) * 100)
          };
        });

        if (onLessonCompleted) onLessonCompleted();
      } catch (err) {
        console.error('Failed to record lesson:', err);
      }
    }
  };

  const filteredTerms = glossaryTerms.filter(t => 
    t.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.simple.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.technical.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header & Tabs */}
      <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span className="badge badge-emerald">SaveWise Financial Academy</span>
            {curriculumData && (
              <span className="badge badge-gold">
                Progress: {curriculumData.progressPercentage}%
              </span>
            )}
          </div>
          <h2 style={{ fontSize: '1.75rem' }}>Financial Education & 21+ Term Glossary</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Learn money concepts step-by-step from absolute zero to advanced portfolio principles.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => setActiveTab('courses')}
            className={`btn btn-sm ${activeTab === 'courses' ? 'btn-primary' : 'btn-secondary'}`}
          >
            <BookOpen size={15} />
            <span>Structured Courses (4 Levels)</span>
          </button>

          <button
            onClick={() => setActiveTab('glossary')}
            className={`btn btn-sm ${activeTab === 'glossary' ? 'btn-primary' : 'btn-secondary'}`}
          >
            <Sparkles size={15} />
            <span>21+ Term Glossary</span>
          </button>
        </div>
      </div>

      {/* PROGRESS BAR */}
      {curriculumData && (
        <div className="glass-card" style={{ padding: '1rem 1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
            <span style={{ fontWeight: 600 }}>Your Financial Literacy Progress</span>
            <span style={{ color: 'var(--emerald-400)', fontWeight: 700 }}>
              {curriculumData.completedCount} of {curriculumData.totalLessons} Lessons Completed ({curriculumData.progressPercentage}%)
            </span>
          </div>
          <div style={{ height: '10px', borderRadius: '5px', backgroundColor: 'var(--bg-tertiary)', overflow: 'hidden' }}>
            <div style={{
              width: `${curriculumData.progressPercentage}%`,
              height: '100%',
              backgroundColor: 'var(--emerald-500)',
              transition: 'width 0.4s ease'
            }} />
          </div>
        </div>
      )}

      {/* COURSES TAB */}
      {activeTab === 'courses' && curriculumData && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {curriculumData.curriculum.map(lvl => (
            <div key={lvl.level} className="glass-card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className="badge badge-indigo">Level {lvl.level}</span>
                    <span style={{ fontSize: '0.8125rem', color: 'var(--gold-400)', fontWeight: 600 }}>Badge: {lvl.badge}</span>
                  </div>
                  <h3 style={{ fontSize: '1.35rem', marginTop: '0.25rem' }}>{lvl.title}</h3>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{lvl.description}</p>
                </div>

                <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                  {lvl.completedLessons} / {lvl.lessons.length} Completed
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: '0.75rem' }}>
                {lvl.lessons.map(lesson => (
                  <div
                    key={lesson.id}
                    onClick={() => handleOpenLesson(lesson, lvl.level)}
                    className="glass-card"
                    style={{
                      padding: '1rem 1.25rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      cursor: 'pointer',
                      border: lesson.completed ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid var(--border-color)',
                      background: lesson.completed ? 'rgba(16, 185, 129, 0.05)' : undefined
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      {lesson.completed ? (
                        <CheckCircle size={20} color="var(--emerald-400)" />
                      ) : (
                        <PlayCircle size={20} color="var(--text-muted)" />
                      )}
                      <div>
                        <strong style={{ fontSize: '1rem', display: 'block', color: 'var(--text-primary)' }}>
                          {lesson.title}
                        </strong>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                          Read time: {lesson.duration}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {lesson.completed && (
                        <span className="badge badge-emerald" style={{ fontSize: '0.65rem' }}>
                          Quiz: {lesson.quizScore}%
                        </span>
                      )}
                      <span className="btn btn-secondary btn-sm" style={{ padding: '0.35rem 0.65rem' }}>
                        {lesson.completed ? 'Review' : 'Start'} <ChevronRight size={14} />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* GLOSSARY TAB */}
      {activeTab === 'glossary' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Search & "Explain like I'm new" toggle */}
          <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
            <div style={{ position: 'relative', width: '100%', maxWidth: '380px' }}>
              <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="Search 21+ terms (e.g. SIP, Demat, NAV, KYC)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field"
                style={{ paddingLeft: '2.5rem' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                Explain like I'm new:
              </span>
              <button
                onClick={() => setExplainNewbieMode(!explainNewbieMode)}
                className={`btn btn-sm ${explainNewbieMode ? 'btn-primary' : 'btn-secondary'}`}
              >
                {explainNewbieMode ? 'Simple Analogy ON' : 'Technical View ON'}
              </button>
            </div>
          </div>

          {/* Terms Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: '1rem' }}>
            {filteredTerms.map(term => (
              <div key={term.term} className="glass-card" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <h4 style={{ fontSize: '1.15rem', color: 'var(--text-primary)' }}>{term.term}</h4>
                  <span className="badge badge-emerald" style={{ fontSize: '0.7rem' }}>Verified Definition</span>
                </div>

                {explainNewbieMode ? (
                  <div style={{
                    background: 'rgba(16, 185, 129, 0.08)',
                    border: '1px solid rgba(16, 185, 129, 0.25)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.875rem 1rem',
                    marginBottom: '0.75rem'
                  }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--emerald-400)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Explain Like I'm New:
                    </span>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', marginTop: '0.25rem', lineHeight: 1.5 }}>
                      "{term.simple}"
                    </p>
                  </div>
                ) : (
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.875rem 1rem',
                    marginBottom: '0.75rem'
                  }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Technical SEC / SEBI Definition:
                    </span>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem', lineHeight: 1.5 }}>
                      {term.technical}
                    </p>
                  </div>
                )}

                <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                  <strong style={{ color: 'var(--gold-400)' }}>Real-Life Example:</strong> {term.example}
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* LESSON MODAL */}
      {activeLessonModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 100,
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }}>
          <div className="glass-panel" style={{
            maxWidth: '680px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '2rem',
            background: 'var(--bg-secondary)',
            boxShadow: 'var(--shadow-lg)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <span className="badge badge-indigo">Level {activeLessonModal.level} Lesson</span>
                <h3 style={{ fontSize: '1.4rem', marginTop: '0.25rem' }}>{activeLessonModal.title}</h3>
              </div>
              <button
                onClick={() => setActiveLessonModal(null)}
                className="btn btn-secondary btn-sm"
                style={{ padding: '0.35rem' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Lesson Content */}
            <div style={{ fontSize: '0.9375rem', lineHeight: 1.7, color: 'var(--text-secondary)', whiteSpace: 'pre-line', marginBottom: '1.5rem' }}>
              {activeLessonModal.content}
            </div>

            {/* Interactive Quiz Section */}
            {activeLessonModal.quiz && (
              <div style={{
                background: 'var(--bg-tertiary)',
                borderRadius: 'var(--radius-md)',
                padding: '1.25rem',
                border: '1px solid var(--border-color)',
                marginBottom: '1.5rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: 'var(--emerald-400)', fontWeight: 600 }}>
                  <HelpCircle size={18} />
                  <span>Check Your Understanding</span>
                </div>
                <p style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '1rem' }}>
                  {activeLessonModal.quiz.question}
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                  {activeLessonModal.quiz.options.map((opt, idx) => (
                    <button
                      key={idx}
                      type="button"
                      disabled={quizSubmitted}
                      onClick={() => setSelectedQuizOption(idx)}
                      style={{
                        padding: '0.75rem 1rem',
                        textAlign: 'left',
                        borderRadius: 'var(--radius-sm)',
                        border: selectedQuizOption === idx 
                          ? (quizSubmitted ? (idx === activeLessonModal.quiz.correct ? '2px solid #10b981' : '2px solid #ef4444') : '2px solid var(--emerald-500)')
                          : '1px solid var(--border-color)',
                        backgroundColor: selectedQuizOption === idx 
                          ? (quizSubmitted ? (idx === activeLessonModal.quiz.correct ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)') : 'rgba(16, 185, 129, 0.08)')
                          : 'var(--bg-secondary)',
                        color: 'var(--text-primary)',
                        cursor: quizSubmitted ? 'default' : 'pointer',
                        fontSize: '0.875rem'
                      }}
                    >
                      {opt}
                    </button>
                  ))}
                </div>

                {quizSubmitted && (
                  <div style={{
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: selectedQuizOption === activeLessonModal.quiz.correct ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                    border: `1px solid ${selectedQuizOption === activeLessonModal.quiz.correct ? '#10b981' : '#ef4444'}`,
                    fontSize: '0.875rem',
                    marginBottom: '1rem'
                  }}>
                    <strong>{selectedQuizOption === activeLessonModal.quiz.correct ? '✓ Correct!' : '✗ Not quite:'}</strong> {activeLessonModal.quiz.explanation}
                  </div>
                )}

                {!quizSubmitted ? (
                  <button
                    onClick={handleQuizSubmit}
                    disabled={selectedQuizOption === null}
                    className="btn btn-primary"
                    style={{ width: '100%' }}
                  >
                    Submit Answer & Complete Lesson
                  </button>
                ) : (
                  <button
                    onClick={() => setActiveLessonModal(null)}
                    className="btn btn-secondary"
                    style={{ width: '100%' }}
                  >
                    Close Lesson
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
