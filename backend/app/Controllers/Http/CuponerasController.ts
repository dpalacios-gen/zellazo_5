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
    // Validaciones de premios
    const parsedPremios = premios.map((p) => ({ titulo: String(p.titulo || '').trim(), cantidadSellos: Number(p.cantidadSellos) }))
    if (parsedPremios.some((p) => !p.titulo || !Number.isInteger(p.cantidadSellos) || p.cantidadSellos <= 0)) {
      return response.badRequest({ error: 'premios inválidos: títulos requeridos y cantidadSellos > 0' })
    }
    // Orden ascendente y sin duplicados
    parsedPremios.sort((a, b) => a.cantidadSellos - b.cantidadSellos)
    for (let i = 1; i < parsedPremios.length; i++) {
      if (parsedPremios[i].cantidadSellos === parsedPremios[i - 1].cantidadSellos) {
        return response.badRequest({ error: 'premios inválidos: cantidades repetidas' })
      }
    }
    if (parsedPremios.length > 0 && parsedPremios[parsedPremios.length - 1].cantidadSellos > totalSellos) {
      return response.badRequest({ error: 'premios inválidos: un premio excede totalSellos' })
    }

    // Validación de fechaCaducidad
    const cad = fechaCaducidad ? DateTime.fromISO(fechaCaducidad) : null
    if (fechaCaducidad && (!cad?.isValid || cad.toMillis() <= 0)) {
      return response.badRequest({ error: 'fechaCaducidad inválida' })
    }

    const local = await Local.query().where('adminUserId', user.id).first()
    if (!local) return response.badRequest({ error: 'El admin no posee local' })

    const existing = await Cuponera.query().where('localId', local.id).first()
    if (existing) {
      existing.totalSellos = totalSellos
      existing.premios = parsedPremios
      existing.fechaCaducidad = cad
      await existing.save()
      const expired = !!(existing.fechaCaducidad && DateTime.utc() > existing.fechaCaducidad)
      return response.ok({ ...existing.serialize(), expired })
    }

    const created = await Cuponera.create({
      localId: local.id,
      totalSellos,
      premios: parsedPremios,
      fechaCaducidad: cad,
    })
    const expired = !!(created.fechaCaducidad && DateTime.utc() > created.fechaCaducidad)
    return response.created({ ...created.serialize(), expired })
  }

  public async show({ auth, response }: HttpContext) {
    const user = await auth.authenticate()
    if (user.role !== UserRole.ADMIN) return response.forbidden({ error: 'Solo ADMIN' })
    const local = await Local.query().where('adminUserId', user.id).first()
    if (!local) return response.badRequest({ error: 'El admin no posee local' })
    const cuponera = await Cuponera.query().where('localId', local.id).first()
    if (!cuponera) return response.notFound({ error: 'Sin cuponera' })
    const expired = !!(cuponera.fechaCaducidad && DateTime.utc() > cuponera.fechaCaducidad)
    return { ...cuponera.serialize(), expired }
  }
}


