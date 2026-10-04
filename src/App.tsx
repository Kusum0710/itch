/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ItchProvider, useItch } from './context/ItchContext';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { HomePage } from './pages/HomePage';
import { DiscoveryModal } from './components/discovery/DiscoveryModal';
import { SlidersPage } from './pages/SlidersPage';
import { RecommendationPage } from './pages/RecommendationPage';
import { ExplorePage } from './pages/ExplorePage';
import { LibraryPage } from './pages/LibraryPage';
import { HistoryPage } from './pages/HistoryPage';
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';
import { MediaDetailModal } from './components/media/MediaDetailModal';

const AppContent: React.FC = () => {
  const { activeView } = useItch();

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans selection:bg-amber-400 selection:text-neutral-950">
      <Header />

      <main className="flex-1 w-full">
        {activeView === 'home' && <HomePage />}
        {activeView === 'discovery' && <DiscoveryModal />}
        {activeView === 'sliders' && <SlidersPage />}
        {activeView === 'recommendations' && <RecommendationPage />}
        {activeView === 'explore' && <ExplorePage />}
        {activeView === 'library' && <LibraryPage />}
        {activeView === 'history' && <HistoryPage />}
        {activeView === 'profile' && <ProfilePage />}
        {activeView === 'settings' && <SettingsPage />}
      </main>

      <Footer />
      <MediaDetailModal />
    </div>
  );
};

export default function App() {
  return (
    <ItchProvider>
      <AppContent />
    </ItchProvider>
  );
}
