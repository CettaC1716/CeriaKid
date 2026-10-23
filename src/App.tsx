import { useState } from 'react';
import { AnimatePresence } from 'motion/react';
import { OnboardingView } from './components/OnboardingView';
import { WelcomeScreen } from './components/WelcomeScreen';
import { KidsRegistrationModal } from './components/KidsRegistrationModal';
import { ChildProfile } from './types';

const PROFILE_STORAGE_KEY = 'cincau_child_profile';

export default function App() {
  const [childProfile, setChildProfile] = useState<ChildProfile | null>(() => {
    try {
      const saved = localStorage.getItem(PROFILE_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return null;
  });
  const [isRegistrationOpen, setIsRegistrationOpen] = useState<boolean>(false);
  const [registrationInitialStep, setRegistrationInitialStep] = useState<number>(0);
  const [hasPassedWelcome, setHasPassedWelcome] = useState<boolean>(false);

  const handlePrepareHome = (profile: ChildProfile) => {
    setChildProfile(profile);
    setHasPassedWelcome(true);
  };

  const handleRegistrationComplete = (profile: ChildProfile) => {
    setChildProfile(profile);
    setHasPassedWelcome(true);
    setIsRegistrationOpen(false);
  };

  const handleEnterAsRegisteredUser = () => {
    let activeProfile = childProfile;
    if (!activeProfile) {
      activeProfile = {
        name: 'Bintang',
        gender: 'boy',
        birthDate: { day: 1, month: 1, year: 2018 },
        fase: 'B',
        favoriteSubject: 'stories',
        learningGoals: ['Cerita Rakyat', 'Berhitung Cepat', 'Melukis'],
        playDuration: '30 Menit',
        stickers: ['stories', 'math', 'drawing'],
        memberId: 'CRK-2026-VIP',
        hasOwnDevice: true,
        voiceInteractionEnabled: true,
        parentEmail: 'orangtua@ceriakids.id',
        isRegistered: true,
        createdAt: new Date().toISOString(),
      };
    }
    try {
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(activeProfile));
      localStorage.setItem('ceria_tutorial_done', 'true');
      localStorage.removeItem('ceria_intro_pending');
    } catch {
      // ignore
    }
    setChildProfile(activeProfile);
    setIsRegistrationOpen(false);
    setHasPassedWelcome(true);
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem(PROFILE_STORAGE_KEY);
      localStorage.removeItem('ceria_tutorial_done');
      localStorage.removeItem('ceria_intro_pending');
    } catch {
      // ignore
    }
    setChildProfile(null);
    setHasPassedWelcome(false);
  };

  return (
    <main className="w-full h-screen h-dvh bg-white flex flex-col items-center justify-start p-0 select-none overflow-hidden">
      <div className="w-full h-full bg-white flex flex-col relative text-neutral-900 overflow-hidden">
        {!hasPassedWelcome ? (
          <WelcomeScreen
            savedProfile={childProfile}
            onStartRegistration={() => {
              setRegistrationInitialStep(0);
              setIsRegistrationOpen(true);
            }}
            onSignInExisting={handleEnterAsRegisteredUser}
            onDirectEnter={handleEnterAsRegisteredUser}
          />
        ) : (
          <OnboardingView
            childProfile={childProfile}
            isRegistrationOpen={isRegistrationOpen}
            onOpenRegistration={() => {
              setRegistrationInitialStep(0);
              setIsRegistrationOpen(true);
            }}
            onLogout={handleLogout}
          />
        )}

        {/* Kids Registration Onboarding Modal & Fullscreen Tree Video Transition */}
        <AnimatePresence>
          {isRegistrationOpen && (
            <KidsRegistrationModal
              isOpen={isRegistrationOpen}
              onClose={() => {
                setIsRegistrationOpen(false);
                if (childProfile) {
                  setHasPassedWelcome(true);
                }
              }}
              onPrepareHome={handlePrepareHome}
              onComplete={handleRegistrationComplete}
              initialProfile={childProfile}
              initialStep={registrationInitialStep}
            />
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}

