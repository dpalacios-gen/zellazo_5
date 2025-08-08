import type { HttpContext } from '@adonisjs/core/http'
import { NextFn } from '@adonisjs/core/types/http'
import CuponeraService from "../Services/cuponera_service.js"
import { UserRole } from '#models/user'

export default class CuponeraActiveMiddleware {
  public async handle({ auth, response }: HttpContext, next: NextFn) {
    const user = await auth.authenticate()
    if (user.role !== UserRole.ADMIN) return response.forbidden({ error: 'Solo ADMIN' })

    const { local, cuponera } = await CuponeraService.getCuponeraForAdmin(user.id)
    if (!local) return response.badRequest({ error: 'El admin no posee local' })
    if (!cuponera) return response.badRequest({ error: 'El local no posee cuponera' })
    if (CuponeraService.isExpired(cuponera)) {
      return response.badRequest({ error: 'La cuponera está expirada' })
    }

    await next()
  }
}


