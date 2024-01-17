import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface AddressState {
    address: string | null;
}

const initialState: AddressState = {
    address: null,
}

export const addressSlice = createSlice({
    name: 'address',
    initialState,
    reducers: {
        storeAddress: (state: AddressState, action: PayloadAction<string | null>) => {
            state.address = action.payload
        }
    },
})

export const { storeAddress } = addressSlice.actions

export default addressSlice.reducer