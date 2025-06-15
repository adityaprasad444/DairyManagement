import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Import screens
import AdminDashboard from '../screens/admin/AdminDashboard';
import DeliveryDashboard from '../screens/delivery/DeliveryDashboard';
import ConsumerDashboard from '../screens/consumer/ConsumerDashboard';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const AdminStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="AdminDashboard" 
      component={AdminDashboard}
      options={{ title: 'Admin Dashboard' }}
    />
  </Stack.Navigator>
);

const DeliveryStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="DeliveryDashboard" 
      component={DeliveryDashboard}
      options={{ title: 'Delivery Dashboard' }}
    />
  </Stack.Navigator>
);

const ConsumerStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="ConsumerDashboard" 
      component={ConsumerDashboard}
      options={{ title: 'Consumer Dashboard' }}
    />
  </Stack.Navigator>
);

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === 'Admin') {
              iconName = focused ? 'person-circle' : 'person-circle-outline';
            } else if (route.name === 'Delivery') {
              iconName = focused ? 'car' : 'car-outline';
            } else if (route.name === 'Consumer') {
              iconName = focused ? 'people' : 'people-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#007AFF',
          tabBarInactiveTintColor: 'gray',
        })}
      >
        <Tab.Screen 
          name="Admin" 
          component={AdminStack}
          options={{ headerShown: false }}
        />
        <Tab.Screen 
          name="Delivery" 
          component={DeliveryStack}
          options={{ headerShown: false }}
        />
        <Tab.Screen 
          name="Consumer" 
          component={ConsumerStack}
          options={{ headerShown: false }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator; 