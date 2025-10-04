export type AccountType = 'LDAP' | 'Локальная';

export interface LabelItem {
  text: string;
}

export interface Account {
  id: string;
  label: string;
  labels: LabelItem[];
  type: AccountType;
  login: string;
  password: string | null;
  showPassword: boolean;
}
