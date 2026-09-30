import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import AuthStack from './AuthStack';
import AppTabs from './AppTabs';
import AddEditTransactionScreen from '../screens/AddEditTransactionScreen';
import TransactionDetailsScreen from '../screens/TransactionDetailsScreen';
import BudgetsScreen from '../screens/BudgetsScreen';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        <>
          <Stack.Screen name="Tabs" component={AppTabs} />
          <Stack.Screen
            name="AddEditTransaction"
            component={AddEditTransactionScreen}
            options={{ presentation: 'modal' }}
          />
          <Stack.Screen name="TransactionDetails" component={TransactionDetailsScreen} />
          <Stack.Screen name="Budgets" component={BudgetsScreen} />
        </>
      ) : (
        <Stack.Screen name="Auth" component={AuthStack} />
      )}
    </Stack.Navigator>
  );
}
