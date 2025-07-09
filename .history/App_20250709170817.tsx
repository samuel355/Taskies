/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { NewAppScreen } from '@react-native/new-app-screen';
import { StatusBar, StyleSheet, useColorScheme, View } from 'react-native';
import { COLORS } from './src/constants';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <GestureHandl>
      <StatusBar translucent={false} backgroundColor={COLORS.white} barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <NewAppScreen templateFileName="App.tsx" />
    </GestureHandl>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
