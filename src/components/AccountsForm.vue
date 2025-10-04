<template>
  <div class="min-h-screen bg-gray-50">
    <div class="flex flex-row">
      <h2 class="text-lg font-semibold text-gray-800">Учётные записи</h2>
      <button class="add-button" @click="addAccount">
        <i class="fas fa-plus mr-1"></i>
      </button>
    </div>

    <div class="flex flex-row px-4 py-4">
      <div class="w-full text-sm text-gray-600 bg-purple-50 rounded-lg p-4 flex items-center justify-center">
        <i class="fas fa-question-circle text-purple-500 mr-2"></i>
        <span>
          Для указания нескольких меток для одной пары логин/пароль используйте
          разделитель <span class="font-mono bg-purple-100 px-1 py-0.5 rounded">;</span>
        </span>
      </div>
    </div>

    <div class="w-full">
      <div class="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <table class="w-full" style="width: 100vw;">
          <thead>
            <tr class="bg-gray-50 border-b border-gray-200">
              <th class="p-0 text-center text-sm font-medium text-gray-500 opacity-60 align-middle">Метки</th>
              <th class="p-0 text-center text-sm font-medium text-gray-500 opacity-60 align-middle">Тип записи</th>
              <th class="p-0 text-center text-sm font-medium text-gray-500 opacity-60 align-middle">Логин</th>
              <th class="p-0 text-center text-sm font-medium text-gray-500 opacity-60 align-middle">Пароль</th>
              <th class="p-0 text-center text-sm font-medium text-gray-500 opacity-60 align-middle">Действия</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(account, index) in store?.accounts || []"
              :key="account.id"
              class="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150"
            >
              <td class="text-center align-middle">
                <div class="input-container">
                  <input
                    v-model="accountLabelsInput[index]"
                    type="text"
                    placeholder="admin;test;prod"
                    class="input-field"
                    maxlength="50"
                    @blur="updateAccountLabels(index)"
                  />
                </div>
              </td>

              <td class="text-center align-middle">
                <div class="input-container">
                  <select
                    v-model="account.type"
                    class="input-field"
                    @change="onAccountTypeChange(account)"
                  >
                    <option value="Локальная">Локальная</option>
                    <option value="LDAP">LDAP</option>
                  </select>
                </div>
              </td>

              <td class="text-center align-middle">
                <div class="input-container">
                  <input
                    v-model="account.login"
                    type="text"
                    placeholder="Введите логин"
                    class="input-field"
                    maxlength="100"
                    required
                    @blur="validateAndUpdateAccount(account)"
                  />
                </div>
              </td>

              <td class="text-center align-middle">
                <div v-if="account.type === 'Локальная'" class="input-container password-container">
                  <input
                    :type="account.showPassword ? 'text' : 'password'"
                    v-model="account.password"
                    placeholder="Введите пароль"
                    class="input-field password-input"
                    maxlength="100"
                    @blur="validateAndUpdateAccount(account)"
                  />
                  <button
                    type="button"
                    class="password-toggle"
                    @click="account.showPassword = !account.showPassword"
                    :title="account.showPassword ? 'Скрыть пароль' : 'Показать пароль'"
                  >
                    <i :class="account.showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                  </button>
                </div>
                <div v-else class="input-container">
                  <span class="text-gray-500 text-sm">Пароль не требуется для LDAP</span>
                </div>
              </td>

              <td class="text-center align-middle">
                <button
                  class="delete-btn"
                  @click="removeAccount(account.id)"
                  title="Удалить запись"
                >
                  <i class="fas fa-trash-alt"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <div v-if="!store?.accounts || store.accounts.length === 0" class="text-center py-12 text-gray-500">
          <i class="fas fa-inbox text-4xl mb-3 opacity-50"></i>
          <p class="text-lg font-medium">Нет учетных записей</p>
          <p class="text-sm mt-1">Нажмите "Добавить" для создания первой записи</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useAccountsStore } from '../store/accounts';
import { Account } from '../types';
import { v4 as uuidv4 } from 'uuid';

const store = useAccountsStore();

if (store) {
  store.loadFromLocalStorage();
}

const accountLabelsInput = ref<string[]>([]);

watch(() => store?.accounts || [], (accounts) => {
  accountLabelsInput.value = accounts.map(account => 
    account.labels.map(label => label.text).join('; ')
  );
}, { immediate: true });

const addAccount = () => {
  if (!store) return;
  
  const newAccount: Account = {
    id: uuidv4(),
    label: '',
    type: 'Локальная',
    login: '',
    password: '',
    showPassword: false,
    labels: []
  };
  store.addAccount(newAccount);
  accountLabelsInput.value.push('');
};

const removeAccount = (id: string) => {
  if (!store) return;
  
  if (confirm('Вы уверены, что хотите удалить эту учетную запись?')) {
    const index = store.accounts.findIndex(account => account.id === id);
    if (index !== -1) {
      accountLabelsInput.value.splice(index, 1);
    }
    store.removeAccount(id);
  }
};

const updateAccountLabels = (index: number) => {
  if (!store) return;
  
  const account = store.accounts[index];
  if (account) {
    const labels = accountLabelsInput.value[index]
      .split(';')
      .map(label => label.trim())
      .filter(label => label)
      .map(label => ({ text: label }));
    
    const updatedAccount: Account = {
      ...account,
      labels: labels
    };
    store.updateAccount(updatedAccount);
  }
};

const validateAndUpdateAccount = (account: Account) => {
  if (!store) return;
  
  const isValid = account.login.trim() !== '' && 
    (account.type === 'LDAP' || (account.type === 'Локальная' && account.password && account.password.trim() !== ''));
  
  if (isValid) {
    const updatedAccount: Account = {
      ...account,
      password: account.type === 'LDAP' ? null : account.password
    };
    store.updateAccount(updatedAccount);
  }
};

const onAccountTypeChange = (account: Account) => {
  if (!store) return;
  
  if (account.type === 'LDAP') {
    account.password = null;
  }
  
  store.updateAccount(account);
};
</script>