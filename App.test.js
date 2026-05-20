import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';

// 🤖 1. Mocks de Infraestrutura e Firebase
jest.mock('firebase/app', () => ({ initializeApp: jest.fn(() => ({})) }));
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({})),
  initializeAuth: jest.fn(() => ({})),
  getReactNativePersistence: jest.fn(),
  onAuthStateChanged: jest.fn((auth, callback) => {
    callback({ uid: 'albert_123', email: 'albert@unex.edu.br' });
    return () => {};
  }),
  signInWithEmailAndPassword: jest.fn(() => Promise.resolve({ user: { uid: 'albert_123' } })),
  signOut: jest.fn(() => Promise.resolve()),
  createUserWithEmailAndPassword: jest.fn(() => Promise.resolve({ user: { uid: 'albert_123' } })),
}));

jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(() => ({})),
  collection: jest.fn(),
  doc: jest.fn((db, col, id) => ({ id })), 
  addDoc: jest.fn(() => Promise.resolve({ id: 'mock_gasto_id' })),
  onSnapshot: jest.fn((referencia, callback) => {
    if (referencia && referencia.id === 'albert_123') {
      callback({
        exists: () => true,
        data: () => ({ nome: 'Albert', cargo: 'Diretor Base Cordilheira', telefone: '(77) 99999-9999' })
      });
    } else {
      callback({
        docs: [
          { id: '1', data: () => ({ valor: 50, descricao: 'Lanche VCA', tipo: 'Despesa', emocao: 'Consciente' }) },
          { id: '2', data: () => ({ valor: 120, descricao: 'Suporte Som', tipo: 'Despesa', emocao: 'Estável' }) }
        ]
      });
    }
    return () => {};
  }),
  query: jest.fn(), where: jest.fn(), orderBy: jest.fn()
}));

jest.mock('./firebaseConfig', () => ({ auth: {}, db: {} }));

// 📊 2. Mocks Visuais (Gráficos, SVG e StatusBar)
jest.mock('react-native-chart-kit', () => ({
  LineChart: () => null, BarChart: () => null, PieChart: () => null,
  ContributionGraph: () => null, StackedBarChart: () => null
}));

jest.mock('react-native-svg', () => {
  const React = require('react');
  const SvgMock = (props) => React.createElement('Svg', props, props.children);
  return {
    __esModule: true, default: SvgMock, Svg: SvgMock,
    Circle: (props) => React.createElement('Circle', props),
    Rect: (props) => React.createElement('Rect', props),
    Path: (props) => React.createElement('Path', props),
    G: (props) => React.createElement('G', props),
    Text: (props) => React.createElement('Text', props),
  };
});

// 📱 NOVO: Mock da StatusBar do Expo para não quebrar a árvore de renderização
jest.mock('expo-status-bar', () => ({
  StatusBar: () => null,
}));

// 🎨 CORREÇÃO ABSOLUTA DE ÍCONES: Cria um Proxy/Mock dinâmico para QUALQUEER família de ícones usada
jest.mock('@expo/vector-icons', () => {
  const React = require('react');
  const MockIcon = (props) => React.createElement('Icon', props);
  return new Proxy({}, {
    get: () => MockIcon
  });
});

// 🧭 3. Mocks do React Navigation e Safe Area
jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    NavigationContainer: ({ children }) => <>{children}</>,
    useNavigation: () => ({ navigate: jest.fn(), goBack: jest.fn() }),
    useRoute: () => ({ params: {} }),
  };
});

jest.mock('@react-navigation/native-stack', () => ({
  createNativeStackNavigator: () => {
    const React = require('react');
    return {
      Navigator: ({ children }) => <>{children}</>,
      Screen: ({ component: Component, ...props }) => Component ? React.createElement(Component, props) : null,
    };
  },
}));

jest.mock('@react-navigation/bottom-tabs', () => ({
  createBottomTabNavigator: () => {
    const React = require('react');
    return {
      Navigator: ({ children }) => <>{children}</>,
      Screen: ({ component: Component, ...props }) => Component ? React.createElement(Component, props) : null,
    };
  },
}));

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({ children }) => <>{children}</>,
  SafeAreaView: ({ children }) => <>{children}</>,
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));

// 🤖 4. Importa o aplicativo centralizado
import App from './App'; 

describe('🤖 TESTES DE AUTOMAÇÃO DE ROBUSTEZ - MEU GASTO FÁCIL', () => {
  
  it('Deve renderizar a interface principal e validar a abertura do modal de configurações', async () => {
    const { getByText } = render(<App />);

    // Se o seu botão na barra de perfil tiver outro nome, mude o texto abaixo!
    const botaoConfig = await waitFor(() => getByText('Configurações da Conta'));
    expect(botaoConfig).toBeTruthy();
    
    fireEvent.press(botaoConfig);

    await waitFor(() => {
      expect(getByText('Editar Perfil')).toBeTruthy();
    });
  });
});