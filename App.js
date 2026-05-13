// ==========================================

// PARTE 1: CONFIGURAÇÕES E DADOS GLOBAIS

// ==========================================

import React, { useState, useEffect } from 'react';

import { 

  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, 

  Alert, KeyboardAvoidingView, Platform, StatusBar, Keyboard 

} from 'react-native';

import { NavigationContainer } from '@react-navigation/native';

import { createStackNavigator } from '@react-navigation/stack';

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { Ionicons } from '@expo/vector-icons';



const Stack = createStackNavigator();

const Tab = createBottomTabNavigator();



const COLORS = { 

  primary: '#0047AB', background: '#F8FAFC', surface: '#FFFFFF',

  text: '#1E293B', textSoft: '#64748B', danger: '#EF4444', 

  border: '#E2E8F0', success: '#10B981', accent: '#E0F2FE'

};



const CATEGORIAS = [

  { nome: 'Comida', icone: 'fast-food', cor: '#FF6B35' },

  { nome: 'Lazer', icone: 'game-controller', cor: '#9B59B6' },

  { nome: 'Mercado', icone: 'cart', cor: '#27AE60' },

  { nome: 'Transporte', icone: 'car', cor: '#2980B9' },

  { nome: 'Outros', icone: 'ellipsis-horizontal', cor: '#95A5A6' },

];



const MESES = [

  { label: 'Jan', valor: 0 }, { label: 'Fev', valor: 1 }, { label: 'Mar', valor: 2 },

  { label: 'Abr', valor: 3 }, { label: 'Mai', valor: 4 }, { label: 'Jun', valor: 5 },

  { label: 'Jul', valor: 6 }, { label: 'Ago', valor: 7 }, { label: 'Set', valor: 8 },

  { label: 'Out', valor: 9 }, { label: 'Nov', valor: 10 }, { label: 'Dez', valor: 11 }

];



// Dados iniciais do usuário e gastos

let gastosGlobais = [

  { id: '1', categoria: 'Lazer', valor: 50.00, data: '13/05/2026', icone: 'game-controller', cor: '#9B59B6', descricao: 'Cinema', emocional: 'Ansioso' },

];

let dadosUsuario = { nome: "Albert", email: "albert@estudante.com" }; //

// ==========================================

// PARTE 2: TELAS DE ACESSO

// ==========================================

function TelaLogin({ navigation }) {

  const [email, setEmail] = useState('');

  const [senha, setSenha] = useState('');



  const realizarLogin = () => {

    if (!email || !senha) return Alert.alert("Atenção", "Preencha todos os campos.");

    navigation.navigate('MainTabs');

  };



  return (

    <View style={styles.centered}>

      <View style={styles.logoCircle}><Ionicons name="wallet" size={50} color="white" /></View>

      <Text style={styles.tituloLogin}>Meu Gasto Fácil</Text>

      <TextInput style={styles.inputAcessivel} placeholder="E-mail" value={email} onChangeText={setEmail} keyboardType="email-address" />

      <TextInput style={styles.inputAcessivel} placeholder="Senha" value={senha} onChangeText={setSenha} secureTextEntry />

      <TouchableOpacity style={styles.btnPrimarioG} onPress={realizarLogin}><Text style={styles.btnTxtG}>ENTRAR</Text></TouchableOpacity>

      <View style={{flexDirection: 'row', marginTop: 20, gap: 20}}>

        <TouchableOpacity onPress={() => navigation.navigate('Cadastro')}><Text style={styles.linkTxt}>Criar conta</Text></TouchableOpacity>

      </View>

    </View>

  );

}



function TelaCadastro({ navigation }) {

  return (

    <View style={styles.centered}>

      <Text style={styles.secaoTituloG}>Nova Conta</Text>

      <TextInput style={styles.inputAcessivel} placeholder="Nome" />

      <TextInput style={styles.inputAcessivel} placeholder="E-mail" />

      <TextInput style={styles.inputAcessivel} placeholder="Senha" secureTextEntry />

      <TouchableOpacity style={styles.btnPrimarioG} onPress={() => navigation.goBack()}><Text style={styles.btnTxtG}>CADASTRAR</Text></TouchableOpacity>

    </View>

  );

}

// ==========================================

// PARTE 3: INÍCIO (DASHBOARD)

// ==========================================

function TelaHome({ navigation }) {

  const [gastos, setGastos] = useState([...gastosGlobais]);

  const [usuario, setUsuario] = useState({...dadosUsuario});



  useEffect(() => { 

    return navigation.addListener('focus', () => {

      setGastos([...gastosGlobais]);

      setUsuario({...dadosUsuario});

    }); 

  }, [navigation]);



  return (

    <View style={{ flex: 1, backgroundColor: COLORS.background }}>

      <ScrollView contentContainerStyle={{ padding: 20 }}>

        <Text style={styles.saudacao}>Olá, {usuario.nome} 👋</Text>

        <View style={styles.cardResumo}>

          <Text style={{color: 'white', opacity: 0.8}}>Gasto total acumulado</Text>

          <Text style={styles.txtSaldoG}>R$ {gastos.reduce((acc, i) => acc + i.valor, 0).toFixed(2)}</Text>

        </View>

        <TouchableOpacity style={styles.cardAcaoG} onPress={() => navigation.navigate("AdicionarGasto")}>

          <View style={styles.iconAcaoCircle}><Ionicons name="add" size={30} color={COLORS.primary} /></View>

          <Text style={styles.txtAcao}>Registrar novo gasto</Text>

        </TouchableOpacity>

        <Text style={styles.secaoTituloG}>Registros Recentes</Text>

        {gastos.slice().reverse().map(item => (

          <View key={item.id} style={styles.cardGastoG}>

            <View style={[styles.miniIconArea, {backgroundColor: item.cor + '15'}]}><Ionicons name={item.icone} size={22} color={item.cor} /></View>

            <View style={{flex: 1, marginLeft: 15}}><Text style={styles.txtItemNome}>{item.descricao || item.categoria}</Text><Text style={styles.txtItemData}>{item.data}</Text></View>

            <Text style={styles.txtItemValor}>R$ {item.valor.toFixed(2)}</Text>

          </View>

        ))}

      </ScrollView>

    </View>

  );

}

// ==========================================

// PARTE 4: FORMULÁRIO (DETALHES)

// ==========================================

function TelaAdicionarGasto({ navigation, route }) {

  const edicao = route.params?.gastoParaEditar;

  const [valor, setValor] = useState(edicao ? edicao.valor.toString() : '');

  const [categoria, setCategoria] = useState(edicao ? CATEGORIAS.find(c => c.nome === edicao.categoria) : null);

  const [data, setData] = useState(edicao ? edicao.data : new Date().toLocaleDateString('pt-BR'));

  const [descricao, setDescricao] = useState(edicao ? edicao.descricao : '');

  const [emocional, setEmocional] = useState(edicao ? edicao.emocional : 'Equilibrado');



  const salvar = () => {

    if (!valor || !categoria) return Alert.alert("Atenção", "Preencha valor e categoria.");

    const novo = { id: edicao ? edicao.id : Date.now().toString(), valor: parseFloat(valor.replace(',', '.')), categoria: categoria.nome, icone: categoria.icone, cor: categoria.cor, data, descricao, emocional };

    if (edicao) { gastosGlobais = gastosGlobais.map(g => g.id === edicao.id ? novo : g); }

    else { gastosGlobais = [novo, ...gastosGlobais]; }

    navigation.goBack(); 

  };



  const excluir = () => {

    Alert.alert("Excluir", "Deseja apagar?", [{ text: "Não" }, { text: "Sim", onPress: () => { gastosGlobais = gastosGlobais.filter(g => g.id !== edicao.id); navigation.goBack(); }}]);

  };



  return (

    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, backgroundColor: COLORS.surface }}>

      <ScrollView style={styles.formContainer} contentContainerStyle={{ paddingBottom: 80 }} keyboardShouldPersistTaps="handled">

        <Text style={styles.labelInput}>Valor do gasto</Text>

        <View style={styles.valorInputContainer}><Text style={styles.currencyPrefix}>R$</Text><TextInput style={styles.inputValorH} keyboardType="numeric" value={valor} onChangeText={setValor} placeholder="0,00" /></View>

        <Text style={styles.labelInput}>Sentimento</Text>

        <View style={styles.gridCat}>{[{t:'Ansioso', e:'😰', c:COLORS.danger}, {t:'Equilibrado', e:'😌', c:COLORS.success}, {t:'Triste', e:'😢', c:'#3B82F6'}, {t:'Feliz', e:'🤩', c:'#F59E0B'}].map(item => (

          <TouchableOpacity key={item.t} style={[styles.btnEmojiPill, emocional === item.t && { backgroundColor: item.c + '20', borderColor: item.c }]} onPress={() => {setEmocional(item.t); Keyboard.dismiss();}}><Text style={{fontSize: 22}}>{item.e}</Text><Text style={{fontSize: 10, fontWeight: 'bold'}}>{item.t}</Text></TouchableOpacity>

        ))}</View>

        <Text style={styles.labelInput}>Categoria</Text>

        <View style={styles.gridCat}>{CATEGORIAS.map(cat => (

          <TouchableOpacity key={cat.nome} style={[styles.btnCatNovo, categoria?.nome === cat.nome && { borderColor: cat.cor, backgroundColor: cat.cor + '10' }]} onPress={() => {setCategoria(cat); Keyboard.dismiss();}}><Ionicons name={cat.icone} size={22} color={categoria?.nome === cat.nome ? cat.cor : COLORS.textSoft} /><Text style={{fontSize: 12}}>{cat.nome}</Text></TouchableOpacity>

        ))}</View>

        <Text style={styles.labelInput}>Data e Descrição</Text>

        <TextInput style={styles.inputAcessivel} value={data} onChangeText={setData} />

        <TextInput style={styles.inputAcessivel} placeholder="O que você comprou?" value={descricao} onChangeText={setDescricao} />

        <TouchableOpacity style={styles.btnSalvarH} onPress={salvar}><Text style={styles.btnTxtG}>SALVAR REGISTRO</Text></TouchableOpacity>

        {edicao && <TouchableOpacity style={styles.btnExcluirH} onPress={excluir}><Text style={{color: COLORS.danger, fontWeight: 'bold'}}>EXCLUIR REGISTRO</Text></TouchableOpacity>}

      </ScrollView>

    </KeyboardAvoidingView>

  );

}

// ==========================================

// PARTE 5: HISTÓRICO

// ==========================================

function TelaRelatorios({ navigation }) {

  const [mesSelecionado, setMesSelecionado] = useState(new Date().getMonth());

  const [dados, setDados] = useState([]);

  const filtrarDados = () => { setDados(gastosGlobais.filter(g => parseInt(g.data.split('/')[1]) - 1 === mesSelecionado)); };

  useEffect(() => { const unsubscribe = navigation.addListener('focus', filtrarDados); filtrarDados(); return unsubscribe; }, [navigation, mesSelecionado]);



  return (

    <View style={{ flex: 1, backgroundColor: COLORS.background }}>

      <View style={styles.headerMeses}><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 15 }}>

        {MESES.map(m => (<TouchableOpacity key={m.valor} onPress={() => setMesSelecionado(m.valor)} style={[styles.btnMesPill, mesSelecionado === m.valor && styles.btnMesPillAtivo]}><Text style={{ fontWeight: 'bold', color: mesSelecionado === m.valor ? 'white' : COLORS.textSoft }}>{m.label}</Text></TouchableOpacity>))}

      </ScrollView></View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>

        <View style={styles.cardBrancoTotal}><Text style={styles.txtResumoMes}>Resumo Mensal</Text><Text style={styles.valorTotalMes}>R$ {dados.reduce((acc, c) => acc + c.valor, 0).toFixed(2)}</Text>

          {dados.length > 0 && CATEGORIAS.map(cat => {

            const vCat = dados.filter(g => g.categoria === cat.nome).reduce((acc, c) => acc + c.valor, 0);

            return vCat > 0 ? (<View key={cat.nome} style={{marginTop: 12}}><View style={styles.rowEspacada}><Text>{cat.nome}</Text><Text>R$ {vCat.toFixed(2)}</Text></View><View style={styles.progressoFundo}><View style={{height: '100%', width: `${(vCat/100)*100}%`, backgroundColor: cat.cor, borderRadius: 5}} /></View></View>) : null;

          })}

        </View>

        {dados.slice().reverse().map(item => (

          <TouchableOpacity key={item.id} style={styles.cardGastoG} onPress={() => navigation.navigate("AdicionarGasto", { gastoParaEditar: item })}><Ionicons name={item.icone} size={24} color={item.cor} /><View style={{flex: 1, marginLeft: 10}}><Text style={{fontWeight: 'bold'}}>{item.descricao || item.categoria}</Text><Text>{item.data}</Text></View><Text style={{fontWeight: 'bold'}}>R$ {item.valor.toFixed(2)}</Text></TouchableOpacity>

        ))}

      </ScrollView>

    </View>

  );

}

// ==========================================

// PARTE 6: PERFIL COM EDIÇÃO DE DADOS

// ==========================================

function TelaUsuario({ navigation }) {

  const [editando, setEditando] = useState(false);

  const [nome, setNome] = useState(dadosUsuario.nome);

  const [email, setEmail] = useState(dadosUsuario.email);



  const salvarAlteracoes = () => {

    if (!nome || !email) return Alert.alert("Erro", "Nome e e-mail são obrigatórios.");

    dadosUsuario.nome = nome;

    dadosUsuario.email = email;

    setEditando(false);

    Alert.alert("Sucesso", "Dados atualizados!");

  };



  return (

    <View style={{ flex: 1, backgroundColor: COLORS.background }}>

      <ScrollView contentContainerStyle={{ padding: 25, alignItems: 'center' }}>

        <View style={styles.avatarGrande}>

          <Text style={{color: 'white', fontSize: 48, fontWeight: 'bold'}}>{nome[0].toUpperCase()}</Text>

        </View>



        {!editando ? (

          <>

            <Text style={styles.perfilNome}>{nome}</Text>

            <Text style={styles.perfilEmail}>{email}</Text>

            <TouchableOpacity style={styles.btnEditarDados} onPress={() => setEditando(true)}>

              <Ionicons name="create-outline" size={20} color={COLORS.primary} />

              <Text style={{marginLeft: 8, color: COLORS.primary, fontWeight: 'bold'}}>EDITAR PERFIL</Text>

            </TouchableOpacity>

          </>

        ) : (

          <View style={{width: '100%', marginTop: 20}}>

            <Text style={styles.labelMinimo}>Nome</Text>

            <TextInput style={styles.inputAcessivel} value={nome} onChangeText={setNome} />

            <Text style={styles.labelMinimo}>E-mail</Text>

            <TextInput style={styles.inputAcessivel} value={email} onChangeText={setEmail} keyboardType="email-address" />

            <View style={{flexDirection: 'row', gap: 10, marginTop: 10}}>

              <TouchableOpacity style={[styles.btnPequeno, {backgroundColor: COLORS.success}]} onPress={salvarAlteracoes}>

                <Text style={{color: 'white', fontWeight: 'bold'}}>SALVAR</Text>

              </TouchableOpacity>

              <TouchableOpacity style={[styles.btnPequeno, {backgroundColor: COLORS.border}]} onPress={() => {setEditando(false); setNome(dadosUsuario.nome); setEmail(dadosUsuario.email);}}>

                <Text style={{color: COLORS.text, fontWeight: 'bold'}}>CANCELAR</Text>

              </TouchableOpacity>

            </View>

          </View>

        )}



        <View style={styles.cardOpcoes}>

          <TouchableOpacity style={styles.itemOpcao}>

            <Ionicons name="stats-chart-outline" size={22} color={COLORS.primary} />

            <Text style={styles.txtOpcao}>Total de Gastos: R$ {gastosGlobais.reduce((acc, i) => acc + i.valor, 0).toFixed(2)}</Text>

          </TouchableOpacity>

        </View>



        <TouchableOpacity style={styles.btnSairOutline} onPress={() => navigation.replace("Login")}>

          <Text style={styles.txtSairOutline}>SAIR DA CONTA</Text>

        </TouchableOpacity>

      </ScrollView>

    </View>

  );

}



function MainTabs() {

  return (

    <Tab.Navigator screenOptions={{ tabBarActiveTintColor: COLORS.primary, tabBarStyle: { height: 75, paddingBottom: 15, elevation: 10 } }}>

      <Tab.Screen name="Inicio" component={TelaHome} options={{ title: 'Início', tabBarIcon: ({color}) => <Ionicons name="grid" size={24} color={color}/> }} />

      <Tab.Screen name="Relatorios" component={TelaRelatorios} options={{ title: 'Histórico', tabBarIcon: ({color}) => <Ionicons name="stats-chart" size={24} color={color}/> }} />

      <Tab.Screen name="Perfil" component={TelaUsuario} options={{ title: 'Perfil', tabBarIcon: ({color}) => <Ionicons name="person" size={24} color={color}/> }} />

    </Tab.Navigator>

  );

}



export default function App() {

  return (

    <NavigationContainer>

      <Stack.Navigator screenOptions={{ headerTitleAlign: 'center', headerStyle: { elevation: 0 } }}>

        <Stack.Screen name="Login" component={TelaLogin} options={{ headerShown: false }} />

        <Stack.Screen name="Cadastro" component={TelaCadastro} options={{ title: 'Nova Conta' }} />

        <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />

        <Stack.Screen name="AdicionarGasto" component={TelaAdicionarGasto} options={{ title: 'Detalhes' }} />

      </Stack.Navigator>

    </NavigationContainer>

  );

}

// ==========================================

// PARTE 7: ESTILOS (UI/UX)

// ==========================================

const styles = StyleSheet.create({

  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30, backgroundColor: COLORS.surface },

  logoCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },

  tituloLogin: { fontSize: 28, fontWeight: 'bold', color: COLORS.text, marginBottom: 20 },

  saudacao: { fontSize: 22, fontWeight: 'bold', color: COLORS.text, marginBottom: 20 },

  inputAcessivel: { width: '100%', height: 60, backgroundColor: COLORS.background, borderRadius: 16, padding: 18, fontSize: 16, marginBottom: 15, borderWidth: 1, borderColor: COLORS.border },

  btnPrimarioG: { backgroundColor: COLORS.primary, height: 65, borderRadius: 18, width: '100%', justifyContent: 'center', alignItems: 'center', elevation: 5 },

  btnTxtG: { color: 'white', fontSize: 18, fontWeight: 'bold' },

  cardResumo: { backgroundColor: COLORS.primary, padding: 30, borderRadius: 24, width: '100%', elevation: 8 },

  txtSaldoG: { fontSize: 42, fontWeight: 'bold', color: 'white', marginTop: 5 },

  cardGastoG: { flexDirection: 'row', backgroundColor: COLORS.surface, padding: 16, borderRadius: 20, marginBottom: 12, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },

  miniIconArea: { width: 50, height: 50, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },

  txtItemNome: { fontWeight: 'bold', fontSize: 16, color: COLORS.text },

  txtItemData: { color: COLORS.textSoft, fontSize: 13 },

  txtItemValor: { fontWeight: 'bold', fontSize: 16, color: COLORS.text },

  formContainer: { flex: 1, padding: 20, backgroundColor: COLORS.surface },

  labelInput: { fontSize: 14, fontWeight: '700', marginTop: 25, color: COLORS.textSoft, textTransform: 'uppercase' },

  valorInputContainer: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 3, borderColor: COLORS.primary, paddingBottom: 10 },

  currencyPrefix: { fontSize: 30, fontWeight: 'bold', color: COLORS.primary, marginRight: 10 },

  inputValorH: { flex: 1, fontSize: 45, fontWeight: 'bold', color: COLORS.text },

  gridCat: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 15 },

  btnCatNovo: { width: '31%', padding: 15, borderRadius: 18, borderWidth: 2, borderColor: COLORS.border, alignItems: 'center', backgroundColor: COLORS.surface },

  btnEmojiPill: { width: '23%', padding: 10, borderRadius: 15, borderWidth: 2, borderColor: COLORS.border, alignItems: 'center' },

  btnSalvarH: { backgroundColor: COLORS.primary, height: 65, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginTop: 40 },

  btnExcluirH: { marginTop: 20, height: 60, alignItems: 'center', justifyContent: 'center', borderRadius: 20, borderWidth: 2, borderColor: COLORS.danger },

  headerMeses: { height: 80, backgroundColor: COLORS.surface, justifyContent: 'center', borderBottomWidth: 1, borderColor: COLORS.border },

  btnMesPill: { paddingHorizontal: 20, height: 40, justifyContent: 'center', borderRadius: 20, marginRight: 10, backgroundColor: COLORS.background },

  btnMesPillAtivo: { backgroundColor: COLORS.primary },

  cardBrancoTotal: { backgroundColor: COLORS.surface, padding: 25, borderRadius: 24, elevation: 4, borderWidth: 1, borderColor: COLORS.border, marginBottom: 20 },

  valorTotalMes: { fontSize: 36, fontWeight: 'bold', color: COLORS.primary, marginVertical: 10 },

  progressoFundo: { height: 10, backgroundColor: COLORS.border, borderRadius: 5, marginTop: 8, overflow: 'hidden' },

  avatarGrande: { width: 120, height: 120, borderRadius: 60, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', marginBottom: 15, elevation: 5 },

  perfilNome: { fontSize: 24, fontWeight: 'bold', color: COLORS.text },

  perfilEmail: { fontSize: 14, color: COLORS.textSoft, marginBottom: 15 },

  btnEditarDados: { flexDirection: 'row', alignItems: 'center', padding: 10 },

  btnPequeno: { padding: 12, borderRadius: 10, flex: 1, alignItems: 'center' },

  labelMinimo: { fontSize: 12, fontWeight: 'bold', color: COLORS.textSoft, marginBottom: 5, alignSelf: 'flex-start' },

  cardOpcoes: { width: '100%', backgroundColor: 'white', borderRadius: 20, padding: 10, borderWidth: 1, borderColor: COLORS.border, marginVertical: 20 },

  itemOpcao: { flexDirection: 'row', alignItems: 'center', padding: 15 },

  txtOpcao: { flex: 1, marginLeft: 15, fontSize: 16, color: COLORS.text },

  btnSairOutline: { width: '100%', height: 60, borderRadius: 15, borderWidth: 2, borderColor: COLORS.danger, justifyContent: 'center', alignItems: 'center', marginTop: 20 },

  txtSairOutline: { color: COLORS.danger, fontWeight: 'bold', fontSize: 16 },

  secaoTituloG: { fontSize: 20, fontWeight: 'bold', color: COLORS.text, marginVertical: 20 },

  cardAcaoG: { flexDirection: 'row', backgroundColor: COLORS.surface, padding: 20, borderRadius: 20, marginTop: 20, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border, borderStyle: 'dashed' },

  iconAcaoCircle: { width: 45, height: 45, borderRadius: 22, backgroundColor: COLORS.accent, justifyContent: 'center', alignItems: 'center' },

  txtAcao: { fontSize: 18, fontWeight: 'bold', marginLeft: 15, color: COLORS.primary },

  rowEspacada: { flexDirection: 'row', justifyContent: 'space-between' },

  linkTxt: { color: COLORS.primary, fontWeight: 'bold' }

});