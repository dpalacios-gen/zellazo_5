import { BaseModel, column, dateTimeColumn } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'

export default class EmailVerificationToken extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare token: string

  @dateTimeColumn()
  declare expiresAt: DateTime

  @dateTimeColumn({ autoCreate: true })
  declare createdAt: DateTime
}


