import type { HttpContext } from '@adonisjs/core/http'
import Cuponera from '#models/cuponera'
import { middleware } from '#start/kernel'
import { UserRole } from '#models/user'
import Local from '#models/local'
import { DateTime } from 'luxon'

export default class CuponerasController {
  public async upsert({ auth, request, response }: HttpContext) {
    const user = await auth.authenticate()
    if (user.role !== UserRole.ADMIN) return response.forbidden({ error: 'Solo ADMIN' })

    const { totalSellos, premios, fechaCaducidad } = request.only(['totalSellos', 'premios', 'fechaCaducidad']) as {
      totalSellos: number
      premios: any[]
      fechaCaducidad?: string | null
    }
    if (!Number.isInteger(totalSellos) || totalSellos <= 0) {
      return response.badRequest({ error: 'totalSellos inválido' })
    }
    if (!Array.isArray(premios)) return response.badRequest({ error: 'premios inválidos' })

    const local = await Local.query().where('adminUserId', user.id).first()
    if (!local) return response.badRequest({ error: 'El admin no posee local' })

    const existing = await Cuponera.query().where('localId', local.id).first()
    if (existing) {
      existing.totalSellos = totalSellos
      existing.premios = premios
      existing.fechaCaducidad = fechaCaducidad ? DateTime.fromISO(fechaCaducidad) : null
      await existing.save()
      return response.ok(existing)
    }

    const created = await Cuponera.create({
      localId: local.id,
      totalSellos,
      premios,
      fechaCaducidad: fechaCaducidad ? DateTime.fromISO(fechaCaducidad) : null,
    })
    return response.created(created)
  }

  public async show({ auth, response }: HttpContext) {
    const user = await auth.authenticate()
    if (user.role !== UserRole.ADMIN) return response.forbidden({ error: 'Solo ADMIN' })
    const local = await Local.query().where('adminUserId', user.id).first()
    if (!local) return response.badRequest({ error: 'El admin no posee local' })
    const cuponera = await Cuponera.query().where('localId', local.id).first()
    if (!cuponera) return response.notFound({ error: 'Sin cuponera' })
    return cuponera
  }
}


