import { create } from 'zustand'

interface GMState {
    allowed_players: number;
    current_players: number;
    room_id: string;
    password: string;
    room_name: string;
    setGMState: (allowed_players: number, current_players: number, room_id: string, password: string, room_name: string) => void;
    clearGMState: () => void;
}

export const useGMStore = create<GMState>()((set) => ({
    allowed_players: 0,
    current_players: 0,
    room_id: '',
    password: '',
    room_name: '',
    setGMState: (allowed_players, current_players, room_id, password, room_name) =>{
        set(() => ({
            allowed_players: allowed_players,
            current_players: current_players,
            room_id: room_id,
            password: password,
            room_name: room_name
        }))
    },
    clearGMState: () =>{
        set(() => ({
            allowed_players: 0,
            current_players: 0,
            room_id: '',
            password: '',
            room_name: ''
        }))
    }
}))