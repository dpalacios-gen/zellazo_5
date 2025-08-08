import { BaseModel, belongsTo, column, dateTimeColumn } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'
import User from '#models/user'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

export default class Local extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column({ serializeAs: 'publicId' })
  declare publicId: string

  @column({ serializeAs: 'adminUserId' })
  declare adminUserId: number

  @belongsTo(() => User, { foreignKey: 'adminUserId' })
  declare admin: BelongsTo<typeof User>

  @dateTimeColumn({ autoCreate: true })
  declare createdAt: DateTime

  @dateTimeColumn({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}


