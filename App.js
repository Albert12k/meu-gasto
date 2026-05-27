import React, { useState, useEffect, createContext, useContext } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, ScrollView, 
  Alert, ActivityIndicator, StatusBar, TextInput, FlatList,
  KeyboardAvoidingView, Platform 
} from 'react-native';

// Navegação
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Firebase - Configurações e Autenticação
import { auth, db } from './firebaseConfig'; 
import { 
  onAuthStateChanged, 
  signOut, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateEmail,
  updatePassword
} from 'firebase/auth';

// Firebase - Firestore
import { 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  where, 
  orderBy, 
  doc, 
  deleteDoc, 
  updateDoc,
  setDoc,
  serverTimestamp 
} from 'firebase/firestore';

import TelaIA from './TelaIA';

import { LogBox } from 'react-native';
LogBox.ignoreLogs(['@firebase/firestore: Firestore']);

// Inicialização do Contexto Global
export const GastosContext = createContext();

// Identidade Visual do Projeto
const COLORS = {
  primary: '#0047AB',
  background: '#F8FAFC',
  surface: '#FFFFFF',
  text: '#1E293B',
  textSoft: '#64748B',
  border: '#E2E8F0',
  danger: '#EF4444',
  success: '#22C55E'
};

// Definição das Categorias para o Dashboard
const CATEGORIAS = [
  { nome: 'Alimentação', icone: 'fast-food', cor: '#FF9500' },
  { nome: 'Lazer', icone: 'game-controller', cor: '#AF52DE' },
  { nome: 'Transporte', icone: 'car', cor: '#007AFF' },
  { nome: 'Saúde', icone: 'medical', cor: '#FF3B30' }
];

// Configuração dos Meses para os Filtros
const MESES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

// Instâncias de Navegação
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// ==========================================
// ETAPA 2: TELA DE LOGIN
// ==========================================
function TelaLogin({ navigation }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [carregando, setCarregando] = useState(false);

  const realizarLogin = () => {
    if (!email || !senha) return Alert.alert("Atenção", "Preencha todos os campos.");
    setCarregando(true);
    
    signInWithEmailAndPassword(auth, email.trim(), senha)
      .then(() => {
        console.log("Sucesso no login");
      })
      .catch((error) => {
        setCarregando(false);
        console.log("Erro de Login:", error.code);
        // Tratamento de erro amigável
        let mensagem = "E-mail ou senha incorretos.";
        if (error.code === 'auth/user-not-found') mensagem = "Usuário não cadastrado.";
        if (error.code === 'auth/wrong-password') mensagem = "Senha incorreta.";
        Alert.alert("Erro de Acesso", mensagem);
      });
  };

  return (
    <View style={styles.containerCentro}>
      <StatusBar barStyle="dark-content" />
      <Ionicons name="wallet-outline" size={80} color={COLORS.primary} />
      <Text style={styles.tituloApp}>Meu Gasto Fácil</Text>
      
      <View style={{ width: '85%', marginTop: 20 }}>
        <View style={styles.areaInput}>
          <Ionicons name="mail-outline" size={20} color={COLORS.textSoft} />
          <TextInput 
            placeholder="E-mail" 
            style={styles.inputLimpo} 
            value={email}
            onChangeText={setEmail} 
            autoCapitalize="none" 
            keyboardType="email-address"
          />
        </View>

        <View style={styles.areaInput}>
          <Ionicons name="lock-closed-outline" size={20} color={COLORS.textSoft} />
          <TextInput 
            placeholder="Senha" 
            style={styles.inputLimpo} 
            value={senha}
            secureTextEntry 
            onChangeText={setSenha} 
          />
        </View>

        <TouchableOpacity style={styles.btnPrimario} onPress={realizarLogin} disabled={carregando}>
          {carregando ? <ActivityIndicator color="#FFF" /> : <Text style={styles.txtBtn}>Entrar</Text>}
        </TouchableOpacity>

        <View style={{ marginTop: 25, flexDirection: 'row', justifyContent: 'space-between' }}>
          <TouchableOpacity onPress={() => navigation.navigate('Cadastro')}>
            <Text style={{ color: COLORS.primary, fontWeight: '600' }}>Criar Conta</Text>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={() => navigation.navigate('EsqueciSenha')}>
            <Text style={{ color: COLORS.textSoft }}>Esqueci a senha</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

// ==========================================
// ETAPA 2.1: TELA DE CADASTRO
// ==========================================
function TelaCadastro({ navigation }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [carregando, setCarregando] = useState(false);

  const criarConta = () => {
    if (!email || !senha) return Alert.alert("Erro", "Preencha todos os campos.");
    if (senha.length < 6) return Alert.alert("Erro", "A senha deve ter no mínimo 6 caracteres.");

    setCarregando(true);
    createUserWithEmailAndPassword(auth, email.trim(), senha)
      .then(() => {
        Alert.alert("Sucesso", "Sua conta foi criada! Faça o login para continuar.");
        navigation.navigate('Login');
      })
      .catch((error) => {
        setCarregando(false);
        console.log("Erro de Cadastro:", error.code);
        let mensagem = "Não foi possível criar a conta.";
        if (error.code === 'auth/email-already-in-use') mensagem = "Este e-mail já está em uso.";
        if (error.code === 'auth/invalid-email') mensagem = "E-mail inválido.";
        Alert.alert("Erro", mensagem);
      });
  };

  return (
    <View style={styles.containerCentro}>
      <Text style={styles.tituloSecao}>Nova Conta</Text>
      <View style={{ width: '85%', marginTop: 20 }}>
        <View style={styles.areaInput}>
          <Ionicons name="mail-outline" size={20} color={COLORS.textSoft} />
          <TextInput 
            placeholder="E-mail" 
            style={styles.inputLimpo} 
            value={email}
            onChangeText={setEmail} 
            autoCapitalize="none" 
          />
        </View>
        <View style={styles.areaInput}>
          <Ionicons name="lock-closed-outline" size={20} color={COLORS.textSoft} />
          <TextInput 
            placeholder="Senha (mín. 6 dígitos)" 
            style={styles.inputLimpo} 
            value={senha}
            secureTextEntry 
            onChangeText={setSenha} 
          />
        </View>
        <TouchableOpacity style={styles.btnPrimario} onPress={criarConta} disabled={carregando}>
          {carregando ? <ActivityIndicator color="#FFF" /> : <Text style={styles.txtBtn}>Cadastrar</Text>}
        </TouchableOpacity>
        <TouchableOpacity style={{ marginTop: 20, alignItems: 'center' }} onPress={() => navigation.goBack()}>
          <Text style={{ color: COLORS.textSoft }}>Voltar ao Login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ==========================================
// ETAPA 2.2: TELA ESQUECI A SENHA
// ==========================================
function TelaEsqueciSenha({ navigation }) {
  const [email, setEmail] = useState('');
  const [carregando, setCarregando] = useState(false);

  const recuperarSenha = () => {
    if (!email) return Alert.alert("Atenção", "Digite seu e-mail.");
    setCarregando(true);
    sendPasswordResetEmail(auth, email.trim())
      .then(() => {
        setCarregando(false);
        Alert.alert("E-mail enviado", "Verifique sua caixa de entrada para redefinir sua senha.");
        navigation.goBack();
      })
      .catch((error) => {
        setCarregando(false);
        Alert.alert("Erro", "Verifique o e-mail digitado.");
      });
  };

  return (
    <View style={styles.containerCentro}>
      <Text style={styles.tituloSecao}>Recuperar Acesso</Text>
      <View style={{ width: '85%', marginTop: 20 }}>
        <View style={styles.areaInput}>
          <Ionicons name="mail-outline" size={20} color={COLORS.textSoft} />
          <TextInput 
            placeholder="E-mail" 
            style={styles.inputLimpo} 
            value={email}
            onChangeText={setEmail} 
            autoCapitalize="none" 
          />
        </View>
        <TouchableOpacity style={styles.btnPrimario} onPress={recuperarSenha}>
          {carregando ? <ActivityIndicator color="#FFF" /> : <Text style={styles.txtBtn}>Enviar Link</Text>}
        </TouchableOpacity>
        <TouchableOpacity style={{ marginTop: 20, alignItems: 'center' }} onPress={() => navigation.goBack()}>
          <Text style={{ color: COLORS.textSoft }}>Voltar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
// ==========================================
// ETAPA 3: TELA DE INÍCIO (HOME) - CORRIGIDA
// ==========================================
function TelaHome({ navigation }) {
  const CATEGORIAS_HOME = [
    { nome: 'Mercado', icone: 'cart', cor: '#4CAF50' },
    { nome: 'Lazer', icone: 'beer', cor: '#FF9800' },
    { nome: 'Transporte', icone: 'car', cor: '#2196F3' },
    { nome: 'Saúde', icone: 'heart', cor: '#E91E63' },
    { nome: 'Outros', icone: 'ellipsis-horizontal', cor: '#9E9E9E' }
  ];

  const { gastos } = useContext(GastosContext);
  
  // --- ESTADOS PARA O REGISTRO RÁPIDO ---
  const [valorExibicao, setValorExibicao] = useState('');
  const [valorNumerico, setValorNumerico] = useState(0);
  const [catRapida, setCatRapida] = useState(CATEGORIAS_HOME[0]); 
  const [salvandoRapido, setSalvandoRapido] = useState(false);

  // --- 🔥 CORREÇÃO: LIMITES COMEÇAM ZERADOS PARA O GRÁFICO INICIAR LIMPO ---
  const [limitesCategorias, setLimitesCategorias] = useState({
    "Mercado": 0,
    "Lazer": 0,
    "Transporte": 0,
    "Saúde": 0,
    "Outros": 0
  });

  const [inputsLimites, setInputsLimites] = useState({});

  const lista = gastos || []; 
  const totalGasto = lista.reduce((acc, item) => acc + (item.valor || 0), 0);

  // Soma dos gastos reais do Firebase agrupados por categoria
  const gastosPorCategoria = lista.reduce((acc, item) => {
    const cat = item.categoria || "Outros";
    acc[cat] = (acc[cat] || 0) + (item.valor || 0);
    return acc;
  }, {});

  const formatarMoedaRapida = (texto) => {
    let limpo = texto.replace(/\D/g, "");
    let numero = (Number(limpo) / 100).toFixed(2);
    if (limpo.length === 0) {
      setValorExibicao("");
      setValorNumerico(0);
      return;
    }
    setValorNumerico(parseFloat(numero));
    setValorExibicao(Number(numero).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }));
  };

  const lidarSalvarRapido = async () => {
    if (valorNumerico <= 0) return;
    setSalvandoRapido(true);
    try {
      if (!db) throw new Error("Banco de dados não inicializado.");
      const novoGastoRapido = {
        descricao: `Lançamento Rápido (${catRapida.nome})`,
        valor: valorNumerico,
        categoria: catRapida.nome,
        icone: catRapida.icone,
        cor: catRapida.cor,
        data: new Date().toLocaleDateString('pt-BR'), 
        emocional: 'Consciente', 
        userId: auth.currentUser?.uid,
        criadoEm: serverTimestamp()
      };
      await addDoc(collection(db, "gastos"), novoGastoRapido);
      setValorExibicao("");
      setValorNumerico(0);
      Alert.alert("Sucesso!", "Gasto registrado com sucesso!");
    } catch (error) {
      console.error("Erro no registro rápido:", error);
      Alert.alert("Erro", "Não foi possível fazer o registro rápido.");
    } finally {
      setSalvandoRapido(false);
    }
  };

  const salvarLimiteDigitado = (categoria) => {
    const textoDigitado = inputsLimites[categoria] || "";
    const num = parseFloat(textoDigitado.replace(',', '.'));
    
    if (!isNaN(num) && num >= 0) {
      setLimitesCategorias(prev => ({ ...prev, [categoria]: num }));
      setInputsLimites(prev => ({ ...prev, [categoria]: '' })); 
      Alert.alert("Sucesso", `Limite de ${categoria} definido para R$ ${num.toFixed(2)}`);
    } else {
      Alert.alert("Erro", "Digite um valor numérico válido.");
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <StatusBar barStyle="dark-content" />
        
        {/* Card Principal de Saldo */}
        <View style={styles.cardSaldo}>
          <View>
            <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14 }}>Gasto Total Acumulado</Text>
            <Text style={styles.txtSaldoG}>R$ {totalGasto.toFixed(2)}</Text>
          </View>
          <Ionicons name="trending-down" size={40} color="rgba(255,255,255,0.3)" />
        </View>

        {/* SEÇÃO DE REGISTRO EM 3 SEGUNDOS */}
        <View style={{
          backgroundColor: '#FFF',
          marginHorizontal: 20,
          marginTop: -10,
          marginBottom: 15,
          borderRadius: 16,
          padding: 15,
          elevation: 2,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 2,
        }}>
          <Text style={{ fontSize: 13, fontWeight: 'bold', color: COLORS.primary, marginBottom: 10 }}>
            ⚡ Registro em 3 Segundos
          </Text>
          
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <TextInput
              placeholder="R$ 0,00"
              placeholderTextColor="#999"
              style={{
                backgroundColor: '#F5F5F5',
                paddingHorizontal: 12,
                paddingVertical: 10,
                borderRadius: 10,
                fontSize: 15,
                fontWeight: 'bold',
                color: COLORS.text,
                width: '40%',
                textAlign: 'center'
              }}
              keyboardType="numeric"
              value={valorExibicao}
              onChangeText={formatarMoedaRapida}
              editable={!salvandoRapido}
            />

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ maxWidth: '43%', marginHorizontal: 5 }}>
              {CATEGORIAS_HOME.map((cat) => (
                <TouchableOpacity
                  key={cat.nome}
                  onPress={() => setCatRapida(cat)}
                  disabled={salvandoRapido}
                  style={{ 
                    padding: 8, 
                    borderRadius: 10, 
                    backgroundColor: catRapida.nome === cat.nome ? cat.cor + '20' : 'transparent', 
                    borderWidth: 1.5, 
                    borderColor: catRapida.nome === cat.nome ? cat.cor : 'transparent', 
                    marginHorizontal: 3, 
                    alignItems: 'center', 
                    justifyContent: 'center' 
                  }}
                >
                  <Ionicons name={cat.icone} size={18} color={catRapida.nome === cat.nome ? cat.cor : '#666'} />
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity
              onPress={lidarSalvarRapido}
              disabled={salvandoRapido || valorNumerico <= 0}
              style={{ 
                backgroundColor: valorNumerico <= 0 ? '#E0E0E0' : COLORS.primary, 
                width: 44, height: 44, borderRadius: 10, justifyContent: 'center', alignItems: 'center', 
                opacity: salvandoRapido ? 0.7 : 1 
              }}
            >
              {salvandoRapido ? <ActivityIndicator color="#FFF" size="small" /> : <Ionicons name="checkmark" size={22} color="#FFF" />}
            </TouchableOpacity>
          </View>
        </View>

        {/* CARD 1 - DEFINIÇÃO DOS LIMITES */}
        <View style={{
          backgroundColor: '#FFF',
          marginHorizontal: 20,
          marginBottom: 15,
          borderRadius: 16,
          padding: 15,
          elevation: 2,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 2,
        }}>
          <Text style={{ fontSize: 13, fontWeight: 'bold', color: COLORS.primary, marginBottom: 12 }}>
            ⚙️ Definir Alvos de Teto Mensal
          </Text>

          {CATEGORIAS_HOME.map((cat) => (
            <View key={cat.nome} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F8FAFC' }}>
              
              <View style={{ flexDirection: 'row', alignItems: 'center', width: 105 }}>
                <Ionicons name={cat.icone} size={16} color={cat.cor} style={{ marginRight: 8, width: 18 }} />
                <Text style={{ fontSize: 13, fontWeight: '600', color: COLORS.text }}>{cat.nome}</Text>
              </View>
              
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, justifyContent: 'flex-end' }}>
                <TextInput
                  placeholder={`R$ ${limitesCategorias[cat.nome].toFixed(0)}`}
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                  value={inputsLimites[cat.nome] || ''}
                  onChangeText={(texto) => setInputsLimites(prev => ({ ...prev, [cat.nome]: texto }))}
                  style={{
                    backgroundColor: '#F1F5F9',
                    borderRadius: 8,
                    paddingHorizontal: 12,
                    height: 38,
                    fontSize: 13,
                    width: 110, 
                    textAlign: 'center',
                    color: '#1E293B',
                    marginRight: 8,
                    fontWeight: '500'
                  }}
                />
                <TouchableOpacity 
                  onPress={() => salvarLimiteDigitado(cat.nome)}
                  style={{ backgroundColor: COLORS.primary, borderRadius: 8, height: 38, width: 65, justifyContent: 'center', alignItems: 'center' }}
                >
                  <Text style={{ color: '#FFF', fontSize: 12, fontWeight: 'bold' }}>Definir</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* CARD 2 - GRÁFICO DE TERMÔMETROS VERTICAIS */}
        <View style={{
          backgroundColor: '#FFF',
          marginHorizontal: 20,
          marginBottom: 20,
          borderRadius: 16,
          padding: 15,
          elevation: 2,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 2,
        }}>
          <Text style={{ fontSize: 13, fontWeight: 'bold', color: COLORS.primary, marginBottom: 20 }}>
            📊 Visão Geral dos Termômetros Verticais
          </Text>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', height: 160, alignItems: 'flex-end', paddingHorizontal: 5 }}>
            {CATEGORIAS_HOME.map((cat) => {
              const gastoAtual = gastosPorCategoria[cat.nome] || 0;
              const limiteMax = limitesCategorias[cat.nome];
              
              // 🔥 CALIBRAGEM: Se o limite for maior que 0 calcula a barra. Se for 0, só enche se houver gasto de fato.
              let porcentagem = 0;
              if (limiteMax > 0) {
                porcentagem = Math.min((gastoAtual / limiteMax) * 100, 100);
              } else if (gastoAtual > 0) {
                porcentagem = 100; 
              }

              let corTermometro = '#4CAF50'; 
              if (gastoAtual > 0 && (limiteMax === 0 || gastoAtual >= limiteMax)) {
                corTermometro = '#F44336'; 
              } else if (limiteMax > 0 && gastoAtual >= limiteMax * 0.7) {
                corTermometro = '#FF9800'; 
              }

              const legendaCurta = cat.nome.substring(0, 4);

              return (
                <View key={cat.nome} style={{ alignItems: 'center', flex: 1 }}>
                  <Text style={{ fontSize: 9, fontWeight: 'bold', color: '#64748B', marginBottom: 4 }}>
                    {gastoAtual > 0 ? `R$${gastoAtual.toFixed(0)}` : 'R$0'}
                  </Text>

                  <View style={{ height: 100, width: 22, backgroundColor: '#E2E8F0', borderRadius: 12, justifyContent: 'flex-end', overflow: 'hidden' }}>
                    <View style={{ height: `${porcentagem}%`, width: '100%', backgroundColor: corTermometro, borderRadius: 12 }} />
                  </View>

                  <Text style={{ fontSize: 11, fontWeight: '600', color: COLORS.text, marginTop: 8 }}>
                    {legendaCurta}.
                  </Text>
                  
                  <Text style={{ fontSize: 9, color: COLORS.textSoft, marginTop: 2 }}>
                    Lim: {limiteMax.toFixed(0)}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        <View style={{ height: 100 }} /> 
      </ScrollView>

      {/* BOTÃO FLUTUANTE EXPANSIVO */}
      <TouchableOpacity 
        style={{ position: 'absolute', right: 20, bottom: 25, backgroundColor: COLORS.primary, paddingHorizontal: 20, paddingVertical: 13, borderRadius: 30, flexDirection: 'row', alignItems: 'center', elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84 }}
        onPress={() => navigation.navigate('AdicionarGasto')}
      >
        <Ionicons name="add" size={24} color="#FFF" style={{ marginRight: 6 }} />
        <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 14 }}>Registro Completo</Text>
      </TouchableOpacity>
    </View>
  );
}
// ==========================================
// ETAPA 4: TELA DE ADICIONAR GASTO (VERSÃO FINAL CORRIGIDA)
// ==========================================
function TelaAdicionarGasto({ route, navigation }) { // 🔥 Adicionado o 'route' aqui nos parâmetros
  
  // 🔥 Importando a função de edição global que criamos no seu App.js
  const { editarGastoGlobal } = useContext(GastosContext);

  // CONSTANTE LOCAL BLINDADA PARA IMPEDIR QUE CONFLITOS OCULTEM A CATEGORIA OUTROS
  const CATEGORIAS_OFICIAIS = [
    { nome: 'Mercado', icone: 'cart', cor: '#4CAF50' },
    { nome: 'Lazer', icone: 'beer', cor: '#FF9800' },
    { nome: 'Transporte', icone: 'car', cor: '#2196F3' },
    { nome: 'Saúde', icone: 'heart', cor: '#E91E63' },
    { nome: 'Outros', icone: 'ellipsis-horizontal', cor: '#9E9E9E' }
  ];

  const [descricao, setDescricao] = useState('');
  const [valorExibicao, setValorExibicao] = useState('');
  const [valorNumerico, setValorNumerico] = useState(0);
  const [data, setData] = useState(new Date().toLocaleDateString('pt-BR'));
  const [categoriaSel, setCategoriaSel] = useState(CATEGORIAS_OFICIAIS[0]); 
  const [emocional, setEmocional] = useState('Consciente');
  const [carregando, setCarregando] = useState(false);

  // 🔥 ESTADOS DE CONTROLE: Para diferenciar se é um novo gasto ou uma edição
  const [isEditando, setIsEditando] = useState(false);
  const [gastoId, setGastoId] = useState(null);

  const niveisEmocionais = [
    { nome: 'Necessário', cor: '#4CAF50', icone: 'checkmark-circle' },
    { nome: 'Consciente', cor: '#2196F3', icone: 'bulb' },
    { nome: 'Impulsivo', cor: '#FF9800', icone: 'flash' },
    { nome: 'Arrehendido', cor: '#F44336', icone: 'sad' }
  ];

  // 🔥 DETECTOR DE ENTRADA: Se houver dados passados no clique do histórico, preenche tudo na hora!
  useEffect(() => {
    if (route.params?.gastoParaEditar) {
      const gasto = route.params.gastoParaEditar;
      
      setIsEditando(true);
      setGastoId(gasto.id);

      // Preenchendo todos os inputs textuais e numéricos
      setDescricao(gasto.descricao || '');
      setValorNumerico(gasto.valor || 0);
      setData(gasto.data || new Date().toLocaleDateString('pt-BR'));
      setEmocional(gasto.emocional || 'Consciente');

      // Formata a string de moeda para carregar no input "R$ X,XX" de forma nativa
      if (gasto.valor) {
        setValorExibicao(
          Number(gasto.valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
        );
      }

      // Encontra o objeto da categoria correspondente para deixar o botão marcado
      const categoriaSalva = CATEGORIAS_OFICIAIS.find(c => c.nome === gasto.categoria);
      if (categoriaSalva) {
        setCategoriaSel(categoriaSalva);
      } else {
        // Fallback para a categoria Outros se não achar o match
        setCategoriaSel(CATEGORIAS_OFICIAIS[4]);
      }
    }
  }, [route.params?.gastoParaEditar]);

  const formatarMoeda = (texto) => {
    let limpo = texto.replace(/\D/g, "");
    let numero = (Number(limpo) / 100).toFixed(2);
    if (limpo.length === 0) {
      setValorExibicao("");
      setValorNumerico(0);
      return;
    }
    setValorNumerico(parseFloat(numero));
    setValorExibicao(Number(numero).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }));
  };

  const salvarGasto = async () => {
    if (!descricao || valorNumerico <= 0) {
      return Alert.alert("Atenção", "Preencha a descrição e um valor válido.");
    }

    setCarregando(true); 

    try {
      if (!db) throw new Error("Banco de dados não inicializado.");

      if (isEditando) {
        // 🔥 MUDANÇA OPERACIONAL: Se for edição, executa a substituição reativa no Firebase
        await editarGastoGlobal(gastoId, valorNumerico);
        Alert.alert("Sucesso", "O lançamento foi atualizado!");
      } else {
        // Se for um gasto normal do zero, cria o documento normalmente
        const novoGasto = {
          descricao: descricao.trim(),
          valor: valorNumerico,
          categoria: categoriaSel.nome,
          icone: categoriaSel.icone,
          cor: categoriaSel.cor,
          data,
          emocional,
          userId: auth.currentUser?.uid,
          criadoEm: serverTimestamp() 
        };
        await addDoc(collection(db, "gastos"), novoGasto);
        Alert.alert("Sucesso", "Novo gasto registrado!");
      }

      setCarregando(false);
      
      if (navigation.canGoBack()) {
        navigation.goBack();
      } else {
        navigation.navigate('MainTabs'); 
      }

    } catch (error) {
      setCarregando(false); 
      console.error("Erro API Firestore:", error);
      Alert.alert("Erro", "Não foi possível conectar ao banco. Tente reiniciar o app.");
    }
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      {/* Título dinâmico para dar feedback visual */}
      <Text style={styles.tituloSecao}>
        {isEditando ? "✏️ Modificar o seu Gasto" : "O que você comprou?"}
      </Text>
      
      <Text style={styles.labelInput}>Descrição</Text>
      <TextInput 
        placeholder="Ex: Almoço no Shopping" 
        style={[styles.inputGrande, carregando && { backgroundColor: '#F5F5F5', color: '#999' }]}
        value={descricao}
        onChangeText={setDescricao}
        editable={!carregando} 
      />

      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <View style={{ width: '48%' }}>
          <Text style={styles.labelInput}>Valor</Text>
          <TextInput 
            placeholder="R$ 0,00" 
            style={[styles.inputGrande, carregando && { backgroundColor: '#F5F5F5', color: '#999' }]}
            keyboardType="numeric"
            value={valorExibicao}
            onChangeText={formatarMoeda}
            editable={!carregando} 
          />
        </View>
        <View style={{ width: '48%' }}>
          <Text style={styles.labelInput}>Data</Text>
          <TextInput 
            placeholder="DD/MM/AAAA" 
            style={[styles.inputGrande, carregando && { backgroundColor: '#F5F5F5', color: '#999' }]}
            value={data}
            onChangeText={setData}
            editable={!carregando} 
          />
        </View>
      </View>

      <Text style={[styles.labelInput, { marginTop: 15 }]}>Como você se sente sobre esse gasto?</Text>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}>
        {niveisEmocionais.map((nivel) => (
          <TouchableOpacity 
            key={nivel.nome}
            onPress={() => setEmocional(nivel.nome)}
            disabled={carregando} 
            style={{
              width: '23%',
              paddingVertical: 12,
              borderRadius: 12,
              borderWidth: 2,
              alignItems: 'center',
              borderColor: emocional === nivel.nome ? nivel.cor : '#F0F0F0',
              backgroundColor: emocional === nivel.nome ? nivel.cor + '15' : '#FFF',
              opacity: carregando ? 0.6 : 1 
            }}
          >
            <Ionicons name={nivel.icone} size={18} color={emocional === nivel.nome ? nivel.cor : '#999'} />
            <Text style={{ fontSize: 9, marginTop: 5, color: emocional === nivel.nome ? nivel.cor : '#999', fontWeight: 'bold' }}>
              {nivel.nome}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.labelInput}>Escolha uma Categoria</Text>
      
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginVertical: 10 }}>
        {CATEGORIAS_OFICIAIS.map((cat) => (
          <TouchableOpacity 
            key={cat.nome}
            onPress={() => setCategoriaSel(cat)}
            disabled={carregando} 
            style={[
              styles.itemCategoriaBtn,
              { width: '48%', flexDirection: 'row', alignItems: 'center', marginBottom: 12, paddingVertical: 12, paddingHorizontal: 12, borderWidth: 1.5, borderRadius: 12 },
              categoriaSel.nome === cat.nome ? { borderColor: cat.cor, backgroundColor: cat.cor + '10' } : { borderColor: '#F0F0F0', backgroundColor: '#FFF' },
              carregando && { opacity: 0.6 } 
            ]}
          >
            <Ionicons name={cat.icone} size={20} color={categoriaSel.nome === cat.nome ? cat.cor : COLORS.textSoft} style={{ marginRight: 8 }} />
            <Text style={{ fontSize: 11, color: categoriaSel.nome === cat.nome ? cat.cor : COLORS.textSoft, fontWeight: 'bold' }}>
              {cat.nome}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Botão Principal Dinâmico */}
      <TouchableOpacity 
        style={[
          styles.btnPrimario, 
          { marginTop: 20 }, 
          carregando && { backgroundColor: '#A0A0A0', opacity: 0.8 } 
        ]} 
        onPress={salvarGasto} 
        disabled={carregando} 
      >
        {carregando ? (
          <ActivityIndicator color="#FFF" size="small" />
        ) : (
          <Text style={styles.txtBtn}>
            {isEditando ? "Confirmar Alterações" : "Confirmar Lançamento"}
          </Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity 
        style={{ marginTop: 15, alignItems: 'center', marginBottom: 30 }} 
        onPress={() => !carregando && (navigation.canGoBack() ? navigation.goBack() : navigation.navigate('MainTabs'))}
        disabled={carregando} 
      >
        <Text style={{ color: carregando ? '#CCC' : COLORS.textSoft }}>Cancelar e Voltar</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
// ==========================================
// ETAPA 5: TELA DE HISTÓRICO (DASHBOARD API) - COM EDIÇÃO DIRETA INTEGRADA
// =========================================================================
function TelaHistorico({ navigation }) {
  const { gastos } = useContext(GastosContext); 
  
  const meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  const [mesSelecionado, setMesSelecionado] = useState(new Date().getMonth());

  // 1. Filtragem por Mês
  const gastosFiltrados = (gastos || []).filter(g => {
    if (!g.data) return false;
    const partes = g.data.split('/');
    return parseInt(partes[1]) - 1 === mesSelecionado;
  });

  // 2. Lógica do Gráfico
  const totalMes = gastosFiltrados.reduce((acc, curr) => acc + curr.valor, 0);
  
  const dadosGrafico = CATEGORIAS.map(cat => {
    const totalCat = gastosFiltrados
      .filter(g => g.categoria === cat.nome)
      .reduce((acc, curr) => acc + curr.valor, 0);
    const porcentagem = totalMes > 0 ? (totalCat / totalMes) * 100 : 0;
    return { ...cat, total: totalCat, porcentagem: parseInt(porcentagem) };
  }).filter(c => c.total > 0);

  const obterMensagem = () => { 
    if (totalMes === 0) return "Mês limpo! Que tal planejar um novo investimento?";
    if (totalMes > 1500) return "Opa, os gastos subiram. Analise o que foi impulsivo!";
    return "Você está no comando do seu dinheiro, Albert!";
  };

  // 3. EXCLUSÃO REAL NO FIRESTORE
  const deletarGastoNoBanco = async (id) => {
    try {
      await deleteDoc(doc(db, "gastos", id));
    } catch (error) {
      console.error("Erro ao deletar:", error);
      Alert.alert("Erro", "Não foi possível apagar o registro.");
    }
  };

  const confirmarExclusao = (id) => {
    Alert.alert("Excluir", "Deseja apagar este lançamento permanentemente?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Apagar", style: "destructive", onPress: () => deletarGastoNoBanco(id) }
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      {/* SELETOR DE MESES */}
      <View style={{ backgroundColor: '#FFF', paddingVertical: 12, borderBottomWidth: 1, borderColor: COLORS.border }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20 }}>
          {meses.map((mes, index) => (
            <TouchableOpacity 
              key={mes} 
              onPress={() => setMesSelecionado(index)}
              style={{
                paddingHorizontal: 15,
                paddingVertical: 8,
                borderRadius: 20,
                backgroundColor: mesSelecionado === index ? COLORS.primary : '#F5F5F5',
                marginRight: 10
              }}
            >
              <Text style={{ color: mesSelecionado === index ? '#FFF' : COLORS.textSoft, fontWeight: 'bold' }}>{mes}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        
        {/* CARD DE MOTIVAÇÃO */}
        <View style={{ 
          backgroundColor: COLORS.primary + '10', 
          padding: 15, borderRadius: 15, borderLeftWidth: 5, borderColor: COLORS.primary,
          marginBottom: 20, marginTop: 10
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="bulb-outline" size={20} color={COLORS.primary} />
            <Text style={{ marginLeft: 10, fontSize: 13, color: COLORS.primary, fontWeight: 'bold' }}>CONSCIÊNCIA FINANCEIRA</Text>
          </View>
          <Text style={{ color: COLORS.text, marginTop: 5, fontStyle: 'italic' }}>"{obterMensagem()}"</Text>
        </View>

        {/* DASHBOARD DE CATEGORIAS */}
        <Text style={styles.tituloSecao}>Análise de {meses[mesSelecionado]}</Text>
        {gastosFiltrados.length > 0 ? (
          <View style={{ backgroundColor: '#FFF', padding: 18, borderRadius: 15, marginBottom: 25, borderWidth: 1, borderColor: COLORS.border }}>
            {dadosGrafico.map(item => (
              <View key={item.nome} style={{ marginBottom: 15 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
                  <Text style={{ fontSize: 13, fontWeight: '600' }}>{item.nome}</Text>
                  <Text style={{ fontSize: 12, color: COLORS.textSoft }}>R$ {item.total.toFixed(2)} ({item.porcentagem}%)</Text>
                </View>
                <View style={{ height: 6, backgroundColor: '#F0F0F0', borderRadius: 3, overflow: 'hidden' }}>
                  <View style={{ width: `${item.porcentagem}%`, height: '100%', backgroundColor: item.cor }} />
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={[styles.areaVazia, { height: 80, marginBottom: 20 }]}>
              <Text style={{ color: COLORS.textSoft }}>Sem gastos registrados em {meses[mesSelecionado]}.</Text>
          </View>
        )}

        {/* LISTAGEM DE LANÇAMENTOS */}
        <Text style={styles.tituloSecao}>Histórico Detalhado</Text>
        {gastosFiltrados.map((item) => (
          <View key={item.id} style={styles.cardGastoG}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: 'bold', color: COLORS.text, fontSize: 16 }}>{item.descricao}</Text>
              <Text style={{ fontSize: 12, color: COLORS.textSoft }}>{item.data} • {item.emocional}</Text>
              <Text style={{ fontWeight: 'bold', color: COLORS.danger, marginTop: 4 }}>- R$ {item.valor.toFixed(2)}</Text>
            </View>
            
            <View style={{ flexDirection: 'row', gap: 15, alignItems: 'center' }}>
              {/* 🔥 ADAPTADO: Agora navega direto para a tela de adicionar levando o objeto do gasto completo */}
              <TouchableOpacity onPress={() => navigation.navigate('AdicionarGasto', { gastoParaEditar: item })}>
                <Ionicons name="create-outline" size={24} color={COLORS.primary} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => confirmarExclusao(item.id)}>
                <Ionicons name="trash-outline" size={24} color={COLORS.danger} />
              </TouchableOpacity>
            </View>
          </View>
        ))}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}
// ==========================================
// ETAPA 6: TELA DE PERFIL (DADOS PERSISTENTES)
// ==========================================
function TelaPerfil() {
  const { gastos, setGastos, dadosPerfil } = useContext(GastosContext);
  const user = auth.currentUser;
  
  const [editando, setEditando] = useState(false);
  const [carregando, setCarregando] = useState(false);

  // Estados locais para o formulário de edição
  const [nome, setNome] = useState(dadosPerfil?.nome || "");
  const [telefone, setTelefone] = useState(dadosPerfil?.telefone || "");
  const [cargo, setCargo] = useState(dadosPerfil?.cargo || "");
  const [email, setEmail] = useState(user?.email || "");
  const [novaSenha, setNovaSenha] = useState("");

  // Estatísticas Reais
  const totalLancamentos = gastos?.length || 0;
  const totalGeral = gastos?.reduce((acc, curr) => acc + (curr.valor || 0), 0) || 0;

  // FUNÇÃO: Salvar tudo (Auth + Firestore)
  const salvarAlteracoes = async () => {
    setCarregando(true);
    try {
      // 1. Atualiza Dados no Firestore (Nome, Telefone, Cargo)
      const userRef = doc(db, "usuarios", user.uid);
      await setDoc(userRef, {
        nome: nome,
        telefone: telefone,
        cargo: cargo,
        atualizadoEm: new Date()
      }, { merge: true });

      // 2. Atualiza E-mail no Auth (se mudou)
      if (email !== user.email) {
        await updateEmail(user, email);
      }

      // 3. Atualiza Senha no Auth (se preenchida)
      if (novaSenha.length >= 6) {
        await updatePassword(user, novaSenha);
      }

      Alert.alert("Sucesso", "Perfil atualizado com sucesso!");
      setEditando(false);
      setNovaSenha("");
    } catch (error) {
      console.error(error);
      Alert.alert("Erro", "Falha ao atualizar. Se for mudar e-mail ou senha, o Firebase exige que você tenha logado recentemente.");
    }
    setCarregando(false);
  };

  const fazerLogout = () => {
    Alert.alert("Sair", "Deseja encerrar sua sessão?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Sair", style: "destructive", onPress: () => signOut(auth) }
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F8F9FE' }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* CABEÇALHO */}
        <View style={{ backgroundColor: COLORS.primary, height: 160, alignItems: 'center', justifyContent: 'center', borderBottomLeftRadius: 30, borderBottomRightRadius: 30 }}>
          <View style={{ 
            width: 100, height: 100, borderRadius: 50, backgroundColor: '#FFF', 
            justifyContent: 'center', alignItems: 'center', elevation: 10, marginBottom: -80,
            borderWidth: 4, borderColor: '#F8F9FE'
          }}>
            <Text style={{ color: COLORS.primary, fontSize: 40, fontWeight: 'bold' }}>
              {(dadosPerfil?.nome || "A")[0].toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={{ marginTop: 50, paddingHorizontal: 25, alignItems: 'center' }}>
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: COLORS.text }}>{dadosPerfil?.nome || "Usuário"}</Text>
          <Text style={{ color: COLORS.textSoft, fontSize: 14 }}>{dadosPerfil?.cargo || "Membro"} • {user?.email}</Text>
          
          {/* CARDS DE RESUMO */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 25 }}>
            <View style={{ backgroundColor: '#FFF', padding: 15, borderRadius: 20, width: '48%', alignItems: 'center', elevation: 2 }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: COLORS.primary }}>{totalLancamentos}</Text>
              <Text style={{ fontSize: 12, color: COLORS.textSoft }}>Lançamentos</Text>
            </View>
            <View style={{ backgroundColor: '#FFF', padding: 15, borderRadius: 20, width: '48%', alignItems: 'center', elevation: 2 }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#4CAF50' }}>R$ {totalGeral.toFixed(0)}</Text>
              <Text style={{ fontSize: 12, color: COLORS.textSoft }}>Total Gasto</Text>
            </View>
          </View>

          {/* LISTA DE OPÇÕES */}
          <View style={{ width: '100%', marginTop: 30 }}>
            <TouchableOpacity 
              onPress={() => {
                setNome(dadosPerfil.nome || "");
                setTelefone(dadosPerfil.telefone || "");
                setCargo(dadosPerfil.cargo || "");
                setEditando(true);
              }}
              style={{ backgroundColor: '#FFF', flexDirection: 'row', alignItems: 'center', padding: 18, borderRadius: 15, marginBottom: 12, elevation: 1 }}
            >
              <View style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: COLORS.primary + '15', justifyContent: 'center', alignItems: 'center' }}>
                <Ionicons name="settings-outline" size={20} color={COLORS.primary} />
              </View>
              <Text style={{ flex: 1, marginLeft: 15, fontWeight: '500', color: COLORS.text }}>Configurações da Conta</Text>
              <Ionicons name="chevron-forward" size={18} color={COLORS.border} />
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={fazerLogout}
              style={{ backgroundColor: '#FFF', flexDirection: 'row', alignItems: 'center', padding: 18, borderRadius: 15, marginTop: 10, elevation: 1 }}
            >
              <View style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: '#F4433615', justifyContent: 'center', alignItems: 'center' }}>
                <Ionicons name="log-out-outline" size={20} color="#F44336" />
              </View>
              <Text style={{ flex: 1, marginLeft: 15, fontWeight: 'bold', color: '#F44336' }}>Sair do Aplicativo</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* MODAL DE EDIÇÃO */}
      {editando && (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 20, zIndex: 10 }}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <View style={{ backgroundColor: '#FFF', padding: 25, borderRadius: 25, maxHeight: '95%' }}>
              <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 20 }}>Editar Perfil</Text>
                
                <Text style={styles.labelInput}>Nome Completo</Text>
                <TextInput style={styles.inputGrande} value={nome} onChangeText={setNome} />
                
                <Text style={styles.labelInput}>Cargo/Função</Text>
                <TextInput style={styles.inputGrande} value={cargo} onChangeText={setCargo} />

                <Text style={styles.labelInput}>Telefone</Text>
                <TextInput style={styles.inputGrande} placeholder="(77) 9..." value={telefone} onChangeText={setTelefone} keyboardType="phone-pad" />

                <View style={{ marginVertical: 10, height: 1, backgroundColor: COLORS.border }} />

                <Text style={styles.labelInput}>E-mail (Acesso)</Text>
                <TextInput style={styles.inputGrande} value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />

                <Text style={styles.labelInput}>Nova Senha (mín. 6 dígitos)</Text>
                <TextInput style={styles.inputGrande} placeholder="Deixe em branco para não alterar" value={novaSenha} onChangeText={setNovaSenha} secureTextEntry />

                <TouchableOpacity 
                  style={[styles.btnPrimario, { marginTop: 20 }]} 
                  onPress={salvarAlteracoes}
                  disabled={carregando}
                >
                  {carregando ? <ActivityIndicator color="#FFF" /> : <Text style={styles.txtBtn}>Salvar Alterações</Text>}
                </TouchableOpacity>

                <TouchableOpacity 
                  style={{ marginTop: 15, alignItems: 'center', paddingBottom: 10 }} 
                  onPress={() => setEditando(false)}
                >
                  <Text style={{ color: COLORS.textSoft }}>Cancelar</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </View>
      )}
    </View>
  );
}
// ==========================================
// ETAPA 7.1: CONFIGURAÇÃO DAS ABAS (TABS)
// ==========================================
function MainTabs() {
  return (
    <Tab.Navigator 
      screenOptions={{ 
        tabBarActiveTintColor: COLORS.primary,
        headerTitleAlign: 'center',
        tabBarStyle: { height: 65, paddingBottom: 10, paddingTop: 5 }
      }}
    >
      <Tab.Screen 
        name="Início" 
        component={TelaHome} 
        options={{ 
          tabBarIcon: ({color}) => <Ionicons name="home-outline" size={24} color={color}/> 
        }}
      />
      
      {/* 🔥 NOVA ABA: ASSISTENTE DE IA COMPORTAMENTAL */}
      <Tab.Screen 
        name="Assistente IA" 
        component={TelaIA} 
        options={{ 
          tabBarIcon: ({color}) => <Ionicons name="hardware-chip-outline" size={24} color={color}/>,
          headerTitle: "Gasto Fácil AI"
        }}
      />

      <Tab.Screen 
        name="Histórico" 
        component={TelaHistorico} 
        options={{ 
          tabBarIcon: ({color}) => <Ionicons name="list-outline" size={24} color={color}/> 
        }}
      />
      
      <Tab.Screen 
        name="Perfil" 
        component={TelaPerfil} 
        options={{ 
          tabBarIcon: ({color}) => <Ionicons name="person-outline" size={24} color={color}/> 
        }}
      />
    </Tab.Navigator>
  );
}

// ==========================================
// ETAPA 7.2: FUNÇÃO PRINCIPAL DO APLICATIVO (APP)
// ==========================================
export default function App() {
  const [user, setUser] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [gastos, setGastos] = useState([]); 
  // 🔥 NOVO: Estados Globais para os Ganhos persistirem sem resetar
  const [ganhos, setGanhos] = useState([]);
  const [carregandoGanhos, setCarregandoGanhos] = useState(true);
  const [dadosPerfil, setDadosPerfil] = useState({ nome: 'Albert', telefone: '', cargo: 'Usuário' });

  // Monitor Global: Login + Gastos + Ganhos + Dados de Perfil
  useEffect(() => {
    // 1. Monitora se o usuário está logado
    const unsubscribeAuth = onAuthStateChanged(auth, (usuarioLogado) => {
      setUser(usuarioLogado);
      
      if (usuarioLogado) {
        console.log("✅ Conectado como:", usuarioLogado.uid);

        // 2. ESCUTA GASTOS (Sincronização em Tempo Real)
        const qGastos = query(
          collection(db, "gastos"),
          where("userId", "==", usuarioLogado.uid),
          orderBy("criadoEm", "desc")
        );

        const unsubscribeGastos = onSnapshot(qGastos, (snapshot) => {
          const lista = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setGastos(lista);
          console.log("📊 Gastos sincronizados:", lista.length);
        });

        // 🔥 3. NOVO: ESCUTA GANHOS (Sincronização em Tempo Real sem reset)
        const qGanhos = query(
          collection(db, "ganhos"),
          where("userId", "==", usuarioLogado.uid)
        );

        const unsubscribeGanhos = onSnapshot(qGanhos, (snapshot) => {
          const listaGanhosCarregados = snapshot.docs.map(docSnap => ({
            id: docSnap.id,
            ...docSnap.data()
          }));
          // Ordena de forma reativa pelo tempo
          listaGanhosCarregados.sort((a, b) => (b.sortTime || 0) - (a.sortTime || 0));
          setGanhos(listaGanhosCarregados);
          setCarregandoGanhos(false);
          console.log("💸 Ganhos sincronizados:", listaGanhosCarregados.length);
        }, (error) => {
          console.error("Erro ao escutar ganhos:", error);
          setCarregandoGanhos(false);
        });

        // 4. ESCUTA PERFIL (Nome, Telefone, Cargo no Firestore)
        const docRef = doc(db, "usuarios", usuarioLogado.uid);
        const unsubscribePerfil = onSnapshot(docRef, (docSnap) => {
          if (docSnap.exists()) {
            setDadosPerfil(docSnap.data());
            console.log("👤 Dados de perfil carregados!");
          }
        });

        setCarregando(false);

        // Limpeza de todos os ouvintes ao deslogar ou fechar o app
        return () => {
          unsubscribeGastos();
          unsubscribeGanhos(); // 🔥 Desliga o monitor de ganhos
          unsubscribePerfil();
        };
      } else {
        // Se deslogar, limpa todo o cache de estados globais
        setGastos([]);
        setGanhos([]); // 🔥 Zera o estado local ao deslogar
        setDadosPerfil({ nome: 'Albert', telefone: '', cargo: 'Usuário' });
        setCarregandoGanhos(true);
        setCarregando(false);
      }
    });

    return unsubscribeAuth; 
  }, []);

  // 🔥 5. NOVO: FUNÇÕES DE MUTABILIDADE DOS GANHOS NO CLOUD FIRESTORE
  const adicionarGanhoGlobal = async (valor) => {
    if (!auth.currentUser) return;
    const novoGanho = {
      valor: valor,
      data: new Date().toLocaleDateString('pt-BR'),
      sortTime: Date.now(),
      userId: auth.currentUser.uid,
      criadoEm: serverTimestamp() 
    };
    await addDoc(collection(db, "ganhos"), novoGanho);
  };

  const editarGanhoGlobal = async (id, novoValor) => {
    const ganhoRef = doc(db, "ganhos", id);
    await updateDoc(ganhoRef, { valor: novoValor });
  };

  const excluirGanhoGlobal = async (id) => {
    const ganhoRef = doc(db, "ganhos", id);
    await deleteDoc(ganhoRef);
  };

  // 🔥 NOVA FUNÇÃO INSERIDA: Permite editar os gastos do histórico de qualquer mês por substituição
  const editarGastoGlobal = async (id, novoValor) => {
    const gastoRef = doc(db, "gastos", id);
    await updateDoc(gastoRef, { valor: novoValor });
  };

  // Tela de Splash / Carregamento Inicial
  if (carregando) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8F9FE' }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={{ marginTop: 10, color: COLORS.textSoft }}>Sincronizando com o banco...</Text>
      </View>
    );
  }

  return (
    // 🔥 6. CONTEXT VALUE ATUALIZADO: repassando 'editarGastoGlobal' junto com os outros dados
    <GastosContext.Provider value={{ 
      gastos, 
      setGastos, 
      ganhos, 
      carregandoGanhos, 
      dadosPerfil, 
      setDadosPerfil,
      adicionarGanhoGlobal,
      editarGanhoGlobal,
      excluirGanhoGlobal,
      editarGastoGlobal // 🔥 Pronto para o histórico usar
    }}>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerTitleAlign: 'center' }}>
          {user ? (
            <>
              <Stack.Screen 
                name="MainTabs" 
                component={MainTabs} 
                options={{ headerShown: false }} 
              />
              <Stack.Screen 
                name="AdicionarGasto" 
                component={TelaAdicionarGasto} 
                options={{ title: 'Gerenciar Gasto' }} 
              />
            </>
          ) : (
            <>
              <Stack.Screen 
                name="Login" 
                component={TelaLogin} 
                options={{ headerShown: false }} 
              />
              <Stack.Screen 
                name="Cadastro" 
                component={TelaCadastro} 
                options={{ title: 'Criar Conta' }} 
              />
              <Stack.Screen 
                name="EsqueciSenha" 
                component={TelaEsqueciSenha} 
                options={{ title: 'Recuperar Acesso' }} 
              />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </GastosContext.Provider>
  );
}
// ==========================================
// ETAPA 8: estilos
// ==========================================
const styles = StyleSheet.create({
  // --- LAYOUTS DE CONTAINER ---
  container: { 
    flex: 1, 
    backgroundColor: COLORS.background, 
    padding: 20 
  },
  containerCentro: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: COLORS.background,
    padding: 20
  },

  // --- TEXTOS E TÍTULOS ---
  tituloApp: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    color: COLORS.primary, 
    marginTop: 10,
    textAlign: 'center'
  },
  tituloSecao: { 
    fontSize: 22, 
    fontWeight: 'bold', 
    color: COLORS.text,
    marginBottom: 10
  },
  labelInput: {
    fontSize: 14,
    color: COLORS.textSoft,
    marginBottom: 5,
    fontWeight: '600',
    marginTop: 10
  },

  // --- CARTÕES E COMPONENTES VISUAIS ---
  cardSaldo: { 
    backgroundColor: COLORS.primary, 
    padding: 25, 
    borderRadius: 20, 
    marginBottom: 25,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 4, // Sombra para Android
    shadowColor: '#000', // Sombra para iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  txtSaldoG: { 
    color: '#FFF', 
    fontSize: 32, 
    fontWeight: 'bold' 
  },
  cardGastoG: { 
    flexDirection: 'row', 
    backgroundColor: COLORS.surface, 
    padding: 15, 
    borderRadius: 15, 
    marginBottom: 12, 
    alignItems: 'center', 
    borderWidth: 1, 
    borderColor: COLORS.border 
  },
  miniIconArea: {
    width: 45,
    height: 45,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center'
  },

  // --- INPUTS E FORMULÁRIOS ---
  areaInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 15,
    height: 55
  },
  inputLimpo: {
    flex: 1,
    height: '100%',
    color: COLORS.text,
    marginLeft: 10
  },
  inputGrande: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    marginBottom: 10,
    color: COLORS.text
  },

  // --- BOTÕES ---
  btnPrimario: { 
    backgroundColor: COLORS.primary, 
    padding: 18, 
    borderRadius: 12, 
    width: '100%', 
    alignItems: 'center',
    marginTop: 10,
    elevation: 2
  },
  txtBtn: { 
    color: '#FFF', 
    fontWeight: 'bold',
    fontSize: 16
  },
  btnOpcaoPerfil: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border
  },

  // --- CATEGORIAS (GRADE) ---
  gradeCategorias: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 10
  },
  itemCategoriaBtn: {
    width: '48%',
    backgroundColor: '#FFF',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 2,
    borderColor: 'transparent'
  },

  // --- PERFIL E AVATAR ---
  avatarGrande: { 
    width: 100, 
    height: 100, 
    borderRadius: 50, 
    backgroundColor: COLORS.primary, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 20,
    elevation: 5
  },

  // --- UTILITÁRIOS ---
  row: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 15 
  },
  areaVazia: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50
  },
  btnVerTudo: {
    padding: 5
  }
});