import type { HttpContext } from '@adonisjs/core/http'
import Local from '#models/local'

export default class RegistroController {
  public async handle({ request, response }: HttpContext) {
    const publicId = request.qs().local as string | undefined
    if (!publicId) return response.badRequest({ error: 'local requerido' })
    const local = await Local.query().where('publicId', publicId).first()
    if (!local) return response.notFound({ error: 'Local no encontrado' })

    // Para el MVP devolvemos JSON con el publicId; el frontend hará el flujo de login/registro y asignación luego
    return { localPublicId: local.publicId, localName: local.name }
  }
}


