import { create } from 'zustand';

const useUIStore = create((set) => ({
  sidebarOpen: true,
  activeModal: null,

  toggleSidebar: () => set((state) => ({ 
    sidebarOpen: !state.sidebarOpen 
  })),

  openModal: (name) => set({ activeModal: name }),
  
  closeModal: () => set({ activeModal: null }),
}));

export default useUIStore;
