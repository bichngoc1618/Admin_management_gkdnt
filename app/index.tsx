// App.tsx
import React from 'react';
import AppNavigator from './../Navigation/AppNavigator';

export default function App() {
  return <AppNavigator />;  // Ở đây AppNavigator KHÔNG được chứa NavigationContainer
}
