import { BaseModel, belongsTo, column, dateTimeColumn } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'
import Local from '#models/local'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

export type PrizeDefinition = {
  titulo: string
  cantidadSellos: number
}

export default class Cuponera extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column({ serializeAs: 'localId' })
  declare localId: number

  @belongsTo(() => Local)
  declare local: BelongsTo<typeof Local>

  @column({ serializeAs: 'totalSellos' })
  declare totalSellos: number

  @column({
    serializeAs: 'premios',
    prepare: (value: PrizeDefinition[]) => JSON.stringify(value),
    consume: (value: any) => (typeof value === 'string' ? JSON.parse(value) : value),
  })
  declare premios: PrizeDefinition[]

  @dateTimeColumn({ serializeAs: 'fechaCaducidad' })
  declare fechaCaducidad: DateTime | null

  @dateTimeColumn({ autoCreate: true })
  declare createdAt: DateTime

  @dateTimeColumn({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}


