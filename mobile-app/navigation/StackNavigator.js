import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import TabNavigator from './TabNavigator';
import AnimalDetails from '../screens/AnimalDetails';
import Tourism from '../screens/Tourism';
import Donation from '../screens/Donation';
import ContactUs from '../screens/ContactUs';
import AboutUs from '../screens/AboutUs';
import Payment from '../screens/Payment';  // Import the Payment screen

const Stack = createStackNavigator();

export default function StackNavigator() {
  return (
    <Stack.Navigator>
      {/* Main Tab Navigator */}
      <Stack.Screen 
        name="Main" 
        component={TabNavigator} 
        options={{ headerShown: false }} 
      />
      {/* Stack Screens */}
      <Stack.Screen 
        name="AnimalDetails" 
        component={AnimalDetails} 
        options={({ route }) => ({
          title: route.params?.sighting.name || 'Animal Details',  // Use sighting name for title if available
        })}
      />
      <Stack.Screen 
        name="Tourism" 
        component={Tourism} 
        options={{ title: 'Tourism' }} 
      />
      <Stack.Screen 
        name="Donation" 
        component={Donation} 
        options={{ title: 'Donate' }} 
      />
      <Stack.Screen 
        name="ContactUs" 
        component={ContactUs} 
        options={{ title: 'Contact Us' }} 
      />
      <Stack.Screen 
        name="AboutUs" 
        component={AboutUs} 
        options={{ title: 'About Us' }} 
      />
      <Stack.Screen 
        name="Payment" 
        component={Payment}  // Add Payment screen here
        options={{ title: 'Complete Donation' }} 
      />
    </Stack.Navigator>
  );
}
