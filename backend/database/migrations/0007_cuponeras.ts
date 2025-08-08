import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'cuponeras'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table
        .integer('local_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('locals')
        .onDelete('CASCADE')
        .unique() // una cuponera activa por local
      table.integer('total_sellos').unsigned().notNullable()
      table.jsonb('premios').notNullable()
      table.timestamp('fecha_caducidad', { useTz: true }).nullable()
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}


