import type { DiagramSchema, AIConfig } from '../types/diagram'
import { v4 as uuidv4 } from 'uuid'

// ─── System Prompt ────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `Você é um especialista em modelagem de bancos de dados conceituais e lógicos.
Sua única resposta deve ser um JSON válido seguindo EXATAMENTE a estrutura abaixo.
NÃO inclua markdown, blocos de código, explicações ou qualquer texto fora do JSON.
NÃO use \`\`\`json ou \`\`\` no início ou fim da resposta.

Estrutura obrigatória:
{
  "tables": [
    {
      "id": "uuid-único",
      "name": "NomeDaTabela",
      "attributes": [
        { "id": "uuid-único", "name": "id", "type": "INT", "isPrimaryKey": true, "isNotNull": true },
        { "id": "uuid-único", "name": "nomeAtributo", "type": "VARCHAR" }
      ],
      "position": { "x": 100, "y": 100 }
    }
  ],
  "relationships": [
    {
      "id": "uuid-único",
      "sourceTableId": "uuid-da-tabela-origem",
      "targetTableId": "uuid-da-tabela-destino",
      "sourceCardinality": "(0,n)", 
      "targetCardinality": "(1,1)",
      "label": "possui"
    }
  ]
}

Regras:
- Cada tabela DEVE ter pelo menos um campo "id" como PRIMARY KEY.
- Use UUIDs reais para todos os campos "id".
- Tipos válidos: INT, BIGINT, VARCHAR, TEXT, BOOLEAN, DATE, DATETIME, TIMESTAMP, DECIMAL, FLOAT, UUID, JSON.
- Cardinalidade: Use o padrão Merise/brModelo (mínimo, máximo).
  - A "sourceCardinality" deve indicar a participação da "sourceTableId" no relacionamento.
  - Exemplo: Se uma Pessoa (Source) possui muitos Endereços (Target), a "sourceCardinality" deve ser (0,n) ou (1,n).
- Espalhe as tabelas no grid: position x entre 50 e 1200, y entre 50 e 800, separadas por ao menos 280px entre si.
- Crie um banco completo e realista conforme pedido.`

// ─── Helpers ──────────────────────────────────────────────────────────────────

function injectUUIDs(schema: DiagramSchema): DiagramSchema {
  return {
    tables: schema.tables.map((t) => ({
      ...t,
      id: t.id || uuidv4(),
      attributes: (t.attributes || []).map((a) => ({ ...a, id: a.id || uuidv4() })),
      position: t.position || { x: 100, y: 100 },
    })),
    relationships: (schema.relationships || []).map((r) => ({
      ...r,
      id: r.id || uuidv4(),
      sourceCardinality: r.sourceCardinality || '(0,n)',
      targetCardinality: r.targetCardinality || '(1,n)',
    })),
  }
}

function parseJSONFromAI(raw: string): DiagramSchema {
  // Strip any accidental markdown fences
  const cleaned = raw
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim()

  const parsed = JSON.parse(cleaned)

  if (!Array.isArray(parsed.tables)) {
    throw new Error('JSON inválido: campo "tables" ausente ou não é um array.')
  }
  if (!Array.isArray(parsed.relationships)) {
    parsed.relationships = []
  }

  return injectUUIDs(parsed as DiagramSchema)
}

// ─── Providers ───────────────────────────────────────────────────────────────

async function callChatGPT(prompt: string, config: AIConfig): Promise<string> {
  const response = await fetch('/api-openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ],
      temperature: 0.3,
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`OpenAI API error: ${err}`)
  }

  const data = await response.json() as {
    choices: Array<{ message: { content: string } }>
  }
  return data.choices[0].message.content
}

async function callGemini(prompt: string, config: AIConfig): Promise<string> {
  const model = config.model || 'gemini-2.0-flash'
  const url = `/api-gemini/v1beta/models/${model}:generateContent?key=${config.apiKey}`

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: {
        parts: [{ text: SYSTEM_PROMPT }],
      },
      contents: [
        { role: 'user', parts: [{ text: prompt }] },
      ],
      generationConfig: {
        temperature: 0.3,
        responseMimeType: 'application/json',
      },
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`Gemini API error: ${err}`)
  }

  const data = await response.json() as {
    candidates: Array<{ content: { parts: Array<{ text: string }> } }>
  }
  return data.candidates[0].content.parts[0].text
}

async function callOllama(prompt: string, config: AIConfig): Promise<string> {
  const baseUrl = config.baseUrl || 'http://localhost:11434'
  const model = config.model || 'llama3'

  const response = await fetch(`${baseUrl}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ],
      stream: false,
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`Ollama API error: ${err}`)
  }

  const data = await response.json() as {
    message: { content: string }
  }
  return data.message.content
}

async function callOpenRouter(prompt: string, config: AIConfig): Promise<string> {
  const apiKey = config.apiKey?.trim()
  if (!apiKey) {
    throw new Error('API Key do OpenRouter está vazia.')
  }

  const response = await fetch('/api-openrouter/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': window.location.origin,
      'X-Title': 'HFModelo',
    },
    body: JSON.stringify({
      model: config.model || 'deepseek/deepseek-chat',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ],
      temperature: 0.3,
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    let parsedErr
    try {
      parsedErr = JSON.parse(err)
    } catch {
      parsedErr = err
    }
    throw new Error(`OpenRouter API error: ${typeof parsedErr === 'object' ? JSON.stringify(parsedErr) : parsedErr}`)
  }

  const data = await response.json() as {
    choices: Array<{ message: { content: string } }>
  }
  return data.choices[0].message.content
}

// ─── Main Entry Point ─────────────────────────────────────────────────────────

export async function generateDiagramFromPrompt(
  prompt: string,
  config: AIConfig
): Promise<DiagramSchema> {
  if (!config.apiKey && config.provider !== 'ollama') {
    throw new Error('API Key não configurada. Vá até as configurações e insira sua chave.')
  }

  let rawResponse: string

  switch (config.provider) {
    case 'chatgpt':
      rawResponse = await callChatGPT(prompt, config)
      break
    case 'gemini':
      rawResponse = await callGemini(prompt, config)
      break
    case 'openrouter':
      rawResponse = await callOpenRouter(prompt, config)
      break
    case 'ollama':
      rawResponse = await callOllama(prompt, config)
      break
    default:
      throw new Error(`Provedor desconhecido: ${config.provider}`)
  }

  return parseJSONFromAI(rawResponse)
}
