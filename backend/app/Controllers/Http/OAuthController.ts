import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import { randomUUID } from 'crypto'
import db from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'

export default class OAuthController {
  /**
   * Returns provider redirect URL for SPA to navigate to
   */
  public redirect({ ally, params, response }: HttpContext) {
    const provider = params.provider
    if (!['google', 'facebook'].includes(provider)) {
      return response.badRequest({ error: 'Unsupported provider' })
    }
    return ally.use(provider as 'google' | 'facebook').redirect()
  }

  /**
   * Handles provider callback and logs in / creates user
   */
  public async callback({ ally, params, auth, response }: HttpContext) {
    const providerName = params.provider
    if (!['google', 'facebook'].includes(providerName)) {
      return response.badRequest({ error: 'Unsupported provider' })
    }

    const provider = ally.use(providerName as 'google' | 'facebook')

    if (provider.accessDenied()) {
      return response.forbidden({ error: 'Access denied' })
    }
    if (provider.stateMisMatch()) {
      return response.badRequest({ error: 'State mismatch' })
    }
    if (provider.hasError()) {
      return response.badRequest({ error: provider.getError() })
    }

    const socialUser = await provider.user()
    const email = socialUser.email
    if (!email) return response.badRequest({ error: 'Email not provided by provider' })

    const user = await User.firstOrCreate(
      { email },
      {
        email,
        name: socialUser.name ?? socialUser.nickName ?? null,
        password: randomUUID(),
      }
    )

    // Mark email verified if provider says so
    if (socialUser.emailVerificationState === 'verified' && !user.emailVerifiedAt) {
      user.emailVerifiedAt = DateTime.utc()
      await user.save()
    }

    // Upsert OAuth link
    await db
      .table('oauth_accounts')
      .insert({
        user_id: user.id,
        provider: providerName,
        provider_user_id: String(socialUser.id),
        email: socialUser.email ?? null,
        profile: JSON.stringify(socialUser.original ?? {}),
        created_at: new Date(),
        updated_at: new Date(),
      })
      .onConflict(['provider', 'provider_user_id'])
      .merge({ user_id: user.id, email: socialUser.email ?? null, updated_at: new Date() })

    const token = await auth.use('api').createToken(user, ['*'])
    return response.ok({ user: { id: user.id, email: user.email }, token: token.value!.release() })
  }
}


