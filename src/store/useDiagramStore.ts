import { create } from 'zustand'
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware'
import { v4 as uuidv4 } from 'uuid'
import { get, set as idbSet, del } from 'idb-keyval'
import type { Table, Relationship, DiagramSchema, Attribute, AIConfig, Workspace, ChatMessage } from '../types/diagram'

// ── IndexedDB Storage ────────────────────────────────────────────────────────
const idbStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    return (await get(name)) || null
  },
  setItem: async (name: string, value: string): Promise<void> => {
    await idbSet(name, value)
  },
  removeItem: async (name: string): Promise<void> => {
    await del(name)
  },
}


interface DiagramActions {
  // ── Workspace Actions ──────────────────────────────────────────────────────
  createWorkspace: (name: string) => void
  switchWorkspace: (id: string) => void
  renameWorkspace: (id: string, newName: string) => void
  deleteWorkspace: (id: string) => void

  // ── Schema Actions ─────────────────────────────────────────────────────────
  setSchema: (schema: DiagramSchema) => void
  appendSchema: (schema: DiagramSchema, panOffset?: { x: number; y: number }) => void

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
  setAiSettingsOpen: (open: boolean) => void
  setTheme: (theme: 'light' | 'dark') => void
  setChatMessages: (messages: ChatMessage[]) => void
  setDiagramType: (type: 'hfmodelo' | 'conceptual' | 'logical') => void
  setConceptualDiagram: (nodes: any[], edges: any[]) => void
  updateConceptualNodePosition: (id: string, position: { x: number; y: number }) => void
}

interface DiagramState {
  tables: Table[]
  relationships: Relationship[]
  aiConfig: AIConfig
  isGenerating: boolean
  error: string | null
  activeWorkspaceId: string | null
  workspaces: Workspace[]
  isAiSettingsOpen: boolean
  theme: 'light' | 'dark'
  chatMessages: ChatMessage[]
  diagramType: 'hfmodelo' | 'conceptual' | 'logical'
  conceptualNodes: any[]
  conceptualEdges: any[]
}


type DiagramStore = DiagramState & DiagramActions

const DEFAULT_AI_CONFIG: AIConfig = {
  provider: 'gemini',
  apiKey: '',
  model: 'gemini-2.0-flash',
}

const syncWorkspace = (state: Partial<DiagramState> & DiagramState): Partial<DiagramState> => {
  if (!state.activeWorkspaceId || !state.workspaces) return state;
  const workspaces = state.workspaces.map(w =>
    w.id === state.activeWorkspaceId
      ? { 
          ...w, 
          tables: state.tables, 
          relationships: state.relationships, 
          chatHistory: state.chatMessages,
          updatedAt: Date.now() 
        }
      : w
  );
  return { ...state, workspaces };
}

export const useDiagramStore = create<DiagramStore>()(
  persist(
    (set, get) => {
      // Custom set function to auto-sync workspaces
      const setWithSync = (fn: (state: DiagramStore) => Partial<DiagramStore>) => {
        set((state) => {
          const updates = fn(state);
          // If tables, relationships, or chat messages are updated, sync them to the active workspace
          if (updates.tables || updates.relationships || updates.chatMessages || updates.conceptualNodes || updates.conceptualEdges) {
            return syncWorkspace({ ...state, ...updates } as any);
          }
          return updates;
        });
      };

      return {
        // ── Initial State ──────────────────────────────────────────────────────────
        tables: [],
        relationships: [],
        aiConfig: DEFAULT_AI_CONFIG,
        isGenerating: false,
        error: null,
        isAiSettingsOpen: false,
        activeWorkspaceId: null,
        workspaces: [],
        theme: (typeof window !== 'undefined' && localStorage.getItem('hf-theme') as 'light' | 'dark') || 'light',
        chatMessages: [],
        diagramType: 'hfmodelo',
        conceptualNodes: [],
        conceptualEdges: [],

        // ── Workspaces ────────────────────────────────────────────────────────────
        createWorkspace: (name: string) => {
          const id = uuidv4();
          const newWorkspace: Workspace = {
            id,
            name,
            tables: [],
            relationships: [],
            chatHistory: [
              {
                id: '1',
                role: 'assistant',
                content: 'Olá, sou o HFZinho! Seu assistente de banco de dados. Como posso ajudar você a modelar hoje?',
              },
            ],
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };
          set((s) => ({
            workspaces: [...s.workspaces, newWorkspace],
            activeWorkspaceId: id,
            tables: [],
            relationships: [],
            chatMessages: newWorkspace.chatHistory,
          }));
        },

        switchWorkspace: (id: string) => {
          const workspace = get().workspaces.find((w) => w.id === id);
          if (workspace) {
            set({
              activeWorkspaceId: id,
              tables: workspace.tables,
              relationships: workspace.relationships,
              chatMessages: workspace.chatHistory || [
                {
                  id: '1',
                  role: 'assistant',
                  content: 'Olá, sou o HFZinho! Seu assistente de banco de dados. Como posso ajudar você a modelar hoje?',
                },
              ],
              error: null,
            });
          }
        },

        renameWorkspace: (id: string, newName: string) => {
          set((s) => ({
            workspaces: s.workspaces.map((w) =>
              w.id === id ? { ...w, name: newName, updatedAt: Date.now() } : w
            ),
          }));
        },

        deleteWorkspace: (id: string) => {
          const { workspaces, activeWorkspaceId } = get();
          const newWorkspaces = workspaces.filter((w) => w.id !== id);
          
          if (activeWorkspaceId === id) {
            const nextWorkspace = newWorkspaces[0];
            if (nextWorkspace) {
              set({
                workspaces: newWorkspaces,
                activeWorkspaceId: nextWorkspace.id,
                tables: nextWorkspace.tables,
                relationships: nextWorkspace.relationships,
                chatMessages: nextWorkspace.chatHistory || [],
              });
            } else {
              set({
                workspaces: [],
                activeWorkspaceId: null,
                tables: [],
                relationships: [],
                chatMessages: [],
              });
            }
          } else {
            set({ workspaces: newWorkspaces });
          }
        },

        // ── Schema ────────────────────────────────────────────────────────────────
        setSchema: (schema) =>
          setWithSync(() => ({
            tables: schema.tables,
            relationships: schema.relationships,
            error: null,
          })),

        appendSchema: (schema, panOffset) =>
          setWithSync((s) => {
            const tableIdMap: Record<string, string> = {}
            
            let minX = Infinity
            let minY = Infinity
            schema.tables.forEach((t) => {
              if (t.position.x < minX) minX = t.position.x
              if (t.position.y < minY) minY = t.position.y
            })
            if (minX === Infinity) minX = 0
            if (minY === Infinity) minY = 0

            const newTables = schema.tables.map((t) => {
              const newId = uuidv4()
              tableIdMap[t.id] = newId
              return {
                ...t,
                id: newId,
                attributes: t.attributes.map((a) => ({ ...a, id: uuidv4() })),
                position: panOffset
                  ? {
                      x: t.position.x - minX + panOffset.x,
                      y: t.position.y - minY + panOffset.y,
                    }
                  : t.position,
              }
            })

            const newRelationships = schema.relationships.map((r) => ({
              ...r,
              id: uuidv4(),
              sourceTableId: tableIdMap[r.sourceTableId] || r.sourceTableId,
              targetTableId: tableIdMap[r.targetTableId] || r.targetTableId,
            }))

            return {
              tables: [...s.tables, ...newTables],
              relationships: [...s.relationships, ...newRelationships],
              error: null,
            }
          }),

        clearDiagram: () => setWithSync(() => ({ tables: [], relationships: [] })),


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
          setWithSync((s) => ({ tables: [...s.tables, newTable] }))
        },

        updateTable: (id, updates) =>
          setWithSync((s) => ({
            tables: s.tables.map((t) => (t.id === id ? { ...t, ...updates } : t)),
          })),


        removeTable: (id) =>
          setWithSync((s) => ({
            tables: s.tables.filter((t) => t.id !== id),
            relationships: s.relationships.filter(
              (r) => r.sourceTableId !== id && r.targetTableId !== id
            ),
          })),


        updateTablePosition: (id, position) =>
          setWithSync((s) => ({
            tables: s.tables.map((t) => (t.id === id ? { ...t, position } : t)),
          })),


      // ── Attributes ────────────────────────────────────────────────────────────
        addAttribute: (tableId, attribute) =>
          setWithSync((s) => ({
            tables: s.tables.map((t) =>
              t.id === tableId
                ? { ...t, attributes: [...t.attributes, { id: uuidv4(), ...attribute }] }
                : t
            ),
          })),


        updateAttribute: (tableId, attributeId, updates) =>
          setWithSync((s) => ({
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
          setWithSync((s) => ({
            tables: s.tables.map((t) =>
              t.id === tableId
                ? { ...t, attributes: t.attributes.filter((a) => a.id !== attributeId) }
                : t
            ),
          })),


      // ── Relationships ─────────────────────────────────────────────────────────
        addRelationship: (relationship) =>
          setWithSync((s) => ({
            relationships: [...s.relationships, { id: uuidv4(), ...relationship }],
          })),


        updateRelationship: (id, updates) =>
          setWithSync((s) => ({
            relationships: s.relationships.map((r) => (r.id === id ? { ...r, ...updates } : r)),
          })),


        removeRelationship: (id) =>
          setWithSync((s) => ({
            relationships: s.relationships.filter((r) => r.id !== id),
          })),


        setAIConfig: (config) =>
          set((s) => ({ aiConfig: { ...s.aiConfig, ...config } })),

        setGenerating: (value) => set({ isGenerating: value }),

        setError: (msg) => set({ error: msg }),

        setAiSettingsOpen: (open) => set({ isAiSettingsOpen: open }),

        setTheme: (theme) => {
          set({ theme })
          localStorage.setItem('hf-theme', theme)
          if (theme === 'dark') {
            document.documentElement.classList.add('dark')
          } else {
            document.documentElement.classList.remove('dark')
          }
        },
        setChatMessages: (messages) => setWithSync(() => ({ chatMessages: messages })),
        setDiagramType: (type) => set({ diagramType: type }),

        setConceptualDiagram: (nodes, edges) =>
          set({ conceptualNodes: nodes, conceptualEdges: edges }),

        updateConceptualNodePosition: (id, position) =>
          set((s) => ({
            conceptualNodes: s.conceptualNodes.map((n) =>
              n.id === id ? { ...n, position } : n
            ),
          })),
      }
    },
    {
      name: 'hf-modelo-storage',
      storage: createJSONStorage(() => idbStorage),
      partialize: (state) => ({
        tables: state.tables,
        relationships: state.relationships,
        activeWorkspaceId: state.activeWorkspaceId,
        workspaces: state.workspaces,
        aiConfig: state.aiConfig,
        theme: state.theme,
        chatMessages: state.chatMessages,
        diagramType: state.diagramType,
        conceptualNodes: state.conceptualNodes,
        conceptualEdges: state.conceptualEdges,
      }),
      onRehydrateStorage: () => (state, error) => {
        if (!error && state && state.workspaces.length === 0) {
          state.createWorkspace('Meu Workspace')
        }
      },
    }
  )
)
