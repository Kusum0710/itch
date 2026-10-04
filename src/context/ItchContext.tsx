import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  CurrentItchProfile,
  MediaItem,
  MediaType,
  RecommendationSession,
  ScoredMediaItem,
  UserTasteProfile,
  ConversationTurn,
} from '../types';
import { INITIAL_ITCH_PROFILE } from '../services/ai/discoveryQuestions';
import { rankClientSide, interpretNoButFeedback } from '../services/apiClient';
import { MOCK_CATALOG } from '../data/mockCatalog';

export type AppView =
  | 'home'
  | 'discovery'
  | 'sliders'
  | 'recommendations'
  | 'explore'
  | 'library'
  | 'history'
  | 'profile'
  | 'settings';

interface LibraryState {
  saved: MediaItem[];
  finished: MediaItem[];
  dropped: MediaItem[];
}

interface ItchContextType {
  activeView: AppView;
  setActiveView: (view: AppView) => void;
  currentItch: CurrentItchProfile;
  updateItchDimension: (key: keyof CurrentItchProfile, val: number | string | MediaType[]) => void;
  updateItchProfile: (delta: Partial<CurrentItchProfile>) => void;
  resetItchProfile: () => void;
  userTaste: UserTasteProfile;
  updateTasteDislike: (tag: string) => void;
  updateTasteLike: (tag: string) => void;
  recommendations: {
    bestMatch: ScoredMediaItem;
    backup: ScoredMediaItem;
    wildcard: ScoredMediaItem;
  } | null;
  refreshRecommendations: () => void;
  currentSession: RecommendationSession | null;
  addConversationTurn: (turn: ConversationTurn) => void;
  applyFeedback: (feedbackText: string) => Promise<string>;
  library: LibraryState;
  saveToLibrary: (media: MediaItem, category: 'saved' | 'finished' | 'dropped') => void;
  removeFromLibrary: (mediaId: string) => void;
  isMediaSaved: (mediaId: string) => boolean;
  historySessions: RecommendationSession[];
  loadHistorySession: (session: RecommendationSession) => void;
  selectedMediaDetail: MediaItem | null;
  setSelectedMediaDetail: (media: MediaItem | null) => void;
  startDiscovery: () => void;
}

const DEFAULT_TASTE: UserTasteProfile = {
  id: 'user_default',
  likes: ['unpredictable plot', 'rich atmosphere', 'strong character dynamic', 'philosophical questions'],
  dislikes: ['filler episodes', 'unearned melodrama', 'generic power fantasy'],
  favorite_media_types: ['anime', 'manga', 'book', 'game'],
  pace_bias: 'any',
  cognitive_bias: 'any',
  interaction_history: {
    liked: ['anime-1', 'game-1'],
    disliked: [],
    finished: ['anime-1', 'book-1'],
    dropped: [],
    saved: ['anime-2', 'game-2'],
    feedback_notes: [],
  },
};

const ItchContext = createContext<ItchContextType | undefined>(undefined);

export const ItchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeView, setActiveView] = useState<AppView>('home');
  const [currentItch, setCurrentItch] = useState<CurrentItchProfile>(INITIAL_ITCH_PROFILE);
  const [userTaste, setUserTaste] = useState<UserTasteProfile>(() => {
    try {
      const saved = localStorage.getItem('itch_user_taste');
      return saved ? JSON.parse(saved) : DEFAULT_TASTE;
    } catch {
      return DEFAULT_TASTE;
    }
  });

  const [library, setLibrary] = useState<LibraryState>(() => {
    try {
      const saved = localStorage.getItem('itch_library');
      if (saved) return JSON.parse(saved);
    } catch {}
    // Seed default library
    return {
      saved: [MOCK_CATALOG[1], MOCK_CATALOG[7]], // Frieren, Project Hail Mary
      finished: [MOCK_CATALOG[0], MOCK_CATALOG[5]], // Edgerunners, Murderbot
      dropped: [],
    };
  });

  const [historySessions, setHistorySessions] = useState<RecommendationSession[]>(() => {
    try {
      const saved = localStorage.getItem('itch_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [currentSession, setCurrentSession] = useState<RecommendationSession | null>(null);
  const [recommendations, setRecommendations] = useState<{
    bestMatch: ScoredMediaItem;
    backup: ScoredMediaItem;
    wildcard: ScoredMediaItem;
  } | null>(null);

  const [selectedMediaDetail, setSelectedMediaDetail] = useState<MediaItem | null>(null);

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem('itch_user_taste', JSON.stringify(userTaste));
    } catch {}
  }, [userTaste]);

  useEffect(() => {
    try {
      localStorage.setItem('itch_library', JSON.stringify(library));
    } catch {}
  }, [library]);

  useEffect(() => {
    try {
      localStorage.setItem('itch_history', JSON.stringify(historySessions));
    } catch {}
  }, [historySessions]);

  const updateItchDimension = (key: keyof CurrentItchProfile, val: any) => {
    setCurrentItch((prev) => ({
      ...prev,
      [key]: val,
    }));
  };

  const updateItchProfile = (delta: Partial<CurrentItchProfile>) => {
    setCurrentItch((prev) => ({
      ...prev,
      ...delta,
    }));
  };

  const resetItchProfile = () => {
    setCurrentItch(INITIAL_ITCH_PROFILE);
  };

  const refreshRecommendations = () => {
    const res = rankClientSide(currentItch, userTaste, MOCK_CATALOG);
    const recs = {
      bestMatch: res.bestMatch,
      backup: res.backup,
      wildcard: res.wildcard,
    };
    setRecommendations(recs);

    // Update current session recommendations
    if (currentSession) {
      const updatedSession: RecommendationSession = {
        ...currentSession,
        itch_profile: currentItch,
        recommendations: recs,
      };
      setCurrentSession(updatedSession);

      // Save to history sessions
      setHistorySessions((prev) => {
        const filtered = prev.filter((s) => s.id !== updatedSession.id);
        return [updatedSession, ...filtered].slice(0, 20);
      });
    }
  };

  // Re-rank whenever currentItch updates if we are in recommendations or sliders
  useEffect(() => {
    if (activeView === 'recommendations' || activeView === 'sliders') {
      const res = rankClientSide(currentItch, userTaste, MOCK_CATALOG);
      setRecommendations({
        bestMatch: res.bestMatch,
        backup: res.backup,
        wildcard: res.wildcard,
      });
    }
  }, [currentItch, userTaste, activeView]);

  const startDiscovery = () => {
    const ranked = rankClientSide(currentItch, userTaste, MOCK_CATALOG);
    const newSession: RecommendationSession = {
      id: 'session_' + Date.now(),
      created_at: Date.now(),
      itch_profile: currentItch,
      turns: [],
      recommendations: {
        bestMatch: ranked.bestMatch,
        backup: ranked.backup,
        wildcard: ranked.wildcard,
      },
      status: 'active',
    };
    setCurrentSession(newSession);
    setActiveView('discovery');
  };

  const addConversationTurn = (turn: ConversationTurn) => {
    if (!currentSession) return;
    const updatedTurns = [...currentSession.turns, turn];
    const updatedSession = { ...currentSession, turns: updatedTurns };
    setCurrentSession(updatedSession);
  };

  const applyFeedback = async (feedbackText: string): Promise<string> => {
    const currentTitle = recommendations?.bestMatch?.media?.title || 'current title';
    const analysis = await interpretNoButFeedback(feedbackText, currentItch, currentTitle);

    // Apply slider deltas
    const newProfile: CurrentItchProfile = { ...currentItch };
    if (analysis.slider_delta) {
      for (const [k, d] of Object.entries(analysis.slider_delta)) {
        const key = k as keyof CurrentItchProfile;
        if (typeof newProfile[key] === 'number' && typeof d === 'number') {
          (newProfile[key] as number) = Math.min(10, Math.max(1, (newProfile[key] as number) + d));
        }
      }
    }

    setCurrentItch(newProfile);

    // Record interaction in userTaste long-term feedback
    if (recommendations?.bestMatch?.media) {
      const mediaId = recommendations.bestMatch.media.id;
      setUserTaste((prev) => ({
        ...prev,
        interaction_history: {
          ...prev.interaction_history,
          feedback_notes: [
            {
              mediaId,
              mediaTitle: currentTitle,
              type: 'no_but',
              note: feedbackText,
              inferredAdjustment: analysis.slider_delta,
              timestamp: Date.now(),
            },
            ...prev.interaction_history.feedback_notes,
          ],
        },
      }));
    }

    // Recalculate recommendations
    const freshRecs = rankClientSide(newProfile, userTaste, MOCK_CATALOG);
    setRecommendations(freshRecs);

    return analysis.summary;
  };

  const saveToLibrary = (media: MediaItem, category: 'saved' | 'finished' | 'dropped') => {
    setLibrary((prev) => {
      // Remove from other lists first to avoid duplication
      const saved = prev.saved.filter((m) => m.id !== media.id);
      const finished = prev.finished.filter((m) => m.id !== media.id);
      const dropped = prev.dropped.filter((m) => m.id !== media.id);

      if (category === 'saved') saved.unshift(media);
      if (category === 'finished') finished.unshift(media);
      if (category === 'dropped') dropped.unshift(media);

      return { saved, finished, dropped };
    });

    // Update taste profile
    setUserTaste((prev) => {
      const liked = category === 'finished' ? [...prev.interaction_history.liked, media.id] : prev.interaction_history.liked;
      const dropped = category === 'dropped' ? [...prev.interaction_history.dropped, media.id] : prev.interaction_history.dropped;
      const savedList = category === 'saved' ? [...prev.interaction_history.saved, media.id] : prev.interaction_history.saved;
      return {
        ...prev,
        interaction_history: {
          ...prev.interaction_history,
          liked: Array.from(new Set(liked)),
          dropped: Array.from(new Set(dropped)),
          saved: Array.from(new Set(savedList)),
        },
      };
    });
  };

  const removeFromLibrary = (mediaId: string) => {
    setLibrary((prev) => ({
      saved: prev.saved.filter((m) => m.id !== mediaId),
      finished: prev.finished.filter((m) => m.id !== mediaId),
      dropped: prev.dropped.filter((m) => m.id !== mediaId),
    }));
  };

  const isMediaSaved = (mediaId: string) => {
    return (
      library.saved.some((m) => m.id === mediaId) ||
      library.finished.some((m) => m.id === mediaId)
    );
  };

  const updateTasteLike = (tag: string) => {
    setUserTaste((prev) => ({
      ...prev,
      likes: prev.likes.includes(tag) ? prev.likes.filter((t) => t !== tag) : [...prev.likes, tag],
    }));
  };

  const updateTasteDislike = (tag: string) => {
    setUserTaste((prev) => ({
      ...prev,
      dislikes: prev.dislikes.includes(tag) ? prev.dislikes.filter((t) => t !== tag) : [...prev.dislikes, tag],
    }));
  };

  const loadHistorySession = (session: RecommendationSession) => {
    setCurrentSession(session);
    setCurrentItch(session.itch_profile);
    setRecommendations(session.recommendations);
    setActiveView('recommendations');
  };

  return (
    <ItchContext.Provider
      value={{
        activeView,
        setActiveView,
        currentItch,
        updateItchDimension,
        updateItchProfile,
        resetItchProfile,
        userTaste,
        updateTasteDislike,
        updateTasteLike,
        recommendations,
        refreshRecommendations,
        currentSession,
        addConversationTurn,
        applyFeedback,
        library,
        saveToLibrary,
        removeFromLibrary,
        isMediaSaved,
        historySessions,
        loadHistorySession,
        selectedMediaDetail,
        setSelectedMediaDetail,
        startDiscovery,
      }}
    >
      {children}
    </ItchContext.Provider>
  );
};

export const useItch = () => {
  const context = useContext(ItchContext);
  if (!context) {
    throw new Error('useItch must be used within an ItchProvider');
  }
  return context;
};
