import '@testing-library/jest-native/extend-expect';

// Simula de forma neutra as animações nativas que travam o ambiente Node
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Silencia avisos desnecessários de logs nativos durante os testes
jest.mock('react-native/Libraries/Animated/nativeAnimatedHelper');