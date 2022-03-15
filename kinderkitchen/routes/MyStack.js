import React from "react";
import { createStackNavigator } from "@react-navigation/stack";

import LoginScreen from "../screens/LoginScreen";
import SignUpScreen from "../screens/SignUpScreen";
import Test2 from "../screens/Test2";
import ItemScreen from "../screens/ItemScreen";
import AccountScreen from "../screens/AccountScreen";
import CategoryScreen from "../screens/CategoryScreen";
import NotificationScreen from "../screens/NotificationScreen";
import AchievementScreen from "../screens/AchievementScreen";
import DonateScreen from "../screens/DonateScreen";
import DonateScreen2 from "../screens/DonateScreen2";
import BarcodeScreen from "../screens/BarcodeScreen";
const Stack = createStackNavigator();

const MyStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Sign Up" component={SignUpScreen} />
      <Stack.Screen name="Category" component={CategoryScreen} />
      <Stack.Screen name="Test 2" component={Test2} />
      <Stack.Screen name="Items" component={ItemScreen} />
      <Stack.Screen name="Account" component={AccountScreen} />
      <Stack.Screen name="Notifications" component={NotificationScreen} />
      <Stack.Screen name="Achievements" component={AchievementScreen} />
      <Stack.Screen name="Food Banks" component={DonateScreen} />
      <Stack.Screen name="Donate" component={DonateScreen2} />
      <Stack.Screen name="Barcode" component={BarcodeScreen} />
    </Stack.Navigator>
  );
};

export default MyStack;
