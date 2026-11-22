import { Pressable, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../context/AuthContext';
import AuthScreen from '../screens/AuthScreen';
import DashboardScreen from '../screens/DashboardScreen';
import LabsScreen from '../screens/LabsScreen';
import SessionScreen from '../screens/SessionScreen';
import AdminScreen from '../screens/AdminScreen';

const Stack = createNativeStackNavigator();
const Tabs = createBottomTabNavigator();

function MainTabs() {
  const { user, logout } = useAuth();
  return (
    <Tabs.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#fff' },
        headerTitleStyle: { color: '#1F2937' },
        tabBarActiveTintColor: '#DC2626',
        headerRight: () => (
          <Pressable onPress={logout} style={{ marginRight: 12, paddingHorizontal: 8, paddingVertical: 6 }}>
            <Text style={{ color: '#DC2626', fontWeight: '700' }}>Salir</Text>
          </Pressable>
        ),
      }}
    >
      <Tabs.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'Panel', tabBarLabel: 'Panel' }} />
      <Tabs.Screen name="Labs" component={LabsScreen} options={{ title: 'Laboratorios', tabBarLabel: 'Laboratorios' }} />
      <Tabs.Screen name="Session" component={SessionScreen} options={{ title: 'Mi sesión', tabBarLabel: 'Mi sesión' }} />
      {user?.rol === 'ADMIN' && <Tabs.Screen name="Admin" component={AdminScreen} options={{ title: 'Administración', tabBarLabel: 'Admin' }} />}
    </Tabs.Navigator>
  );
}

export default function AppNavigator() {
  const { user, loading } = useAuth();
  if (loading) return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><Text>Cargando sesión...</Text></View>;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <>
            <Stack.Screen name="Login" component={AuthScreen} />
            <Stack.Screen name="Register" component={AuthScreen} />
          </>
        ) : (
          <Stack.Screen name="Main" component={MainTabs} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
