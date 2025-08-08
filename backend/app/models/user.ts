import { BaseModel, beforeSave, column, dateTimeColumn } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'
import hash from '@adonisjs/core/services/hash'
import { DbAccessTokensProvider } from '@adonisjs/auth/access_tokens'

export enum UserRole {
  ADMIN = 'ADMIN',
  CLIENTE = 'CLIENTE',
}

export default class User extends BaseModel {
  // Access tokens provider for AdonisJS auth (required for access_tokens guard)
  static accessTokens = DbAccessTokensProvider.forModel(User)

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string | null

  @column({ serializeAs: null })
  declare password: string

  @column()
  declare email: string

  @column()
  declare role: UserRole

  @dateTimeColumn()
  declare emailVerifiedAt: DateTime | null

  @dateTimeColumn({ autoCreate: true })
  declare createdAt: DateTime

  @dateTimeColumn({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @beforeSave()
  static async hashPassword(user: User) {
    if (user.$dirty.password) {
      user.password = await hash.make(user.password)
    }
  }
}


