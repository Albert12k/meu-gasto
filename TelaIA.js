import React, { useContext, useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GastosContext } from './App'; // Consumindo do arquivo centralizador

const COLORS = {
  primary: '#4F46E5',
  background: '#F8FAFC',
  text: '#1E293B',
  textSoft: '#64748B',
  danger: '#F44336',
  border: '#E2E8F0'
};

export default function TelaIA() {
  // 🔥 LENDO TUDO DO CONTEXTO GLOBAL DO APP.JS (Sem states locais de armazenamento)
  const { 
    gastos, 
    ganhos, 
    carregandoGanhos, 
    adicionarGanhoGlobal, 
    editarGanhoGlobal, 
    excluirGanhoGlobal 
  } = useContext(GastosContext);

  const listaGastos = gastos || [];
  const listaGanhos = ganhos || [];

  const [inputGanho, setInputGanho] = useState('');
  const [dicaIA, setDicaIA] = useState("");

  // --- ESTADOS DO CHAT INTERATIVO ---
  const [mensagemUsuario, setMensagemUsuario] = useState('');
  const [isDigitando, setIsDigitando] = useState(false);
  const [mensagensChat, setMensagensChat] = useState([
    { id: '1', de: 'ia', texto: "Olá! Sou o assistente do Meu Gasto Fácil. Como posso te ajudar a controlar seus impulsos financeiros ou otimizar seu orçamento hoje?" }
  ]);

  // --- CÁLCULOS DE FLUXO ---
  const totalGanhos = listaGanhos.reduce((acc, item) => acc + (item.valor || 0), 0);
  const totalGasto = listaGastos.reduce((acc, item) => acc + (item.valor || 0), 0);
  const saldoReal = totalGanhos - totalGasto;

  const totalMovimentado = totalGanhos + totalGasto;
  const barraGanho = totalMovimentado > 0 ? (totalGanhos / totalMovimentado) * 100 : 50;
  const barraGasto = totalMovimentado > 0 ? (totalGasto / totalMovimentado) * 100 : 50;

  // --- EXTRATO AUTOMÁTICO UNIFICADO ---
  const historicoUnificado = [
    ...listaGanhos.map(g => ({ 
      id: g.id, tipo: 'ganho', descricao: 'Receita Declarada', data: g.data, valor: g.valor, cor: '#2E7D32', icone: 'arrow-up-circle', sortTime: g.sortTime 
    })),
    ...listaGastos.map(g => {
      const partes = (g.data || "").split('/');
      const timestampGasto = partes.length === 3 ? new Date(partes[2], partes[1] - 1, partes[0]).getTime() : 0;
      return {
        id: g.id, tipo: 'gasto', descricao: g.descricao || g.categoria || 'Gasto Registrado', data: g.data, emocional: g.emocional, valor: g.valor || 0, cor: '#C62828', icone: g.icone || 'arrow-down-circle', sortTime: timestampGasto
      };
    })
  ].sort((a, b) => b.sortTime - a.sortTime);

  // --- MOTOR DE DECISÃO DA DIRETRIZ FIXA ---
  useEffect(() => {
    const gastosPorCat = listaGastos.reduce((acc, item) => {
      const cat = item.categoria || "Outros";
      acc[cat] = (acc[cat] || 0) + (item.valor || 0);
      return acc;
    }, {});
    const lazerGasto = gastosPorCat["Lazer"] || 0;
    const porcentagemLazerNoSalario = totalGanhos > 0 ? (lazerGasto / totalGanhos) * 100 : 0;

    if (listaGastos.length === 0 && listaGanhos.length === 0) {
      setDicaIA("💡 Dica da IA: Adicione seus ganhos mensais acima e use nosso chat para entender como blindar sua mente contra compras por impulso!");
    } else if (totalGasto > totalGanhos) {
      setDicaIA("🚨 Alerta Crítico: Seus gastos ultrapassaram seus ganhos! Evite novas compras e priorize despesas essenciais.");
    } else if (porcentagemLazerNoSalario > 15) {
      setDicaIA(`⚠️ Análise Comportamental: Você direcionou ${porcentagemLazerNoSalario.toFixed(1)}% da sua renda para Lazer. Que tal testar nosso chat para ver dicas de contenção?`);
    } else {
      setDicaIA("💪 Treinador Financeiro: Ótimo ritmo! Balanceamento de caixa saudável. Continue registrando seus fluxos!");
    }
  }, [gastos, listaGanhos]);

  // Lidar com envio de novos Ganhos via Contexto
  const lidarAdicionarGanho = async () => {
    const valor = parseFloat(inputGanho.replace(',', '.'));
    if (!isNaN(valor) && valor > 0) {
      try {
        await adicionarGanhoGlobal(valor);
        setInputGanho('');
        Alert.alert("Sucesso", "Ganho registrado globalmente!");
      } catch (err) {
        Alert.alert("Erro", "Não foi possível adicionar o ganho.");
      }
    } else {
      Alert.alert("Erro", "Digite um valor válido.");
    }
  };

  // 🔥 MENU DE ALTERAÇÃO EXCLUSIVO PARA GANHOS (EDITAR OU DELETAR)
  const abrirGerenciadorGanho = (item) => {
    Alert.alert(
      "Gerenciar Receita",
      `O que deseja fazer com o registro de R$ ${item.valor.toFixed(2)}?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "✏️ Editar Valor",
          onPress: () => {
            Alert.prompt(
              "Editar Ganho",
              "Digite o novo valor numérico:",
              [
                { text: "Cancelar", style: "cancel" },
                {
                  text: "Salvar",
                  onPress: async (novoTexto) => {
                    const num = parseFloat(novoTexto.replace(',', '.'));
                    if (!isNaN(num) && num > 0) {
                      await editarGanhoGlobal(item.id, num);
                    } else {
                      Alert.alert("Erro", "Valor inválido digitado.");
                    }
                  }
                }
              ],
              "plain-text",
              item.valor.toString()
            );
          }
        },
        {
          text: "🗑️ Excluir",
          style: "destructive",
          onPress: async () => {
            await excluirGanhoGlobal(item.id);
          }
        }
      ]
    );
  };

  // --- LÓGICA DE PROCESSAMENTO DO CHAT ---
  const enviarMensagemChat = () => {
    if (mensagemUsuario.trim() === '') return;

    const novaMensagemUser = { id: Math.random().toString(), de: 'user', texto: mensagemUsuario };
    setMensagensChat(prev => [...prev, novaMensagemUser]);
    setMensagemUsuario('');
    setIsDigitando(true);

    let respostaIA = "Entendi o seu ponto. Mapear os fluxos no app nos ajuda a traçar diagnósticos perfeitos sobre o orçamento. Qual despesa mais te preocupa hoje?";

    setTimeout(() => {
      setMensagensChat(prev => [...prev, { id: Math.random().toString(), de: 'ia', texto: respostaIA }]);
      setIsDigitando(false);
    }, 1200);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
      {/* Cabeçalho */}
      <View style={styles.headerIA}>
        <Ionicons name="hardware-chip" size={38} color="#4F46E5" />
        <View style={{ marginLeft: 12 }}>
          <Text style={styles.tituloIA}>Gasto Fácil AI</Text>
          <Text style={styles.subtituloIA}>Inteligência Comportamental e Extrato</Text>
        </View>
      </View>

      {/* SEÇÃO 1: ADICIONAR GANHOS */}
      <View style={styles.cardInputGanho}>
        <Text style={styles.labelGanho}>💸 Adicionar Novo Ganho / Renda</Text>
        <View style={{ flexDirection: 'row', marginTop: 8 }}>
          <TextInput
            placeholder="R$ 0,00"
            placeholderTextColor="#999"
            keyboardType="numeric"
            value={inputGanho}
            onChangeText={setInputGanho}
            style={styles.inputGanhos}
          />
          <TouchableOpacity onPress={lidarAdicionarGanho} style={styles.btnApp}>
            <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 13 }}>Adicionar</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* SEÇÃO 2: RELATÓRIO GRÁFICO */}
      <View style={styles.cardGrafico}>
        <Text style={styles.tituloSecao}>📊 Balanço Mensal Recente</Text>
        <View style={styles.rowValores}>
          <Text style={{ color: '#2E7D32', fontWeight: 'bold' }}>Ganhos: R$ {totalGanhos.toFixed(2)}</Text>
          <Text style={{ color: '#C62828', fontWeight: 'bold' }}>Gastos: R$ {totalGasto.toFixed(2)}</Text>
        </View>
        <View style={styles.containerBarraGrafico}>
          <View style={[styles.barraGanhoVisual, { width: `${barraGanho}%` }]} />
          <View style={[styles.barraGastoVisual, { width: `${barraGasto}%` }]} />
        </View>
        <Text style={[styles.txtSaldo, { color: saldoReal >= 0 ? '#1E293B' : '#C62828' }]}>
          Saldo em Caixa: R$ {saldoReal.toFixed(2)}
        </Text>
      </View>

      {/* SEÇÃO 3: DIAGNÓSTICO ESTÁTICO */}
      <View style={styles.cardMensagem}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          <Ionicons name="analytics-outline" size={18} color="#4F46E5" />
          <Text style={{ fontWeight: 'bold', color: '#4F46E5', marginLeft: 6, fontSize: 13 }}>Diagnóstico Fixo do Painel</Text>
        </View>
        <Text style={styles.textoMensagem}>{dicaIA}</Text>
      </View>

      {/* 📝 SEÇÃO 4: EXTRATO INTEGRADO (GERENCIÁVEL) */}
      <View style={styles.cardExtrato}>
        <Text style={styles.tituloSecao}>📝 Extrato de Fluxo de Caixa</Text>
        <Text style={{ fontSize: 10, color: COLORS.textSoft, marginBottom: 10 }}>💡 Dica: Toque em uma receita para editar ou excluir.</Text>
        
        {carregandoGanhos ? (
          <ActivityIndicator size="small" color="#4F46E5" style={{ marginVertical: 15 }} />
        ) : historicoUnificado.length === 0 ? (
          <Text style={{ color: '#64748B', fontSize: 13, textAlign: 'center', marginVertical: 15 }}>Nenhuma movimentação encontrada.</Text>
        ) : (
          historicoUnificado.map((item) => (
            <TouchableOpacity 
              key={item.id} 
              style={styles.itemExtrato}
              onPress={() => item.tipo === 'ganho' && abrirGerenciadorGanho(item)}
              disabled={item.tipo !== 'ganho'} // Bloqueia interações que não sejam ganhos
            >
              <View style={styles.extratoLeft}>
                <Ionicons name={item.icone} size={22} color={item.cor} />
                <View style={{ marginLeft: 12 }}>
                  <Text style={styles.txtDescricaoExtrato}>{item.descricao}</Text>
                  <Text style={styles.txtDataExtrato}>{item.data} {item.emocional ? `• ${item.emocional}` : ''}</Text>
                </View>
              </View>
              
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={[styles.txtValorExtrato, { color: item.cor, marginRight: 4 }]}>
                  {item.tipo === 'ganho' ? '+' : '-'} R$ {item.valor.toFixed(2)}
                </Text>
                {item.tipo === 'ganho' && (
                  <Ionicons name="create-outline" size={14} color={COLORS.textSoft} style={{ marginLeft: 4 }} />
                )}
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>

      {/* 💬 SEÇÃO 5: CHAT BOT INTERATIVO COM A IA */}
      <View style={styles.cardChatContainer}>
        <Text style={styles.tituloSecao}>💬 Converse com a Inteligência Comportamental</Text>
        
        <View style={styles.areaMensagensChat}>
          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {mensagensChat.map((msg) => (
              <View key={msg.id} style={[styles.balaoMensagem, msg.de === 'user' ? styles.balaoUsuario : styles.balaoIA]}>
                <Text style={{ fontSize: 13, color: msg.de === 'user' ? '#FFF' : '#1E293B', lineHeight: 18 }}>
                  {msg.texto}
                </Text>
              </View>
            ))}
            {isDigitando && (
              <View style={[styles.balaoMensagem, styles.balaoIA, { flexDirection: 'row', alignItems: 'center' }]}>
                <ActivityIndicator size="small" color="#4F46E5" />
                <Text style={{ fontSize: 12, color: '#64748B', marginLeft: 6, fontStyle: 'italic' }}>Analisando...</Text>
              </View>
            )}
          </ScrollView>
        </View>

        <View style={styles.containerInputChat}>
          <TextInput
            placeholder="Pergunte algo para a inteligência..."
            placeholderTextColor="#A0AEC0"
            value={mensagemUsuario}
            onChangeText={setMensagemUsuario}
            style={styles.inputChatTexto}
          />
          <TouchableOpacity onPress={enviarMensagemChat} style={styles.btnEnviarChat}>
            <Ionicons name="send" size={16} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC', padding: 20 },
  headerIA: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, marginTop: 10 },
  tituloIA: { fontSize: 20, fontWeight: 'bold', color: '#1E293B' },
  subtituloIA: { fontSize: 11, color: '#64748B' },
  cardInputGanho: { backgroundColor: '#FFF', padding: 15, borderRadius: 14, marginBottom: 15, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
  labelGanho: { fontSize: 13, fontWeight: '600', color: '#475569' },
  inputGanhos: { flex: 1, backgroundColor: '#F1F5F9', borderRadius: 8, paddingHorizontal: 12, height: 40, fontSize: 14, color: '#1E293B' },
  btnApp: { backgroundColor: '#4F46E5', borderRadius: 8, paddingHorizontal: 15, justifyContent: 'center', marginLeft: 8, height: 40 },
  cardGrafico: { backgroundColor: '#FFF', padding: 16, borderRadius: 14, marginBottom: 15, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
  tituloSecao: { fontSize: 15, fontWeight: 'bold', color: '#1E293B', marginBottom: 5 },
  rowValores: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  containerBarraGrafico: { height: 16, borderRadius: 8, backgroundColor: '#F1F5F9', flexDirection: 'row', overflow: 'hidden', marginBottom: 12 },
  barraGanhoVisual: { backgroundColor: '#2E7D32', height: '100%' },
  barraGastoVisual: { backgroundColor: '#C62828', height: '100%' },
  txtSaldo: { textAlign: 'center', fontWeight: 'bold', fontSize: 14, marginTop: 4 },
  cardMensagem: { backgroundColor: '#EEF2FF', borderLeftWidth: 4, borderLeftColor: '#4F46E5', padding: 15, borderRadius: 12, marginBottom: 15 },
  textoMensagem: { fontSize: 13, color: '#312E81', lineHeight: 20, fontWeight: '500' },
  cardChatContainer: { backgroundColor: '#FFF', padding: 16, borderRadius: 14, marginBottom: 15, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
  areaMensagensChat: { backgroundColor: '#F8FAFC', borderRadius: 10, padding: 10, height: 220, marginBottom: 10, borderColor: '#EDF2F7', borderWidth: 1 },
  balaoMensagem: { padding: 10, borderRadius: 12, marginBottom: 8, maxWidth: '85%' },
  balaoUsuario: { backgroundColor: '#4F46E5', alignSelf: 'flex-end', borderBottomRightRadius: 0 },
  balaoIA: { backgroundColor: '#E2E8F0', alignSelf: 'flex-start', borderBottomLeftRadius: 0 },
  containerInputChat: { flexDirection: 'row', alignItems: 'center' },
  inputChatTexto: { flex: 1, backgroundColor: '#F1F5F9', borderRadius: 8, paddingHorizontal: 12, height: 40, fontSize: 12, color: '#1E293B' },
  btnEnviarChat: { backgroundColor: '#4F46E5', width: 40, height: 40, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginLeft: 8 },
  cardExtrato: { backgroundColor: '#FFF', padding: 16, borderRadius: 14, marginBottom: 15, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
  itemExtrato: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  extratoLeft: { flexDirection: 'row', alignItems: 'center' },
  txtDescricaoExtrato: { fontSize: 14, fontWeight: 'bold', color: '#1E293B' },
  txtDataExtrato: { fontSize: 11, color: '#64748B', marginTop: 2 },
  txtValorExtrato: { fontSize: 14, fontWeight: 'bold' }
});