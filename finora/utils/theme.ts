export const colors: Record<string, string> = {
  brand: '#0E5A4A',
  brandDark: '#0A453A',
  brandLight: '#1A6B5A',
  background: '#F6F3EC',
  surface: '#FFFFFF',
  ink: '#1B2422',
  inkMuted: '#5C6B66',
  inkFaint: '#8A9691',
  income: '#2E9E6B',
  incomeBg: '#E3F4EC',
  expense: '#D9534F',
  expenseBg: '#FBEAE9',
  amber: '#E0A030',
  amberBg: '#FBF3E2',
  border: '#E5E0D5',
  white: '#FFFFFF',
  danger: '#D9534F',
  success: '#2E9E6B',
  shadow: 'rgba(27, 36, 34, 0.08)',
};

export const spacing: Record<string, number> = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
};

export const radius: Record<string, number> = {
  card: 12,
  chip: 999,
  button: 12,
  input: 12,
};

export const typography: Record<string, object> = {
  h1: { fontSize: 28, fontWeight: '700', color: colors.ink },
  h2: { fontSize: 22, fontWeight: '700', color: colors.ink },
  h3: { fontSize: 18, fontWeight: '600', color: colors.ink },
  body: { fontSize: 15, fontWeight: '400', color: colors.ink },
  bodyMuted: { fontSize: 15, fontWeight: '400', color: colors.inkMuted },
  label: { fontSize: 13, fontWeight: '500', color: colors.inkMuted },
  caption: { fontSize: 12, fontWeight: '400', color: colors.inkFaint },
  amount: { fontSize: 32, fontWeight: '700', color: colors.ink },
  amountSmall: { fontSize: 20, fontWeight: '700', color: colors.ink },
};

export const shadows: Record<string, object> = {
  card: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  fab: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 6,
  },
};
