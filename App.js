// ==========================================
// PARTE 1: CONFIGURAÇÕES E IMPORTS DA API
// ==========================================
import React, { useState, useEffect, createContext, useContext } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, ScrollView, 
  Alert, ActivityIndicator, StatusBar, TextInput, FlatList 
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Firebase - Integração com sua API/Banco de dados
// Certifique-se que o arquivo firebaseConfig.js está na mesma pasta
import { auth, db } from './firebaseConfig'; 
import { onAuthStateChanged, signOut, signInWithEmailAndPassword } from 'firebase/auth';

// Inicialização do Contexto Global
const GastosContext = createContext();

// Identidade Visual do Projeto (Cores e Padrões)
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

// Configuração dos Meses para os Filtros do Resumo
const MESES = [
  { label: 'Jan', valor: 0 }, { label: 'Fev', valor: 1 }, { label: 'Mar', valor: 2 },
  { label: 'Abr', valor: 3 }, { label: 'Mai', valor: 4 }, { label: 'Jun', valor: 5 },
  { label: 'Jul', valor: 6 }, { label: 'Ago', valor: 7 }, { label: 'Set', valor: 8 },
  { label: 'Out', valor: 9 }, { label: 'Nov', valor: 10 }, { label: 'Dez', valor: 11 }
];

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
      .then(() => console.log("Sucesso"))
      .catch((error) => {
        setCarregando(false);
        Alert.alert("Erro de Acesso", "E-mail ou senha incorretos.");
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
            onChangeText={setEmail} 
            autoCapitalize="none" 
          />
        </View>

        <View style={styles.areaInput}>
          <Ionicons name="lock-closed-outline" size={20} color={COLORS.textSoft} />
          <TextInput 
            placeholder="Senha" 
            style={styles.inputLimpo} 
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
    if (!email || !senha) return Alert.alert("Erro", "Preencha tudo.");
    if (senha.length < 6) return Alert.alert("Erro", "Senha muito curta.");

    setCarregando(true);
    createUserWithEmailAndPassword(auth, email.trim(), senha)
      .then(() => Alert.alert("Sucesso", "Conta criada!"))
      .catch(() => {
        setCarregando(false);
        Alert.alert("Erro", "Não foi possível criar a conta.");
      });
  };

  return (
    <View style={styles.containerCentro}>
      <Text style={styles.tituloSecao}>Nova Conta</Text>
      <View style={{ width: '85%', marginTop: 20 }}>
        <View style={styles.areaInput}>
          <Ionicons name="mail-outline" size={20} color={COLORS.textSoft} />
          <TextInput placeholder="E-mail" style={styles.inputLimpo} onChangeText={setEmail} autoCapitalize="none" />
        </View>
        <View style={styles.areaInput}>
          <Ionicons name="lock-closed-outline" size={20} color={COLORS.textSoft} />
          <TextInput placeholder="Senha" style={styles.inputLimpo} secureTextEntry onChangeText={setSenha} />
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
        Alert.alert("E-mail enviado", "Verifique sua caixa de entrada.");
        navigation.goBack();
      })
      .catch(() => {
        setCarregando(false);
        Alert.alert("Erro", "E-mail não encontrado.");
      });
  };

  return (
    <View style={styles.containerCentro}>
      <Text style={styles.tituloSecao}>Recuperar Acesso</Text>
      <View style={{ width: '85%', marginTop: 20 }}>
        <View style={styles.areaInput}>
          <Ionicons name="mail-outline" size={20} color={COLORS.textSoft} />
          <TextInput placeholder="E-mail" style={styles.inputLimpo} onChangeText={setEmail} autoCapitalize="none" />
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
// ETAPA 3: TELA DE INÍCIO (HOME)
// ==========================================
function TelaHome({ navigation }) {
  const { gastos } = useContext(GastosContext);
  
  // Proteção para garantir que 'gastos' seja sempre um array antes de processar
  const lista = gastos || []; 

  // Cálculo do Saldo Total usando a API de redução do JavaScript
  const totalGasto = lista.reduce((acc, item) => acc + (item.valor || 0), 0);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <StatusBar barStyle="dark-content" />
      
      {/* Card Principal de Saldo */}
      <View style={styles.cardSaldo}>
        <View>
          <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14 }}>Gasto Total Acumulado</Text>
          <Text style={styles.txtSaldoG}>R$ {totalGasto.toFixed(2)}</Text>
        </View>
        <Ionicons name="trending-down" size={40} color="rgba(255,255,255,0.3)" />
      </View>

      {/* Cabeçalho da Seção de Recentes */}
      <View style={styles.row}>
        <Text style={styles.tituloSecao}>Atividades Recentes</Text>
        <TouchableOpacity 
          style={styles.btnVerTudo} 
          onPress={() => navigation.navigate('Histórico')}
        >
          <Text style={{ color: COLORS.primary, fontWeight: '600' }}>Ver Tudo</Text>
        </TouchableOpacity>
      </View>

      {/* Lista de Últimos 5 Gastos */}
      {lista.length === 0 ? (
        <View style={styles.areaVaziaHome}>
          <Ionicons name="receipt-outline" size={40} color={COLORS.border} />
          <Text style={{ color: COLORS.textSoft, marginTop: 10 }}>Nenhum gasto encontrado.</Text>
        </View>
      ) : (
        lista.slice().reverse().slice(0, 5).map((item) => (
          <View key={item.id} style={styles.cardGastoG}>
            <View style={[styles.miniIconArea, { backgroundColor: (item.cor || '#CCC') + '20' }]}>
              <Ionicons name={item.icone || 'cash-outline'} size={22} color={item.cor || COLORS.textSoft} />
            </View>
            
            <View style={{ flex: 1, marginLeft: 15 }}>
              <Text style={{ fontWeight: 'bold', color: COLORS.text, fontSize: 16 }}>
                {item.descricao || item.categoria}
              </Text>
              <Text style={{ color: COLORS.textSoft, fontSize: 12 }}>
                {item.data} • {item.emocional || 'Neutro'}
              </Text>
            </View>

            <Text style={{ fontWeight: 'bold', color: COLORS.danger, fontSize: 16 }}>
              - R$ {item.valor.toFixed(2)}
            </Text>
          </View>
        ))
      )}

      {/* Botão Flutuante de Atalho (Opcional) */}
      <TouchableOpacity 
        style={styles.fabHome}
        onPress={() => navigation.navigate('AdicionarGasto')}
      >
        <Ionicons name="add" size={30} color="#FFF" />
      </TouchableOpacity>
      
      <View style={{ height: 100 }} /> 
    </ScrollView>
  );
}
// ==========================================
// ETAPA 4: TELA DE ADICIONAR / EDITAR GASTO
// ==========================================
function TelaAdicionarGasto({ route, navigation }) {
  const { setGastos } = useContext(GastosContext);
  
  // Verifica se recebemos um gasto para editar da Tela de Histórico
  const gastoParaEditar = route.params?.gastoParaEditar;

  // Estados do formulário iniciando com os dados do gasto (se for edição) ou vazios
  const [descricao, setDescricao] = useState(gastoParaEditar?.descricao || '');
  const [valor, setValor] = useState(gastoParaEditar?.valor?.toString() || '');
  const [categoriaSel, setCategoriaSel] = useState(
    gastoParaEditar 
      ? CATEGORIAS.find(c => c.nome === gastoParaEditar.categoria) 
      : CATEGORIAS[0]
  );
  const [carregando, setCarregando] = useState(false);

  const salvarGasto = () => {
    if (!descricao || !valor) {
      return Alert.alert("Atenção", "Preencha a descrição e o valor.");
    }

    setCarregando(true);

    const dadosGasto = {
      id: gastoParaEditar ? gastoParaEditar.id : Math.random().toString(36).substring(7),
      descricao: descricao,
      valor: parseFloat(valor.replace(',', '.')),
      categoria: categoriaSel.nome,
      icone: categoriaSel.icone,
      cor: categoriaSel.cor,
      data: gastoParaEditar ? gastoParaEditar.data : new Date().toLocaleDateString('pt-BR'),
      emocional: 'Consciente',
      userId: auth.currentUser?.uid
    };

    setTimeout(() => {
      if (gastoParaEditar) {
        // Lógica de Edição: substitui o item antigo pelo novo na lista
        setGastos(prev => prev.map(item => item.id === gastoParaEditar.id ? dadosGasto : item));
      } else {
        // Lógica de Cadastro: adiciona um novo item à lista
        setGastos(prev => [...prev, dadosGasto]);
      }
      
      setCarregando(false);
      Alert.alert("Sucesso", gastoParaEditar ? "Gasto atualizado!" : "Gasto registrado!");
      navigation.goBack();
    }, 600);
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.tituloSecao}>
        {gastoParaEditar ? "Editar Lançamento" : "O que você comprou?"}
      </Text>
      
      <View style={{ marginTop: 20 }}>
        <Text style={styles.labelInput}>Descrição</Text>
        <TextInput 
          placeholder="Ex: Mercado" 
          style={styles.inputGrande}
          value={descricao}
          onChangeText={setDescricao}
        />

        <Text style={styles.labelInput}>Valor (R$)</Text>
        <TextInput 
          placeholder="0,00" 
          style={styles.inputGrande}
          keyboardType="numeric"
          value={valor}
          onChangeText={setValor}
        />

        <Text style={styles.labelInput}>Categoria</Text>
        <View style={styles.gradeCategorias}>
          {CATEGORIAS.map((cat) => (
            <TouchableOpacity 
              key={cat.nome}
              onPress={() => setCategoriaSel(cat)}
              style={[
                styles.itemCategoriaBtn,
                categoriaSel.nome === cat.nome && { 
                  borderColor: cat.cor, 
                  backgroundColor: cat.cor + '15' 
                }
              ]}
            >
              <Ionicons 
                name={cat.icone} 
                size={22} 
                color={categoriaSel.nome === cat.nome ? cat.cor : COLORS.textSoft} 
              />
              <Text style={{ 
                fontSize: 11, 
                marginTop: 4,
                fontWeight: categoriaSel.nome === cat.nome ? 'bold' : 'normal',
                color: categoriaSel.nome === cat.nome ? cat.cor : COLORS.textSoft 
              }}>
                {cat.nome}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity 
          style={[styles.btnPrimario, { marginTop: 30 }]}
          onPress={salvarGasto}
          disabled={carregando}
        >
          {carregando ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.txtBtn}>
              {gastoParaEditar ? "Atualizar Registro" : "Salvar Gasto"}
            </Text>
          )}
        </TouchableOpacity>

        {gastoParaEditar && (
          <TouchableOpacity 
            style={{ marginTop: 15, alignItems: 'center' }}
            onPress={() => navigation.goBack()}
          >
            <Text style={{ color: COLORS.danger }}>Cancelar Edição</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}
// ==========================================
// ETAPA 5: TELA DE HISTÓRICO (GESTÃO DE DADOS)
// ==========================================
function TelaHistorico({ navigation }) {
  const { gastos, setGastos } = useContext(GastosContext);
  const dados = gastos || [];

  // Função para deletar um registro com confirmação
  const confirmarExclusao = (id) => {
    Alert.alert(
      "Excluir Registro",
      "Tem certeza que deseja apagar este gasto?",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Excluir", 
          style: "destructive", 
          onPress: () => {
            const novaLista = dados.filter(item => item.id !== id);
            setGastos(novaLista);
            // Aqui você chamaria a API deleteDoc do Firebase no futuro
          } 
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.tituloSecao}>Gerenciar Lançamentos</Text>
      
      {dados.length === 0 ? (
        <View style={styles.areaVazia}>
          <Ionicons name="receipt-outline" size={50} color={COLORS.border} />
          <Text style={{ color: COLORS.textSoft, marginTop: 10 }}>Nenhum dado para exibir.</Text>
        </View>
      ) : (
        <FlatList 
          data={dados.slice().reverse()}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View style={styles.cardGastoG}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: 'bold', color: COLORS.text }}>{item.descricao || item.categoria}</Text>
                <Text style={{ color: COLORS.textSoft, fontSize: 12 }}>{item.data} • R$ {item.valor.toFixed(2)}</Text>
              </View>

              {/* Botões de Ação */}
              <View style={{ flexDirection: 'row', gap: 15 }}>
                <TouchableOpacity 
                  onPress={() => navigation.navigate('AdicionarGasto', { gastoParaEditar: item })}
                >
                  <Ionicons name="create-outline" size={24} color={COLORS.primary} />
                </TouchableOpacity>

                <TouchableOpacity onPress={() => confirmarExclusao(item.id)}>
                  <Ionicons name="trash-outline" size={24} color={COLORS.danger} />
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}
// ==========================================
// ETAPA 6: TELA DE PERFIL COM EDIÇÃO
// ==========================================
function TelaPerfil() {
  const { setGastos } = useContext(GastosContext);
  
  // Estados para os dados editáveis do perfil (Personalize conforme sua área)
  const [editando, setEditando] = useState(false);
  const [nome, setNome] = useState("Albert"); 
  const [cargo, setCargo] = useState("Desenvolvedor");
  const [funcao, setFuncao] = useState("Analista de Finanças");

  const fazerLogout = () => {
    Alert.alert(
      "Sair da Conta", 
      "Deseja realmente encerrar sua sessão?", 
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Sair", 
          style: "destructive", 
          onPress: () => {
            signOut(auth)
              .then(() => {
                setGastos([]); // Limpa o estado global por segurança
              })
              .catch(() => {
                Alert.alert("Erro", "Não foi possível sair.");
              });
          }
        }
      ]
    );
  };

  const salvarAlteracoes = () => {
    setEditando(false);
    Alert.alert("Sucesso", "Seu perfil foi atualizado!");
  };

  return (
    <ScrollView contentContainerStyle={styles.containerCentro}>
      <StatusBar barStyle="dark-content" />

      {/* Avatar Dinâmico */}
      <View style={styles.avatarGrande}>
        <Text style={{ color: '#FFF', fontSize: 40, fontWeight: 'bold' }}>
          {nome ? nome[0].toUpperCase() : 'U'}
        </Text>
      </View>

      {editando ? (
        // --- MODO EDIÇÃO ---
        <View style={{ width: '100%', marginTop: 10 }}>
          <Text style={styles.labelInput}>Nome Completo</Text>
          <TextInput 
            style={styles.inputGrande} 
            value={nome} 
            onChangeText={setNome} 
            placeholder="Seu nome"
          />
          
          <Text style={styles.labelInput}>Cargo / Área</Text>
          <TextInput 
            style={styles.inputGrande} 
            value={cargo} 
            onChangeText={setCargo} 
            placeholder="Ex: Estudante"
          />
          
          <Text style={styles.labelInput}>Função Adicional</Text>
          <TextInput 
            style={styles.inputGrande} 
            value={funcao} 
            onChangeText={setFuncao} 
            placeholder="Ex: Técnico"
          />

          <TouchableOpacity style={styles.btnPrimario} onPress={salvarAlteracoes}>
            <Text style={styles.txtBtn}>Salvar Alterações</Text>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={() => setEditando(false)} style={{ marginTop: 15 }}>
            <Text style={{ color: COLORS.danger, textAlign: 'center', fontWeight: '600' }}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      ) : (
        // --- MODO VISUALIZAÇÃO ---
        <View style={{ alignItems: 'center', width: '100%' }}>
          <Text style={styles.tituloSecao}>{nome}</Text>
          <Text style={{ color: COLORS.textSoft, fontSize: 16 }}>{cargo}</Text>
          <Text style={{ color: COLORS.primary, fontWeight: '600', marginTop: 2 }}>{funcao}</Text>
          
          <View style={{ 
            backgroundColor: COLORS.border + '30', 
            padding: 8, 
            borderRadius: 8, 
            marginTop: 10 
          }}>
            <Text style={{ color: COLORS.textSoft, fontSize: 12 }}>{auth.currentUser?.email}</Text>
          </View>

          <View style={{ width: '100%', marginTop: 35 }}>
            <TouchableOpacity style={styles.btnOpcaoPerfil} onPress={() => setEditando(true)}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="create-outline" size={22} color={COLORS.text} />
                <Text style={{ marginLeft: 15, color: COLORS.text, fontWeight: '500' }}>Editar Perfil</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={COLORS.border} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.btnPrimario, { backgroundColor: COLORS.danger, marginTop: 25 }]} 
              onPress={fazerLogout}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="log-out-outline" size={20} color="#FFF" style={{ marginRight: 10 }} />
                <Text style={styles.txtBtn}>Sair do Aplicativo</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ScrollView>
  );
}
// ==========================================
// ETAPA 7: NAVEGAÇÃO E MONITOR DE ESTADO
// ==========================================

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
        options={{ tabBarIcon: ({color}) => <Ionicons name="home-outline" size={24} color={color}/> }}
      />
      <Tab.Screen 
        name="Histórico" 
        component={TelaHistorico} 
        options={{ tabBarIcon: ({color}) => <Ionicons name="list-outline" size={24} color={color}/> }}
      />
      <Tab.Screen 
        name="Perfil" 
        component={TelaPerfil} 
        options={{ tabBarIcon: ({color}) => <Ionicons name="person-outline" size={24} color={color}/> }}
      />
    </Tab.Navigator>
  );
}

// ==========================================
// ETAPA 7.2: FUNÇÃO PRINCIPAL DO APLICATIVO
// ==========================================
export default function App() {
  const [user, setUser] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [gastos, setGastos] = useState([]); // Estado global dos lançamentos

  // Vigia da API - Monitora o estado de login no Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (usuarioLogado) => {
      setUser(usuarioLogado);
      setCarregando(false);
    });
    return unsubscribe; 
  }, []);

  // Tela de carregamento enquanto o Firebase responde
  if (carregando) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#6200EE" />
      </View>
    );
  }

  return (
    <GastosContext.Provider value={{ gastos, setGastos }}>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerTitleAlign: 'center' }}>
          {user ? (
            // Grupo de Telas LOGADO
            <>
              <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
              <Stack.Screen name="AdicionarGasto" component={TelaAdicionarGasto} options={{ title: 'Gerenciar Gasto' }} />
            </>
          ) : (
            // Grupo de Telas DESLOGADO
            <>
              <Stack.Screen name="Login" component={TelaLogin} options={{ headerShown: false }} />
              <Stack.Screen name="Cadastro" component={TelaCadastro} options={{ title: 'Criar Conta' }} />
              <Stack.Screen name="EsqueciSenha" component={TelaEsqueciSenha} options={{ title: 'Recuperar Acesso' }} />
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