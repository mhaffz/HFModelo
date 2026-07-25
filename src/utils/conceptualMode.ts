import { z } from 'zod'
import { v4 as uuidv4 } from 'uuid'

// ─── Zod Schemas para o Modo Conceitual (Notação de Chen) ───────────

export const ConceptualEntitySchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'O nome da entidade é obrigatório'),
  position: z.object({
    x: z.number(),
    y: z.number(),
  }),
})

export const ConceptualAttributeSchema = z.object({
  id: z.string(),
  entityId: z.string(), // Liga o atributo (círculo) a entidade (retângulo)
  name: z.string(),
  isPrimaryKey: z.boolean(), // true = preenchido (bolinha preta), false = vazado (bolinha branca)
  position: z.object({
    x: z.number(),
    y: z.number(),
  }),
})

export const ConceptualRelationshipSchema = z.object({
  id: z.string(),
  name: z.string(), // Ex: 'pertence_a', 'relaciona'
  sourceEntityId: z.string(),
  targetEntityId: z.string(),
  sourceCardinality: z.string(),
  targetCardinality: z.string(),
  position: z.object({
    x: z.number(),
    y: z.number(),
  }),
})

export const ConceptualStateSchema = z.object({
  entities: z.array(ConceptualEntitySchema),
  attributes: z.array(ConceptualAttributeSchema),
  relationships: z.array(ConceptualRelationshipSchema),
})

// Tipagem inferida baseada no Zod para usar na store / UI
export type ConceptualEntity = z.infer<typeof ConceptualEntitySchema>
export type ConceptualAttribute = z.infer<typeof ConceptualAttributeSchema>
export type ConceptualRelationship = z.infer<typeof ConceptualRelationshipSchema>
export type ConceptualState = z.infer<typeof ConceptualStateSchema>

// ─── Util: Conversão do Lógico (Tabelas) para Conceitual (Entidades) ────────

/**
 * Função responsável por ler o modelo físico/lógico atual e extrair/converter
 * para as Entidades, Atributos e Relacionamentos do modelo Conceitual, aplicando 
 * lógica posicional básica inicial.
 */
export function convertLogicalToConceptual(logicalStateJson: any): ConceptualState {
  const defaultState: ConceptualState = {
    entities: [],
    attributes: [],
    relationships: [],
  }

  if (!logicalStateJson) return defaultState

  try {
    // Caso seja passado como String (ex: veio do localStorage / file upload) parseia.
    const logicalState = typeof logicalStateJson === 'string' ? JSON.parse(logicalStateJson) : logicalStateJson

    // Se estiver vazio estruturalmente
    if (!logicalState || !logicalState.tables) return defaultState

    const entities: ConceptualEntity[] = []
    const attributes: ConceptualAttribute[] = []
    const relationships: ConceptualRelationship[] = []

    // 1. Converte Tabelas -> Entidades e Colunas -> Atributos independentes
    for (const table of (logicalState.tables || [])) {
      const entityId = table.id || uuidv4()
      const entityPos = table.position || { x: 0, y: 0 }
      
      entities.push({
        id: entityId,
        name: table.name || 'NovaEntidade',
        position: { x: entityPos.x, y: entityPos.y },
      })

      // Espalha os atributos ao redor da entidade baseado no índice
      if (Array.isArray(table.attributes)) {
        const attrs = table.attributes
        const total = attrs.length
        attrs.forEach((col: any, index: number) => {
          // Distribui: os primeiros acima, depois esquerda, então direita, então abaixo
          const ENT_W = 140, ENT_H = 44
          let attrPosX: number, attrPosY: number
          
          const topCount = Math.ceil(total / 2)
          
          if (index < topCount) {
            // Acima da entidade, espaçados horizontalmente
            const spread = topCount === 1 ? 0 : (index - (topCount - 1) / 2) * 90
            attrPosX = entityPos.x + ENT_W / 2 - 20 + spread
            attrPosY = entityPos.y - 60 - Math.floor(index / 3) * 40
          } else {
            // Abaixo da entidade
            const i2 = index - topCount
            const spread2 = (i2 - Math.floor((total - topCount - 1) / 2)) * 90
            attrPosX = entityPos.x + ENT_W / 2 - 20 + spread2
            attrPosY = entityPos.y + ENT_H + 30
          }

          attributes.push({
            id: col.id || uuidv4(),
            entityId: entityId,
            name: col.name,
            isPrimaryKey: !!col.isPrimaryKey,
            position: { x: attrPosX, y: attrPosY },
          })
        })
      }
    }

    // 2. Converte as FKs / Relationships lógicos para Losangos(Relacionamentos do Chen)
    if (Array.isArray(logicalState.relationships)) {
      for (const rel of logicalState.relationships) {
        
        let targetId = rel.targetTableId
        let sourceId = rel.sourceTableId

        const sourceEntity = entities.find(e => e.id === sourceId)
        const targetEntity = entities.find(e => e.id === targetId)

        if (!sourceEntity || !targetEntity) continue;

        // Deduz um nome pro relacionamento: Use o label ou gera um padrão deduzido
        // Como 'Tabela1 vs Tabela2', se o usuário não o nomeou.
        const deducedName = (rel.label && rel.label.trim() !== '') 
          ? rel.label 
          : `Relaciona`
        
        // Posição inicial: Tenta jogar o Losango bem no meio entre as duas Entidades envolvidas
        const midX = (sourceEntity.position.x + targetEntity.position.x) / 2
        const midY = (sourceEntity.position.y + targetEntity.position.y) / 2 - 40

        relationships.push({
          id: rel.id || uuidv4(),
          name: deducedName,
          sourceEntityId: sourceEntity.id,
          targetEntityId: targetEntity.id,
          sourceCardinality: rel.sourceCardinality || '(0,n)',
          targetCardinality: rel.targetCardinality || '(1,1)',
          position: { x: midX, y: midY },
        })
      }
    }

    return ConceptualStateSchema.parse({
      entities,
      attributes,
      relationships,
    })

  } catch (error) {
    console.error('Falha ao converter Modelo Lógico para Conceitual:', error)
    return defaultState
  }
}
