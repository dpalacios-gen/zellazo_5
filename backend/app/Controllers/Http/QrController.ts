import type { HttpContext } from '@adonisjs/core/http'
import Local from '#models/local'
import QRCode from 'qrcode'
import env from '#start/env'

export default class QrController {
  public async localQr({ request, response }: HttpContext) {
    const publicId = request.param('publicId')
    const local = await Local.query().where('publicId', publicId).first()
    if (!local) return response.notFound({ error: 'Local no encontrado' })

    const baseUrl = env.get('PUBLIC_BASE_URL', 'http://localhost:5173')
    const url = `${baseUrl}/registro?local=${encodeURIComponent(local.publicId)}`
    const png = await QRCode.toBuffer(url, { type: 'png', margin: 1, scale: 6 })
    response.header('Content-Type', 'image/png')
    return response.send(png)
  }
}


