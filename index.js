/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

import { Alert } from 'react-native';

const globalErrorHandler = (error, isFatal) => {
  Alert.alert(
    'App Crashed!',
    `Error: ${error.name}\nMessage: ${error.message}\nStack: ${error.stack}`,
    [{ text: 'OK' }]
  );
};

if (global.ErrorUtils) {
  global.ErrorUtils.setGlobalHandler(globalErrorHandler);
}

AppRegistry.registerComponent(appName, () => App);
