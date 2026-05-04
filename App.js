import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  FlatList, ScrollView, StatusBar, Animated, Alert
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// --- DADOS ---
const CATEGORIAS = [
  { nome: 'Comida', icone: 'fast-food' },
  { nome: 'Lazer', icone: 'game-controller' },
  { nome: 'Farmácia', icone: 'medical' },
  { nome: 'Mercado', icone: 'cart' },
  { nome: 'Transporte', icone: 'car' },
  { nome: 'Outros', icone: 'ellipsis-horizontal' },
];

const despesasIniciais = [
  { id: '1', categoria: 'Comida', valor: 25.70, data: '25/02/2026', icone: 'fast-food', ansiedade: true },
  { id: '2', categoria: 'Lazer', valor: 80.00, data: '20/02/2026', icone: 'game-controller', ansiedade: false },
  { id: '3', categoria: 'Farmácia', valor: 110.00, data: '15/02/2026', icone: 'medical', ansiedade: false },
  { id: '4', categoria: 'Mercado', valor: 215.30, data: '02/02/2026', icone: 'cart', ansiedade: true },
];

// --- TELA SPLASH ---
function TelaSplash({ navigation }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const barraAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 4, useNativeDriver: true }),
    ]).start();

    Animated.timing(barraAnim, {
      toValue: 1, duration: 2200, useNativeDriver: false,
    }).start(() => navigation.replace('Login'));
  }, []);

  const larguraBarra = barraAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

  return (
    <View style={[styles.containerCentrado, { backgroundColor: '#0047AB' }]}>
      <StatusBar barStyle="light-content" backgroundColor="#0047AB" />
      <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }], alignItems: 'center' }}>
        <Ionicons name="wallet" size={120} color="white" />
        <Text style={styles.tituloSplash}>Meu Gasto{'\n'}Fácil</Text>
      </Animated.View>
      <View style={styles.barraFundo}>
        <Animated.View style={[styles.barraProgresso, { width: larguraBarra }]} />
      </View>
    </View>
  );
}

// --- TELA LOGIN ---
function TelaLogin({ navigation }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  const handleLogin = () => {
    if (!email || !senha) {
      Alert.alert('Atenção', 'Preencha e-mail e senha para continuar.');
      return;
    }
    navigation.navigate('MainTabs');
  };

  return (
    <ScrollView contentContainerStyle={styles.containerLogin}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
      <Ionicons name="wallet" size={70} color="#0047AB" style={{ marginBottom: 10 }} />
      <Text style={styles.tituloGrande}>Bem-vindo!</Text>
      <Text style={styles.subtituloLogin}>Controle seus gastos com consciência</Text>

      <View style={styles.inputWrapper}>
        <Text style={styles.labelInput}>E-mail</Text>
        <TextInput
          style={styles.input}
          placeholder="exemplo@email.com"
          placeholderTextColor="#999"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />
      </View>

      <View style={styles.inputWrapper}>
        <Text style={styles.labelInput}>Senha</Text>
        <TextInput
          style={styles.input}
          placeholder="••••••"
          placeholderTextColor="#999"
          secureTextEntry
          value={senha}
          onChangeText={setSenha}
        />
      </View>

      <TouchableOpacity style={styles.botaoEntrar} onPress={handleLogin}>
        <Text style={styles.textoBotaoAcao}>ENTRAR</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.botaoLink}>
        <Text style={styles.textoLinkVermelho}>Esqueci minha senha</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.botaoCadastrar}>
        <Text style={styles.textoBotaoPreto}>CADASTRAR</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// --- TELA HOME ---
function TelaHome({ navigation, route }) {
  const [gastos, setGastos] = useState(despesasIniciais);

  useEffect(() => {
    if (route.params?.novoGasto) {
      setGastos(prev => [route.params.novoGasto, ...prev]);
    }
  }, [route.params?.novoGasto]);

  const totalGasto = gastos.reduce((acc, g) => acc + g.valor, 0);
  const gastosAnsiedade = gastos.filter(g => g.ansiedade).length;

  return (
    <View style={styles.container}>
      <View style={styles.headerHome}>
        <View>
          <Text style={styles.tituloHome}>Olá! 👋</Text>
          <Text style={styles.subtituloHome}>Como estão seus gastos?</Text>
        </View>
        <View style={styles.badgeTotal}>
          <Text style={styles.badgeTotalLabel}>Total</Text>
          <Text style={styles.badgeTotalValor}>R$ {totalGasto.toFixed(2).replace('.', ',')}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.cardPrincipal}
        onPress={() => navigation.navigate('AdicionarGasto')}
        activeOpacity={0.85}
      >
        <View style={styles.circuloIcone}>
          <Ionicons name="add" size={70} color="white" />
        </View>
        <Text style={styles.textoCardPrincipal}>ADICIONAR GASTO</Text>
        <Text style={styles.textoCardSub}>Toque para registrar</Text>
      </TouchableOpacity>

      {gastosAnsiedade > 0 && (
        <View style={styles.alertaAnsiedade}>
          <Ionicons name="alert-circle" size={28} color="#D32F2F" />
          <Text style={styles.textoAlerta}>
            Você teve <Text style={{ fontWeight: 'bold' }}>{gastosAnsiedade} gasto{gastosAnsiedade > 1 ? 's' : ''}</Text> por ansiedade.
          </Text>
        </View>
      )}
    </View>
  );
}

// --- TELA ADICIONAR GASTO ---
function TelaAdicionarGasto({ navigation }) {
  const [valor, setValor] = useState('');
  const [ansiedade, setAnsiedade] = useState(null);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState(null);
  const [mostrarCategorias, setMostrarCategorias] = useState(false);
  const sucessoAnim = useRef(new Animated.Value(0)).current;

  const getDataHoje = () => {
    const hoje = new Date();
    return `${String(hoje.getDate()).padStart(2, '0')}/${String(hoje.getMonth() + 1).padStart(2, '0')}/${hoje.getFullYear()}`;
  };

  const handleSalvar = () => {
    if (!valor || !categoriaSelecionada || ansiedade === null) {
      Alert.alert('Atenção', 'Preencha o valor, a categoria e responda sobre ansiedade.');
      return;
    }

    const novoGasto = {
      id: Date.now().toString(),
      categoria: categoriaSelecionada.nome,
      valor: parseFloat(valor.replace(',', '.')),
      data: getDataHoje(),
      icone: categoriaSelecionada.icone,
      ansiedade,
    };

    Animated.sequence([
      Animated.timing(sucessoAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.delay(800),
      Animated.timing(sucessoAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start(() => navigation.navigate('Inicio', { novoGasto }));
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Animated.View style={[styles.mensagemSucesso, { opacity: sucessoAnim, transform: [{ scale: sucessoAnim }] }]}>
        <Ionicons name="checkmark-circle" size={28} color="#2E7D32" />
        <Text style={styles.textoSucesso}>Gasto salvo com sucesso!</Text>
      </Animated.View>

      <View style={styles.inputWrapper}>
        <Text style={styles.labelInput}>Valor do Gasto</Text>
        <TextInput
          style={styles.input}
          placeholder="R$ 0,00"
          placeholderTextColor="#999"
          keyboardType="numeric"
          value={valor}
          onChangeText={setValor}
        />
      </View>

      <Text style={styles.labelInput}>Categoria</Text>
      <TouchableOpacity style={styles.dropdown} onPress={() => setMostrarCategorias(!mostrarCategorias)}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          {categoriaSelecionada && <Ionicons name={categoriaSelecionada.icone} size={24} color="#0047AB" />}
          <Text style={[styles.textoDropdown, categoriaSelecionada && { color: '#000' }]}>
            {categoriaSelecionada ? categoriaSelecionada.nome : 'Selecione uma categoria'}
          </Text>
        </View>
        <Ionicons name={mostrarCategorias ? 'chevron-up' : 'chevron-down'} size={24} color="#666" />
      </TouchableOpacity>

      {mostrarCategorias && (
        <View style={styles.listaCategorias}>
          {CATEGORIAS.map(cat => (
            <TouchableOpacity
              key={cat.nome}
              style={styles.itemCategoria}
              onPress={() => { setCategoriaSelecionada(cat); setMostrarCategorias(false); }}
            >
              <Ionicons name={cat.icone} size={24} color="#0047AB" />
              <Text style={styles.textoItemCategoria}>{cat.nome}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <Text style={styles.pergunta}>Esse gasto foi por ansiedade?</Text>
      <View style={styles.linhaBotoesAnsiedade}>
        <TouchableOpacity
          style={[styles.botaoAnsiedade, { backgroundColor: '#2E7D32' }, ansiedade === true && styles.bordaAtiva]}
          onPress={() => setAnsiedade(true)}
        >
          <Ionicons name="sad-outline" size={40} color="white" />
          <Text style={styles.textoBotaoAcao}>SIM</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.botaoAnsiedade, { backgroundColor: '#D32F2F' }, ansiedade === false && styles.bordaAtiva]}
          onPress={() => setAnsiedade(false)}
        >
          <Ionicons name="happy-outline" size={40} color="white" />
          <Text style={styles.textoBotaoAcao}>NÃO</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.botaoSalvar} onPress={handleSalvar}>
        <Ionicons name="save-outline" size={26} color="white" />
        <Text style={[styles.textoBotaoAcao, { marginLeft: 10 }]}>SALVAR GASTO</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// --- TELA RELATÓRIOS ---
function TelaRelatorios({ route }) {
  const [gastos, setGastos] = useState(despesasIniciais);
  const [periodo, setPeriodo] = useState('Semana');

  useEffect(() => {
    if (route.params?.novoGasto) {
      setGastos(prev => [route.params.novoGasto, ...prev]);
    }
  }, [route.params?.novoGasto]);

  const total = gastos.reduce((acc, g) => acc + g.valor, 0);
  const totalAnsiedade = gastos.filter(g => g.ansiedade).reduce((acc, g) => acc + g.valor, 0);

  return (
    <View style={styles.container}>
      <Text style={styles.tituloSecundario}>Histórico de Gastos</Text>

      <View style={styles.resumoCards}>
        <View style={[styles.miniCard, { backgroundColor: '#E8EFFF' }]}>
          <Text style={styles.miniCardLabel}>Total gasto</Text>
          <Text style={styles.miniCardValor}>R$ {total.toFixed(2).replace('.', ',')}</Text>
        </View>
        <View style={[styles.miniCard, { backgroundColor: '#FFF0F0' }]}>
          <Text style={styles.miniCardLabel}>Por ansiedade</Text>
          <Text style={[styles.miniCardValor, { color: '#D32F2F' }]}>R$ {totalAnsiedade.toFixed(2).replace('.', ',')}</Text>
        </View>
      </View>

      <View style={styles.seletorPeriodo}>
        {['Semana', 'Mês'].map(p => (
          <TouchableOpacity
            key={p}
            style={periodo === p ? styles.periodoAtivo : styles.periodoInativo}
            onPress={() => setPeriodo(p)}
          >
            <Text style={periodo === p ? styles.textoPeriodoAtivo : styles.textoPeriodoInativo}>{p}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={gastos}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={[styles.cardGasto, item.ansiedade && styles.cardAnsiedade]}>
            <View style={styles.iconeGastoFundo}>
              <Ionicons name={item.icone} size={28} color="#0047AB" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.textoGastoValor}>R$ {item.valor.toFixed(2).replace('.', ',')}</Text>
              <Text style={styles.textoGastoMeta}>{item.categoria} • {item.data}</Text>
            </View>
            {item.ansiedade && (
              <View style={styles.badgeAnsiedade}>
                <Text style={styles.textoBadgeAnsiedade}>ansiedade</Text>
              </View>
            )}
          </View>
        )}
      />
    </View>
  );
}

// --- NAVEGAÇÃO ---
const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#0047AB',
        tabBarInactiveTintColor: '#999',
        tabBarLabelStyle: { fontSize: 16, fontWeight: 'bold' },
        tabBarStyle: { height: 75, paddingBottom: 12, paddingTop: 5 },
        headerStyle: { backgroundColor: '#0047AB' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontSize: 22, fontWeight: 'bold' },
      }}
    >
      <Tab.Screen
        name="Inicio"
        component={TelaHome}
        options={{
          title: 'Início',
          tabBarIcon: ({ color }) => <Ionicons name="home" size={32} color={color} />,
        }}
      />
      <Tab.Screen
        name="Relatorios"
        component={TelaRelatorios}
        options={{
          title: 'Histórico',
          tabBarIcon: ({ color }) => <Ionicons name="receipt" size={32} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash" component={TelaSplash} />
        <Stack.Screen name="Login" component={TelaLogin} />
        <Stack.Screen name="MainTabs" component={MainTabs} />
        <Stack.Screen
          name="AdicionarGasto"
          component={TelaAdicionarGasto}
          options={{
            headerShown: true,
            title: 'Novo Gasto',
            headerStyle: { backgroundColor: '#0047AB' },
            headerTintColor: '#fff',
            headerTitleStyle: { fontSize: 22, fontWeight: 'bold' },
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// --- ESTILOS ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5', padding: 20 },
  containerCentrado: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  containerLogin: { flexGrow: 1, backgroundColor: '#FFF', padding: 30, justifyContent: 'center', alignItems: 'center' },

  // Splash
  tituloSplash: { fontSize: 48, fontWeight: 'bold', textAlign: 'center', color: 'white', marginTop: 20 },
  barraFundo: { width: 200, height: 8, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 4, marginTop: 50, overflow: 'hidden' },
  barraProgresso: { height: 8, backgroundColor: 'white', borderRadius: 4 },

  // Login
  tituloGrande: { fontSize: 38, fontWeight: 'bold', color: '#000', textAlign: 'center', marginBottom: 6 },
  subtituloLogin: { fontSize: 16, color: '#666', marginBottom: 35, textAlign: 'center' },
  inputWrapper: { marginBottom: 20, width: '100%' },
  labelInput: { fontSize: 20, fontWeight: 'bold', marginBottom: 8, color: '#333' },
  input: { height: 65, borderWidth: 2, borderColor: '#DDD', borderRadius: 15, paddingHorizontal: 20, fontSize: 20, backgroundColor: '#FAFAFA' },
  botaoEntrar: { backgroundColor: '#0047AB', height: 70, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginTop: 10, width: '100%' },
  botaoCadastrar: { borderWidth: 2, borderColor: '#000', height: 70, borderRadius: 15, justifyContent: 'center', alignItems: 'center', width: '100%' },
  textoBotaoAcao: { color: '#FFF', fontSize: 22, fontWeight: 'bold' },
  textoBotaoPreto: { color: '#000', fontSize: 22, fontWeight: 'bold' },
  botaoLink: { marginVertical: 18, alignItems: 'center' },
  textoLinkVermelho: { color: '#D32F2F', fontSize: 18, fontWeight: 'bold', textDecorationLine: 'underline' },

  // Home
  headerHome: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 30, marginBottom: 25 },
  tituloHome: { fontSize: 32, fontWeight: 'bold', color: '#000' },
  subtituloHome: { fontSize: 18, color: '#666', marginTop: 4 },
  badgeTotal: { backgroundColor: '#0047AB', padding: 12, borderRadius: 15, alignItems: 'center' },
  badgeTotalLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 13 },
  badgeTotalValor: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  cardPrincipal: { backgroundColor: '#E8EFFF', padding: 35, borderRadius: 25, alignItems: 'center', borderWidth: 2, borderColor: '#0047AB', elevation: 4 },
  circuloIcone: { backgroundColor: '#0047AB', width: 110, height: 110, borderRadius: 55, justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  textoCardPrincipal: { fontSize: 24, fontWeight: 'bold', color: '#0047AB' },
  textoCardSub: { fontSize: 15, color: '#666', marginTop: 5 },
  alertaAnsiedade: { flexDirection: 'row', alignItems: 'center', marginTop: 25, backgroundColor: '#FFF0F0', padding: 18, borderRadius: 15, borderWidth: 1, borderColor: '#FFCDD2' },
  textoAlerta: { flex: 1, fontSize: 16, marginLeft: 10, color: '#333' },

  // Adicionar Gasto
  mensagemSucesso: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E8F5E9', padding: 15, borderRadius: 12, marginBottom: 15, borderWidth: 1, borderColor: '#A5D6A7' },
  textoSucesso: { fontSize: 18, color: '#2E7D32', fontWeight: 'bold', marginLeft: 8 },
  dropdown: { height: 65, borderWidth: 2, borderColor: '#DDD', borderRadius: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 8, backgroundColor: '#FAFAFA' },
  textoDropdown: { fontSize: 18, color: '#999' },
  listaCategorias: { borderWidth: 2, borderColor: '#DDD', borderRadius: 15, marginBottom: 20, overflow: 'hidden' },
  itemCategoria: { flexDirection: 'row', alignItems: 'center', padding: 18, borderBottomWidth: 1, borderBottomColor: '#EEE', backgroundColor: '#FFF', gap: 12 },
  textoItemCategoria: { fontSize: 20, color: '#333', fontWeight: '500' },
  pergunta: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginVertical: 20 },
  linhaBotoesAnsiedade: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25 },
  botaoAnsiedade: { width: '48%', height: 110, borderRadius: 20, justifyContent: 'center', alignItems: 'center', elevation: 3 },
  bordaAtiva: { borderWidth: 5, borderColor: '#000' },
  botaoSalvar: { backgroundColor: '#0047AB', height: 75, borderRadius: 20, justifyContent: 'center', alignItems: 'center', flexDirection: 'row' },

  // Relatórios
  tituloSecundario: { fontSize: 30, fontWeight: 'bold', marginBottom: 15 },
  resumoCards: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  miniCard: { flex: 1, padding: 15, borderRadius: 15, alignItems: 'center' },
  miniCardLabel: { fontSize: 14, color: '#666', marginBottom: 4 },
  miniCardValor: { fontSize: 20, fontWeight: 'bold', color: '#0047AB' },
  seletorPeriodo: { flexDirection: 'row', backgroundColor: '#DDD', borderRadius: 15, padding: 5, marginBottom: 20 },
  periodoAtivo: { flex: 1, backgroundColor: '#FFF', padding: 12, borderRadius: 12, alignItems: 'center' },
  periodoInativo: { flex: 1, padding: 12, alignItems: 'center' },
  textoPeriodoAtivo: { fontSize: 18, fontWeight: 'bold' },
  textoPeriodoInativo: { fontSize: 18, color: '#666' },
  cardGasto: { flexDirection: 'row', backgroundColor: '#FFF', padding: 18, borderRadius: 18, marginBottom: 12, alignItems: 'center', borderWidth: 1, borderColor: '#EEE', elevation: 2 },
  cardAnsiedade: { borderColor: '#D32F2F', borderWidth: 2, backgroundColor: '#FFF5F5' },
  iconeGastoFundo: { width: 55, height: 55, backgroundColor: '#E8EFFF', borderRadius: 28, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  textoGastoValor: { fontSize: 22, fontWeight: 'bold' },
  textoGastoMeta: { fontSize: 16, color: '#666', marginTop: 2 },
  badgeAnsiedade: { backgroundColor: '#FFCDD2', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  textoBadgeAnsiedade: { fontSize: 13, color: '#D32F2F', fontWeight: 'bold' },
});