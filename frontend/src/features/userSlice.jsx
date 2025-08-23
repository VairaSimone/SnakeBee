import { createSlice } from '@reduxjs/toolkit';
import { setApiLanguage } from '../services/api';

const initialState = {
  user: null,
  language: navigator.language.split('-')[0] || 'it',
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
        setLanguage: (state, action) => {
      state.language = action.payload;
      setApiLanguage(action.payload);
    },
    loginUser: (state, action) => {
      state.user = action.payload;
       if (action.payload.language) {
        state.language = action.payload.language;
        setApiLanguage(action.payload.language); 
      }
    },
    logoutUser: (state) => {
      state.user = null;
      state.language = navigator.language.split('-')[0] || 'it'; 
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');

    },
  },
});

export const { loginUser, logoutUser,  setLanguage  } = userSlice.actions;

export const selectUser = (state) => state.user.user;
export const selectLanguage = (state) => state.user.language;

export default userSlice.reducer;
