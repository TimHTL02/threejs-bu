import { create } from 'zustand'

type Account = {
    user_id: string;
    username: string;
    email: string;
}

interface AccountState {
    skin: string;
    is_host: boolean;
    account: Account;
    setAccount: (account: Account) => void;
    setHost: (host: boolean) => void;
    setSkin: (skin: string) => void;
}

export const useAccountStore = create<AccountState>()((set) => ({
    skin: '',
    is_host: false,
    account: {user_id: '', username: '', email: ''},
    setAccount: (_account) =>{
        set(() => ({
            account: _account
        }))
    },
    setHost: (_host) =>{
        set(() => ({
            is_host: _host
        }))
    },
    setSkin(skin) {
        set(() => ({
            skin: skin
        }))   
    }
}))