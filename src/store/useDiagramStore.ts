import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { v4 as uuidv4 } from 'uuid'
import type { Table, Relationship, DiagramSchema, Attribute, AIConfig } from '../types/diagram'

interface DiagramActions {
  // ── Schema Actions ─────────────────────────────────────────────────────────
  setSchema: (schema: DiagramSchema) => void
  clearDiagram: () => void

  // ── Table Actions ──────────────────────────────────────────────────────────
  addTable: (name?: string) => void
  updateTable: (id: string, updates: Partial<Omit<Table, 'id'>>) => void
  removeTable: (id: string) => void
  updateTablePosition: (id: string, position: { x: number; y: number }) => void

  // ── Attribute Actions ──────────────────────────────────────────────────────
  addAttribute: (tableId: string, attribute: Omit<Attribute, 'id'>) => void
  updateAttribute: (tableId: string, attributeId: string, updates: Partial<Attribute>) => void
  removeAttribute: (tableId: string, attributeId: string) => void

  // ── Relationship Actions ───────────────────────────────────────────────────
  addRelationship: (relationship: Omit<Relationship, 'id'>) => void
  updateRelationship: (id: string, updates: Partial<Omit<Relationship, 'id'>>) => void
  removeRelationship: (id: string) => void

  // ── AI Config ─────────────────────────────────────────────────────────────
  setAIConfig: (config: Partial<AIConfig>) => void
  setGenerating: (value: boolean) => void
  setError: (msg: string | null) => void
}

interface DiagramState {
  tables: Table[]
  relationships: Relationship[]
  aiConfig: AIConfig
  isGenerating: boolean
  error: string | null
}

type DiagramStore = DiagramState & DiagramActions

const DEFAULT_AI_CONFIG: AIConfig = {
  provider: 'gemini',
  apiKey: '',
  model: 'gemini-2.0-flash',
}

export const useDiagramStore = create<DiagramStore>()(
  persist(
    (set, get) => ({
      // ── Initial State ──────────────────────────────────────────────────────────
      tables: [],
      relationships: [],
      aiConfig: DEFAULT_AI_CONFIG,
      isGenerating: false,
      error: null,

      // ── Schema ────────────────────────────────────────────────────────────────
      setSchema: (schema) =>
        set({
          tables: schema.tables,
          relationships: schema.relationships,
          error: null,
        }),

      clearDiagram: () => set({ tables: [], relationships: [] }),

      // ── Tables ────────────────────────────────────────────────────────────────
      addTable: (name = 'NovaTabela') => {
        const { tables } = get()
        const offsetX = 100 + (tables.length % 4) * 320
        const offsetY = 80 + Math.floor(tables.length / 4) * 280

        const newTable: Table = {
          id: uuidv4(),
          name,
          attributes: [
            {
              id: uuidv4(),
              name: 'id',
              type: 'INT',
              isPrimaryKey: true,
              isNotNull: true,
            },
          ],
          position: { x: offsetX, y: offsetY },
        }
        set((s) => ({ tables: [...s.tables, newTable] }))
      },

      updateTable: (id, updates) =>
        set((s) => ({
          tables: s.tables.map((t) => (t.id === id ? { ...t, ...updates } : t)),
        })),

      removeTable: (id) =>
        set((s) => ({
          tables: s.tables.filter((t) => t.id !== id),
          relationships: s.relationships.filter(
            (r) => r.sourceTableId !== id && r.targetTableId !== id
          ),
        })),

      updateTablePosition: (id, position) =>
        set((s) => ({
          tables: s.tables.map((t) => (t.id === id ? { ...t, position } : t)),
        })),

      // ── Attributes ────────────────────────────────────────────────────────────
      addAttribute: (tableId, attribute) =>
        set((s) => ({
          tables: s.tables.map((t) =>
            t.id === tableId
              ? { ...t, attributes: [...t.attributes, { id: uuidv4(), ...attribute }] }
              : t
          ),
        })),

      updateAttribute: (tableId, attributeId, updates) =>
        set((s) => ({
          tables: s.tables.map((t) =>
            t.id === tableId
              ? {
                  ...t,
                  attributes: t.attributes.map((a) =>
                    a.id === attributeId ? { ...a, ...updates } : a
                  ),
                }
              : t
          ),
        })),

      removeAttribute: (tableId, attributeId) =>
        set((s) => ({
          tables: s.tables.map((t) =>
            t.id === tableId
              ? { ...t, attributes: t.attributes.filter((a) => a.id !== attributeId) }
              : t
          ),
        })),

      // ── Relationships ─────────────────────────────────────────────────────────
      addRelationship: (relationship) =>
        set((s) => ({
          relationships: [...s.relationships, { id: uuidv4(), ...relationship }],
        })),

      updateRelationship: (id, updates) =>
        set((s) => ({
          relationships: s.relationships.map((r) => (r.id === id ? { ...r, ...updates } : r)),
        })),

      removeRelationship: (id) =>
        set((s) => ({
          relationships: s.relationships.filter((r) => r.id !== id),
        })),

      // ── AI Config ─────────────────────────────────────────────────────────────
      setAIConfig: (config) =>
        set((s) => ({ aiConfig: { ...s.aiConfig, ...config } })),

      setGenerating: (value) => set({ isGenerating: value }),

      setError: (msg) => set({ error: msg }),
    }),
    {
      name: 'hf-modelo-storage',
      partialize: (state) => ({
        tables: state.tables,
        relationships: state.relationships,
        aiConfig: state.aiConfig,
      }),
    }
  )
)
