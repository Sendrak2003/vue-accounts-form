import { defineStore } from 'pinia';
import { Account } from '../types';

export const useAccountsStore = defineStore('accounts', {
  state: () => ({
    accounts: [] as Account[],
    isDarkTheme: false,
  }),
  actions: {
    addAccount(account: Account) {
      this.accounts.push(account);
      this.saveToLocalStorage();
    },
    updateAccount(updated: Account) {
      const idx = this.accounts.findIndex(a => a.id === updated.id);
      if (idx !== -1) {
        this.accounts[idx] = updated;
        this.saveToLocalStorage();
      }
    },
    removeAccount(id: string) {
      this.accounts = this.accounts.filter(a => a.id !== id);
      this.saveToLocalStorage();
    },
    toggleTheme() {
      this.isDarkTheme = !this.isDarkTheme;
      this.saveThemeToLocalStorage();
      this.applyTheme();
    },
    saveToLocalStorage() {
      localStorage.setItem('accounts', JSON.stringify(this.accounts));
    },
    loadFromLocalStorage() {
      const data = localStorage.getItem('accounts');
      if (data) this.accounts = JSON.parse(data);
    },
    saveThemeToLocalStorage() {
      localStorage.setItem('isDarkTheme', JSON.stringify(this.isDarkTheme));
    },
    loadThemeFromLocalStorage() {
      const data = localStorage.getItem('isDarkTheme');
      if (data) {
        this.isDarkTheme = JSON.parse(data);
        this.applyTheme();
      }
    },
    applyTheme() {
      if (this.isDarkTheme) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }
});
