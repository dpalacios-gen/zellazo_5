import Cuponera from '#models/cuponera'
import Local from '#models/local'
import { DateTime } from 'luxon'

class CuponeraService {
  async getCuponeraForAdmin(adminUserId: number) {
    const local = await Local.query().where('adminUserId', adminUserId).first()
    if (!local) return { local: null, cuponera: null }
    const cuponera = await Cuponera.query().where('localId', local.id).first()
    return { local, cuponera }
  }

  isExpired(cuponera: Cuponera | null): boolean {
    if (!cuponera || !cuponera.fechaCaducidad) return false
    return DateTime.utc() > cuponera.fechaCaducidad
  }
}

export default new CuponeraService()

 



