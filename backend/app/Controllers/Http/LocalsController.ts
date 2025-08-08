import type { HttpContext } from '@adonisjs/core/http'
import Local from '#models/local'
import { randomUUID } from 'crypto'
import { UserRole } from '#models/user'

export default class LocalsController {
  public async create({ auth, request, response }: HttpContext) {
    const user = await auth.authenticate()
    if (user.role !== UserRole.ADMIN) {
      return response.forbidden({ error: 'Solo ADMIN puede crear local' })
    }

    const existing = await Local.query().where('adminUserId', user.id).first()
    if (existing) return response.badRequest({ error: 'El admin ya tiene un local' })

    const name = request.input('name')?.trim()
    if (!name) return response.badRequest({ error: 'name requerido' })

    const local = await Local.create({ name, publicId: randomUUID(), adminUserId: user.id })
    return response.created(local)
  }
}


