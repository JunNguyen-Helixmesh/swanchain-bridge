import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface WalletState {
    disconnect: boolean;
}

const initialState: WalletState = {
    disconnect: false,
}

export const walletSlice = createSlice({
    name: 'wallet',
    initialState,
    reducers: {
        disconnectWallet: (state: { disconnect: boolean; }) => {
            state.disconnect = !state.disconnect
        }
    },
})

export const { disconnectWallet } = walletSlice.actions

export default walletSlice.reducer