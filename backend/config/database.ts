import { defineConfig } from '@adonisjs/lucid'
import env from '#start/env'

const dbConfig = defineConfig({
  connection: 'pg',
  connections: {
    pg: {
      client: 'pg',
      connection: {
        host: env.get('PG_HOST') || 'localhost',
        port: Number(env.get('PG_PORT') || 5432),
        user: env.get('PG_USER') || 'postgres',
        password: env.get('PG_PASSWORD') || undefined,
        database: env.get('PG_DB_NAME') || 'zellazo_dev',
      },
      migrations: {
        naturalSort: true,
        paths: ['database/migrations'],
      },
    },
  },
})

export default dbConfig