import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { FindSkillPage } from './pages/FindSkillPage';
import { BecomeEducatorPage } from './pages/BecomeEducatorPage';
import { HowItWorksPage } from './pages/HowItWorksPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { LearnerDashboard } from './pages/LearnerDashboard';
import { EducatorDashboard } from './pages/EducatorDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { AuthPage } from './pages/AuthPage';
import { EducatorProfileModal } from './components/EducatorProfileModal';
import { BookingModal } from './components/BookingModal';
import { SkillRequestModal } from './components/SkillRequestModal';
import { Educator } from './types';
import { api } from './services/api';

const AppContent: React.FC = () => {
  const [currentView, setCurrentView] = useState<string>('home');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [selectedEducatorForModal, setSelectedEducatorForModal] = useState<Educator | null>(null);
  const [selectedEducatorForBooking, setSelectedEducatorForBooking] = useState<Educator | null>(null);
  const [showSkillRequestModal, setShowSkillRequestModal] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleSelectCategory = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    setCurrentView('find-skill');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewEducator = (educator: Educator) => {
    setSelectedEducatorForModal(educator);
  };

  const handleRequestBooking = (educator: Educator) => {
    setSelectedEducatorForBooking(educator);
  };

  const handleBookingSuccess = () => {
    setSelectedEducatorForBooking(null);
    showToast('Booking request submitted successfully! Funds held safely in escrow.');
    setCurrentView('learner-dashboard');
  };

  const handleSkillRequestSuccess = () => {
    showToast('Custom skill request submitted! Matches computed.');
  };

  const handleSelectEducatorById = async (educatorId: string) => {
    try {
      const edu = await api.getEducatorById(educatorId);
      setSelectedEducatorForModal(edu);
    } catch (e) {
      console.error('Failed to load educator:', e);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col justify-between selection:bg-emerald-100 selection:text-emerald-900">
      {/* Toast Notification Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-700 text-xs font-semibold flex items-center gap-2 animate-bounce">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Navbar */}
      <Navbar
        currentView={currentView}
        setCurrentView={(view) => {
          setCurrentView(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenSkillRequest={() => setShowSkillRequestModal(true)}
        onOpenAuth={() => {
          setCurrentView('auth');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {currentView === 'home' && (
          <HomePage
            setCurrentView={(view) => {
              setCurrentView(view);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenSkillRequest={() => setShowSkillRequestModal(true)}
            onSelectCategory={handleSelectCategory}
            onViewEducator={handleViewEducator}
            onRequestBooking={handleRequestBooking}
          />
        )}

        {currentView === 'find-skill' && (
          <FindSkillPage
            initialCategoryId={selectedCategoryId}
            onViewEducator={handleViewEducator}
            onRequestBooking={handleRequestBooking}
            onOpenSkillRequest={() => setShowSkillRequestModal(true)}
          />
        )}

        {currentView === 'become-educator' && (
          <BecomeEducatorPage
            onApplicationSubmitted={() => {
              showToast('Educator application received in verification queue!');
            }}
            setCurrentView={setCurrentView}
          />
        )}

        {currentView === 'how-it-works' && (
          <HowItWorksPage
            setCurrentView={setCurrentView}
            onOpenSkillRequest={() => setShowSkillRequestModal(true)}
          />
        )}

        {currentView === 'about' && (
          <AboutPage
            setCurrentView={setCurrentView}
            onOpenSkillRequest={() => setShowSkillRequestModal(true)}
          />
        )}

        {currentView === 'contact' && (
          <ContactPage />
        )}

        {currentView === 'learner-dashboard' && (
          <LearnerDashboard
            onOpenSkillRequest={() => setShowSkillRequestModal(true)}
            onViewEducator={handleViewEducator}
          />
        )}

        {currentView === 'educator-dashboard' && (
          <EducatorDashboard
            onViewProfileModal={handleViewEducator}
          />
        )}

        {currentView === 'admin-dashboard' && (
          <AdminDashboard />
        )}

        {currentView === 'auth' && (
          <AuthPage
            onSuccess={(role) => {
              if (role === 'admin') setCurrentView('admin-dashboard');
              else if (role === 'educator') setCurrentView('educator-dashboard');
              else setCurrentView('learner-dashboard');
            }}
          />
        )}
      </main>

      {/* Global Modals */}
      {selectedEducatorForModal && (
        <EducatorProfileModal
          educator={selectedEducatorForModal}
          onClose={() => setSelectedEducatorForModal(null)}
          onRequestBooking={handleRequestBooking}
        />
      )}

      {selectedEducatorForBooking && (
        <BookingModal
          educator={selectedEducatorForBooking}
          onClose={() => setSelectedEducatorForBooking(null)}
          onBookingSuccess={handleBookingSuccess}
        />
      )}

      {showSkillRequestModal && (
        <SkillRequestModal
          onClose={() => setShowSkillRequestModal(false)}
          onRequestCreated={handleSkillRequestSuccess}
          onSelectEducator={handleSelectEducatorById}
        />
      )}

      {/* Main Footer */}
      <Footer setCurrentView={(view) => {
        setCurrentView(view);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }} />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
