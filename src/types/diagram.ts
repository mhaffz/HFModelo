// ─── Core Data Model ─────────────────────────────────────────────────────────

export type AttributeType =
  | 'INT'
  | 'BIGINT'
  | 'SMALLINT'
  | 'DECIMAL'
  | 'FLOAT'
  | 'BOOLEAN'
  | 'VARCHAR'
  | 'TEXT'
  | 'CHAR'
  | 'DATE'
  | 'DATETIME'
  | 'TIMESTAMP'
  | 'UUID'
  | 'JSON'
  | string

export interface Attribute {
  id: string
  name: string
  type: AttributeType
  isPrimaryKey?: boolean
  isForeignKey?: boolean
  isNotNull?: boolean
  isUnique?: boolean
  defaultValue?: string
}

export interface TablePosition {
  x: number
  y: number
}

export interface Table {
  id: string
  name: string
  attributes: Attribute[]
  position: TablePosition
}

export interface Relationship {
  id: string
  sourceTableId: string
  targetTableId: string
  sourceCardinality: string // e.g., "(0,n)"
  targetCardinality: string // e.g., "(1,1)"
  label?: string
}

export interface DiagramSchema {
  tables: Table[]
  relationships: Relationship[]
}

export interface Workspace {
  id: string
  name: string
  tables: Table[]
  relationships: Relationship[]
  createdAt: number
  updatedAt: number
}


// ─── AI Service Types ─────────────────────────────────────────────────────────

export type AIProvider = 'chatgpt' | 'gemini' | 'ollama' | 'openrouter'

export interface AIConfig {
  provider: AIProvider
  apiKey?: string
  model?: string
  baseUrl?: string // for Ollama
}

// ─── UI State Types ───────────────────────────────────────────────────────────

export type PanelTab = 'ai' | 'tables' | 'settings'
