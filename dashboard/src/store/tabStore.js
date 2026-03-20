import { create } from 'zustand';

const useTabStore = create((set) => ({
  openTabs: [],
  graveyard: [],
  sessions: [],
  loading: false,

  setOpenTabs: (tabs) => set({ openTabs: tabs }),
  
  addTab: (tab) => set((state) => ({ 
    openTabs: [tab, ...state.openTabs] 
  })),

  updateTab: (id, data) => set((state) => ({
    openTabs: state.openTabs.map((tab) => 
      tab._id === id ? { ...tab, ...data } : tab
    )
  })),

  removeTab: (id) => set((state) => ({
    openTabs: state.openTabs.filter((tab) => tab._id !== id)
  })),

  setGraveyard: (tabs) => set({ graveyard: tabs }),
  
  setSessions: (sessions) => set({ sessions }),
  
  addSession: (session) => set((state) => ({
    sessions: [session, ...state.sessions]
  })),

  setLoading: (loading) => set({ loading }),
}));

export default useTabStore;

