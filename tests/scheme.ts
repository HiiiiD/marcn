export function setScheme(scheme: 'light' | 'dark') {
  const useColorScheme = require('react-native/Libraries/Utilities/useColorScheme').default as jest.Mock;
  useColorScheme.mockReturnValue(scheme);
}
