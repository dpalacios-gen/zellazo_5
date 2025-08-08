import type { HttpContext } from '@adonisjs/core/http'
import User, { UserRole } from '#models/user'
import EmailVerificationToken from '#models/email_verification_token'
import PasswordResetToken from '#models/password_reset_token'
import { randomUUID } from 'crypto'
import { DateTime } from 'luxon'
import hash from '@adonisjs/core/services/hash'

export default class AuthController {
  async register({ request, response }: HttpContext) {
    const { email, password, name, role } = request.only(['email', 'password', 'name', 'role'])
    const user = await User.create({ email, password, name: name ?? null, role: role ?? UserRole.CLIENTE })

    const token = await EmailVerificationToken.create({
      userId: user.id,
      token: randomUUID(),
      expiresAt: DateTime.utc().plus({ hours: 24 }),
    })

    return response.created({ id: user.id, verifyToken: token.token })
  }

  async login({ request, auth, response }: HttpContext) {
    const { email, password } = request.only(['email', 'password'])
    const user = await User.query().where('email', email).first()
    if (!user) return response.unauthorized()

    const isValid = await hash.verify(user.password, password)
    if (!isValid) return response.unauthorized()

    const token = await auth.use('api').createToken(user, [], { expiresIn: '7 days' })
    return { token: token.toJSON(), user: { id: user.id, email: user.email, role: user.role } }
  }

  async logout({ response }: HttpContext) {
    // With opaque access tokens, the client can discard the token on logout.
    // Revocation endpoint can be added later if needed.
    return response.noContent()
  }

  async verifyEmail({ request, response }: HttpContext) {
    const token = request.input('token') ?? request.qs().token
    if (!token) return response.badRequest({ error: 'Token is required' })

    const record = await EmailVerificationToken.query().where('token', token).first()
    if (!record || record.expiresAt.toMillis() <= DateTime.utc().toMillis()) {
      return response.badRequest({ error: 'Invalid token' })
    }

    const user = await User.findOrFail(record.userId)
    user.emailVerifiedAt = DateTime.utc()
    await user.save()
    await record.delete()
    return { verified: true }
  }

  async requestPasswordReset({ request, response }: HttpContext) {
    const { email } = request.only(['email'])
    const user = await User.query().where('email', email).first()
    if (!user) return response.noContent()

    const token = await PasswordResetToken.create({
      userId: user.id,
      token: randomUUID(),
      expiresAt: DateTime.utc().plus({ hours: 2 }),
    })
    return response.created({ resetToken: token.token })
  }

  async resetPassword({ request, response }: HttpContext) {
    const { token, password } = request.only(['token', 'password'])
    const record = await PasswordResetToken.query().where('token', token).first()
    if (!record || record.expiresAt.toMillis() <= DateTime.utc().toMillis()) {
      return response.badRequest({ error: 'Invalid token' })
    }

    const user = await User.findOrFail(record.userId)
    user.password = password
    await user.save()
    await record.delete()
    return { reset: true }
  }
}

