import { create } from 'zustand'

type state = {
    [key: string]: any
}

interface GameState {
    game_values: state;
    setGameValue: (key: string, value: any, state: state) => void;
}

export const useGameStore = create<GameState>()((set) => ({
    game_values: {},
    setGameValue: (_key, _value, _state) =>{
        set(() => ({
            game_values: {
                ... _state,
                _key: _value
            }
        }))
    }
}))