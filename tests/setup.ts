import 'react-native-gesture-handler/jestSetup';
jest.mock('react-native/Libraries/Utilities/useColorScheme', () => ({
  __esModule: true,
  default: jest.fn(() => 'light'),
}));

jest.mock('react-native-worklets', () => require('react-native-worklets/lib/module/mock'));
jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'));

afterEach(() => {
  const useColorScheme = require('react-native/Libraries/Utilities/useColorScheme').default as jest.Mock;
  useColorScheme.mockReturnValue('light');
});
