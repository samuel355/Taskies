/**
 * @format
 */
import 'react-native-get-random-values'; // for UUID & crypto
import 'react-native-url-polyfill/auto'; // to patch the URL constructor
import 'react-native-gesture-handler'; 
import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);
