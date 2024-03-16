import { create } from 'zustand'

interface TransitionState {
    fade: boolean;
    navigate: string;
    setFading: (fade: boolean, navigate: string) => void;
}

export const useTransitionStore = create<TransitionState>()((set) => ({
    fade: false,
    navigate: '',
    setFading: (_fade, _navigate) =>{
        set(() => ({
            fade: _fade,
            navigate: _navigate
        }))
    }
}))