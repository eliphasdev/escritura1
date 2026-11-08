import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { MissionsList } from './components/MissionsList';
import { CursiveLineViewer } from './components/CursiveLineViewer';
import { HandwritingCanvas } from './components/HandwritingCanvas';
import { SpaceTimer } from './components/SpaceTimer';
import { RocketProgress } from './components/RocketProgress';
import { VoiceAssistantBar } from './components/VoiceAssistantBar';
import { MissionCompleteModal } from './components/MissionCompleteModal';
import { CustomTextModal } from './components/CustomTextModal';
import { RecordsBoard } from './components/RecordsBoard';
import { FreeCanvasView } from './components/FreeCanvasView';

import { Lesson, SessionResult, LineRecord, UserStats, Badge, CosmicRank } from './types';
import {
  getLessons,
  saveCustomLesson,
  deleteCustomLesson,
  getPersonalBests,
  getLinePersonalBest,
  saveLinePersonalBest,
  getSessions,
  saveSession,
  getUserStats,
  getBadges,
  calculateRank
} from './utils/storage';
import {
  voiceManager,
  speakPhrase,
  setVoiceFeedbackEnabled,
  isVoiceFeedbackEnabled
} from './utils/speechVoice';
import { playClick, playStartBeep, playLineFinish, playRecordFanfare } from './utils/soundEffects';
import { BookOpen, PenTool, ArrowLeft } from 'lucide-react';

export default function App() {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'missions' | 'free-canvas' | 'records' | 'my-texts'>('missions');
  const [isNewTextModalOpen, setIsNewTextModalOpen] = useState(false);

  // Data state
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [personalBests, setPersonalBests] = useState<Record<string, number>>({});
  const [userStats, setUserStats] = useState<UserStats>(getUserStats());
  const [badges, setBadges] = useState<Badge[]>([]);
  const [recentSessions, setRecentSessions] = useState<SessionResult[]>([]);

  // Active Mission State
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [activeMode, setActiveMode] = useState<'notebook' | 'canvas'>('notebook');
  const [activeLineIndex, setActiveLineIndex] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [completedLineTimes, setCompletedLineTimes] = useState<{ [index: number]: number }>({});
  const [sessionLineRecords, setSessionLineRecords] = useState<LineRecord[]>([]);
  const [activeSessionResult, setActiveSessionResult] = useState<SessionResult | null>(null);

  // Voice assistant state
  const [isVoiceListening, setIsVoiceListening] = useState<boolean>(false);
  const [voiceSupported, setVoiceSupported] = useState<boolean>(true);
  const [lastVoiceTranscript, setLastVoiceTranscript] = useState<string>('');
  const [voiceSpeechEnabled, setVoiceSpeechEnabled] = useState<boolean>(true);

  // Refs for state accessible inside voice callbacks
  const activeLessonRef = useRef<Lesson | null>(activeLesson);
  const activeLineIndexRef = useRef<number>(activeLineIndex);
  const isTimerRunningRef = useRef<boolean>(isTimerRunning);

  useEffect(() => {
    activeLessonRef.current = activeLesson;
    activeLineIndexRef.current = activeLineIndex;
    isTimerRunningRef.current = isTimerRunning;
  }, [activeLesson, activeLineIndex, isTimerRunning]);

  // Load storage data on mount
  const refreshStorageData = useCallback(() => {
    setLessons(getLessons());
    setPersonalBests(getPersonalBests());
    setUserStats(getUserStats());
    setBadges(getBadges());
    setRecentSessions(getSessions());
  }, []);

  useEffect(() => {
    refreshStorageData();
    setVoiceSupported(voiceManager.isSupported());
  }, [refreshStorageData]);

  // Voice recognition wiring
  useEffect(() => {
    voiceManager.setHandlers({
      onStart: () => {
        if (!isTimerRunningRef.current && activeLessonRef.current) {
          handleStartLine();
        }
      },
      onFinishLine: () => {
        if (isTimerRunningRef.current && activeLessonRef.current) {
          // Handled via the SpaceTimer finish trigger
          const timerFinishBtn = document.querySelector<HTMLButtonElement>('[data-timer-finish]');
          if (timerFinishBtn) {
            timerFinishBtn.click();
          }
        }
      },
      onPause: () => {
        setIsTimerRunning(false);
      },
      onResume: () => {
        setIsTimerRunning(true);
      },
      onRestartLine: () => {
        setIsTimerRunning(false);
      },
      onTranscript: (text) => {
        setLastVoiceTranscript(text);
      },
      onListeningChange: (listening) => {
        setIsVoiceListening(listening);
      }
    });
  }, []);

  // Handlers for starting and ending a mission
  const handleSelectLesson = (lesson: Lesson, mode: 'notebook' | 'canvas') => {
    setActiveLesson(lesson);
    setActiveMode(mode);
    setActiveLineIndex(0);
    setIsTimerRunning(false);
    setCompletedLineTimes({});
    setSessionLineRecords([]);
    setActiveSessionResult(null);

    // Initial encouraging speech prompt
    if (mode === 'notebook') {
      speakPhrase(`¡Misión iniciada! Toma tu lápiz y cuaderno. Cuando estés listo, di ¡Empezar! o presiona el botón.`, true);
    } else {
      speakPhrase(`¡Misión en pantalla iniciada! Escribe o calca con tu dedo o ratón. Di ¡Empezar! para iniciar el cronómetro.`, true);
    }
  };

  const handleBackToMissions = () => {
    playClick();
    setActiveLesson(null);
    setIsTimerRunning(false);
    refreshStorageData();
  };

  // Start Line
  const handleStartLine = () => {
    setIsTimerRunning(true);
  };

  // Finish Line
  const handleFinishLine = (durationMs: number) => {
    if (!activeLesson) return;

    setIsTimerRunning(false);

    const currentLine = activeLesson.lines[activeLineIndex];
    const prevPB = getLinePersonalBest(activeLesson.id, activeLineIndex);
    const isNewPB = saveLinePersonalBest(activeLesson.id, activeLineIndex, durationMs);

    const record: LineRecord = {
      lineIndex: activeLineIndex,
      text: currentLine,
      startTime: Date.now() - durationMs,
      endTime: Date.now(),
      durationMs: durationMs,
      previousBestMs: prevPB,
      isNewPersonalBest: isNewPB,
    };

    const newTimes = { ...completedLineTimes, [activeLineIndex]: durationMs };
    const newRecords = [...sessionLineRecords, record];

    setCompletedLineTimes(newTimes);
    setSessionLineRecords(newRecords);

    // Check if more lines exist or if mission is finished
    const nextLineIndex = activeLineIndex + 1;

    if (nextLineIndex < activeLesson.lines.length) {
      setActiveLineIndex(nextLineIndex);
      
      // Cheerful voice feedback
      const secondsVal = (durationMs / 1000).toFixed(1);
      if (isNewPB) {
        speakPhrase(`¡Nuevo récord personal! Tardaste ${secondsVal} segundos. ¡A por la siguiente línea!`);
      } else {
        speakPhrase(`¡Línea lista en ${secondsVal} segundos! Siguiente línea preparada.`);
      }
    } else {
      // Entire Mission Completed!
      completeMission(newRecords, newTimes);
    }
  };

  const completeMission = (records: LineRecord[], times: { [index: number]: number }) => {
    if (!activeLesson) return;

    const totalDuration = Object.values(times).reduce((a, b) => a + b, 0);
    const pbsCount = records.filter(r => r.isNewPersonalBest).length;

    // Calculate stars: 3 stars if within target time or has records; 2 stars minimum for completion
    const avgPerLine = totalDuration / records.length;
    let stars = 2;
    if (avgPerLine <= activeLesson.targetTimePerLineSec * 1000 || pbsCount > 0) {
      stars = 3;
    }

    const currentStats = getUserStats();
    const newRank = calculateRank(currentStats.totalStars + stars, currentStats.totalLinesCopied + records.length);

    const result: SessionResult = {
      id: `session-${Date.now()}`,
      lessonId: activeLesson.id,
      lessonTitle: activeLesson.title,
      timestamp: Date.now(),
      mode: activeMode,
      totalDurationMs: totalDuration,
      lineRecords: records,
      personalBestsCount: pbsCount,
      starsEarned: stars,
      rankAchieved: newRank,
    };

    saveSession(result);
    setActiveSessionResult(result);
    refreshStorageData();
  };

  const handleSaveCustomLesson = (newLesson: Lesson) => {
    saveCustomLesson(newLesson);
    refreshStorageData();
    // Launch directly
    handleSelectLesson(newLesson, 'notebook');
  };

  const handleDeleteCustomLesson = (id: string) => {
    deleteCustomLesson(id);
    refreshStorageData();
  };

  const handleToggleVoiceListening = () => {
    if (isVoiceListening) {
      voiceManager.stop();
      setIsVoiceListening(false);
    } else {
      voiceManager.start();
      setIsVoiceListening(true);
    }
  };

  const handleToggleVoiceFeedback = () => {
    const nextVal = !voiceSpeechEnabled;
    setVoiceSpeechEnabled(nextVal);
    setVoiceFeedbackEnabled(nextVal);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-400 selection:text-slate-950">
      
      {/* Top Bar Navigation */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={(tab) => {
          playClick();
          setActiveLesson(null);
          setActiveTab(tab);
        }}
        onOpenNewTextModal={() => {
          playClick();
          setIsNewTextModalOpen(true);
        }}
        userRank={userStats.rank}
        totalStars={userStats.totalStars}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 flex flex-col">
        
        {/* If an active mission is in progress */}
        {activeLesson ? (
          <div className="w-full flex flex-col gap-6 animate-fade-in">
            
            {/* Mission Sub-Header with Back Button & Mode Switcher */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleBackToMissions}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 text-xs font-semibold transition-colors font-child"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Volver a Misiones</span>
                </button>

                <div className="flex items-center gap-2">
                  <h1 className="text-lg sm:text-xl font-extrabold text-white font-child">
                    {activeLesson.title}
                  </h1>
                  <span className="text-xs text-amber-400/90 font-child hidden sm:inline">
                    ({activeLesson.difficulty})
                  </span>
                </div>
              </div>

              {/* Mode switch */}
              <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-xl text-xs font-child">
                <button
                  onClick={() => {
                    playClick();
                    setActiveMode('notebook');
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                    activeMode === 'notebook'
                      ? 'bg-sky-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Cuaderno</span>
                </button>

                <button
                  onClick={() => {
                    playClick();
                    setActiveMode('canvas');
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                    activeMode === 'canvas'
                      ? 'bg-amber-400 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <PenTool className="w-3.5 h-3.5" />
                  <span>Pizarra Digital</span>
                </button>
              </div>
            </div>

            {/* Voice Assistant Bar */}
            <VoiceAssistantBar
              isListening={isVoiceListening}
              isSupported={voiceSupported}
              lastTranscript={lastVoiceTranscript}
              voiceFeedbackEnabled={voiceSpeechEnabled}
              onToggleListening={handleToggleVoiceListening}
              onToggleVoiceFeedback={handleToggleVoiceFeedback}
            />

            {/* Rocket Progress Stations */}
            <RocketProgress
              totalLines={activeLesson.lines.length}
              currentLineIndex={activeLineIndex}
              completedLines={Object.keys(completedLineTimes).length}
            />

            {/* 2-Zone Layout: Left = Line Guideline & Ink Canvas, Right = Stopwatch & Times */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Left Zone: Guideline Cursive Viewer & (Optional) Drawing Canvas */}
              <div className="lg:col-span-7 flex flex-col gap-5">
                <CursiveLineViewer
                  lines={activeLesson.lines}
                  activeLineIndex={activeLineIndex}
                  completedTimes={completedLineTimes}
                  personalBests={activeLesson.lines.reduce((acc, _, idx) => {
                    acc[idx] = getLinePersonalBest(activeLesson.id, idx);
                    return acc;
                  }, {} as { [i: number]: number | undefined })}
                  mode={activeMode}
                />

                {/* If Canvas Mode: Render Digital Drawing Canvas below */}
                {activeMode === 'canvas' && (
                  <div className="mt-2">
                    <HandwritingCanvas
                      guideText={activeLesson.lines[activeLineIndex]}
                    />
                  </div>
                )}
              </div>

              {/* Right Zone: Space Stopwatch & Line Controller */}
              <div className="lg:col-span-5 flex flex-col gap-4">
                <SpaceTimer
                  currentLineIndex={activeLineIndex}
                  totalLines={activeLesson.lines.length}
                  personalBestMs={getLinePersonalBest(activeLesson.id, activeLineIndex)}
                  isRunning={isTimerRunning}
                  onStart={handleStartLine}
                  onFinish={handleFinishLine}
                  onPause={() => setIsTimerRunning(false)}
                  onResume={() => setIsTimerRunning(true)}
                  onRestart={() => setIsTimerRunning(false)}
                />

                {/* Child-friendly helpful guidance */}
                <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-4 text-xs font-child">
                  <h4 className="font-bold text-sky-300 mb-1.5 flex items-center gap-1.5">
                    <span>💡 Consejo de Caligrafía:</span>
                  </h4>
                  <p className="text-slate-300 leading-relaxed">
                    Mantén el lápiz en contacto con el papel de forma continua para unir cada letra sin soltar hasta terminar la palabra. ¡La letra ligada fluye como un río de estrellas!
                  </p>
                </div>
              </div>

            </div>

          </div>
        ) : (
          /* Normal Tab Views (Missions, Free Canvas, Records, My Texts) */
          <div className="w-full flex-1 flex flex-col">
            
            {activeTab === 'missions' && (
              <div className="flex flex-col gap-4">
                <div className="mb-2">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-child">
                    Misiones de Caligrafía Espacial
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-400 font-child">
                    Elige una misión para practicar el copiado con letra ligada, cronometrar tus tiempos y superar tus récords personales.
                  </p>
                </div>

                <MissionsList
                  lessons={lessons}
                  onSelectLesson={handleSelectLesson}
                  onDeleteCustomLesson={handleDeleteCustomLesson}
                  personalBests={personalBests}
                />
              </div>
            )}

            {activeTab === 'free-canvas' && (
              <FreeCanvasView />
            )}

            {activeTab === 'records' && (
              <RecordsBoard
                stats={userStats}
                badges={badges}
                recentSessions={recentSessions}
              />
            )}

            {activeTab === 'my-texts' && (
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-white font-child">
                      Mis Textos Personalizados
                    </h1>
                    <p className="text-xs text-slate-400 font-child">
                      Textos creados por ti o tus padres para practicar caligrafía ligada.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      playClick();
                      setIsNewTextModalOpen(true);
                    }}
                    className="px-4 py-2 rounded-xl bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm shadow-md shadow-amber-400/20 font-child"
                  >
                    + Crear Texto
                  </button>
                </div>

                <MissionsList
                  lessons={lessons.filter(l => l.isCustom)}
                  onSelectLesson={handleSelectLesson}
                  onDeleteCustomLesson={handleDeleteCustomLesson}
                  personalBests={personalBests}
                />
              </div>
            )}

          </div>
        )}

      </main>

      {/* Mission Complete Celebration Modal */}
      {activeSessionResult && (
        <MissionCompleteModal
          session={activeSessionResult}
          onReplay={() => {
            if (activeLesson) {
              handleSelectLesson(activeLesson, activeMode);
            }
          }}
          onNextMission={() => {
            setActiveSessionResult(null);
            setActiveLesson(null);
            setActiveTab('missions');
          }}
          onClose={() => {
            setActiveSessionResult(null);
          }}
        />
      )}

      {/* Custom Text Creator Modal */}
      <CustomTextModal
        isOpen={isNewTextModalOpen}
        onClose={() => setIsNewTextModalOpen(false)}
        onSaveLesson={handleSaveCustomLesson}
      />

    </div>
  );
}
