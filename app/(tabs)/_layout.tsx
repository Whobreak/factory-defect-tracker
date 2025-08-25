import { Tabs } from "expo-router";
import { ListCollapse, User  } from 'lucide-react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarLabelPosition: 'below-icon',
        tabBarShowLabel: true,
        tabBarActiveTintColor: '#22d3ee',
        tabBarInactiveTintColor: '#94a3b8',
        tabBarStyle: { backgroundColor: '#0f172a' },
        headerStyle: { backgroundColor: '#0f172a' },
        headerTitleStyle: { color: '#f8fafc' },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
           title: 'Sersim',
          tabBarLabel: 'Listeler',
          tabBarIcon: ({ color }) => <ListCollapse  color={color} size={24} />,  
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarLabel: 'Profil',
          tabBarIcon: ({color}) => <User color={color} size={24} />,
        }}
      />
    </Tabs>
  );
}