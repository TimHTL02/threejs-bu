import { create } from 'zustand'

type Account = {
    user_id: string;
    username: string;
    email: string;
}

interface AccountState {
    account: Account;
    setAccount: (account: Account) => void;
}

export const useAccountStore = create<AccountState>()((set) => ({
    account: {user_id: '', username: '', email: ''},
    setAccount: (_account) =>{
        set(() => ({
            account: _account
        }))
    }
}))