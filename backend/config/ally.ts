import env from '#start/env'
import { defineConfig, services } from '@adonisjs/ally'

export default defineConfig({
  google: services.google({
    clientId: env.get('GOOGLE_CLIENT_ID', ''),
    clientSecret: env.get('GOOGLE_CLIENT_SECRET', ''),
    callbackUrl: env.get('GOOGLE_CALLBACK_URL', 'http://localhost:3333/oauth/google/callback'),
    // Basic recommended scopes
    scopes: ['userinfo.email', 'userinfo.profile'],
    prompt: 'select_account',
    accessType: 'offline',
  }),
  facebook: services.facebook({
    clientId: env.get('FACEBOOK_CLIENT_ID', ''),
    clientSecret: env.get('FACEBOOK_CLIENT_SECRET', ''),
    callbackUrl: env.get('FACEBOOK_CALLBACK_URL', 'http://localhost:3333/oauth/facebook/callback'),
    scopes: ['email'],
    userFields: ['email', 'first_name', 'last_name', 'picture'],
  }),
})


