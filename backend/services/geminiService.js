import { GoogleGenAI } from '@google/genai';
import 'dotenv/config';

//Inicializa o GEMINI com a chave do .env
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

//Escolha entre os modelos do GEMINI
const model = "gemini-3.5-flash-lite";

export async function analyzeRoutine(dados) {
    if (!process.env.GEMINI_API_KEY) {
        return {
            resumo: "A análise por IA ainda não está configurada.",
            pontosPositivos: [],
            pontosDeAtencao: [],
            recomendacao: "Configure a chave GEMINI_API_KEY no servidor.",
            metaSugerida: "Cadastre novos check-ins e conclua tarefas no prazo."
        };
    }

    const dadosJSON = JSON.stringify(dados, null, 2);
    const prompt = `
        Analise a rotina de um usuário usando somente os dados fornecidos.
        Os dados abrangem check-ins e tarefas dos últimos 30 dias.

        Identifique padrões de consistência, atraso e progresso.
        Não invente registros, hábitos ou tarefas que não existam nos dados.
        Retorne estritamente JSON, sem Markdown ou texto externo.

        O formato deve ser exatamente:
        {
          "resumo": "...",
          "pontosPositivos": ["..."],
          "pontosDeAtencao": ["..."],
          "recomendacao": "...",
          "metaSugerida": "..."
        }

        Use entre 20 e 55 palavras no campo resumo.
        Use frases curtas nos arrays.

        DADOS:
        ---
        ${dadosJSON}
        ---
    `;

    try {
        const response = await ai.models.generateContent({
            model,
            contents: prompt
        });
        const jsonText = String(response.text || '').trim()
            .replace(/^```(?:json)?\s*/i, '')
            .replace(/\s*```$/i, '');
        return JSON.parse(jsonText);
    } catch (error) {
        console.error("Erro na análise da rotina pelo Gemini:", error);
        return {
            resumo: "Não foi possível concluir a análise da rotina no momento.",
            pontosPositivos: [],
            pontosDeAtencao: [],
            recomendacao: "Tente novamente mais tarde.",
            metaSugerida: "Mantenha seus check-ins e tarefas atualizados."
        };
    }
}

async function resumirAvaliacoes(avaliacoes) {
    if (!avaliacoes || avaliacoes.length === 0) {
        return { tituloResumo: "Nenhuma avaliação encontrada.", comentarioResumo: "Seja o primeiro a avaliar este produto!" };
    }

    const avaliacoesJSON = JSON.stringify(avaliacoes, null, 2);

    const prompt = `
        Sua tarefa é resumir todas as avaliações de clientes em uma única avaliação, composta por título e comentário.
        Os clientes são do e-commerce e o produto avaliado é a "Bala 7 Belos". Siga as instruções abaixo:

        1º Crie um novo título único (mínimo duas palavras e máximo seis palavras) que capture o sentimento geral, o título deve resumir todos os títulos.
        2º Crie um novo comentário de resumo (máximo 50 palavras ou 255 caracteres) que sintetize as ideias dos comentários das avaliações e aponte os principais pontos positivos e negativos.

        Retorne o resultado estritamente em formato JSON, SEM NENHUM TEXTO ANTES OU DEPOIS. 
        É CRÍTICO QUE VOCÊ NÃO USE NENHUMA FORMATAÇÃO DE CÓDIGO MARKDOWN, INCLUINDO BLOCOS 'json'.
        O formato JSON deve ser: { "tituloResumo": "...", "comentarioResumo": "..." }

        AVALIAÇÕES A RESUMIR:
        ---
        ${avaliacoesJSON}
        ---
    `;

    try {
        const response = await ai.models.generateContent({
            model,
            contents: prompt
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText);
    } catch (error) {
        console.error("Erro na chamada da API Gemini:", error);
        return { tituloResumo: "Erro de IA", comentarioResumo: "Não foi possível gerar o resumo. Tente novamente mais tarde." };
    }
}

export default resumirAvaliacoes;