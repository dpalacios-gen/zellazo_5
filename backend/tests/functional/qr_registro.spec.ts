import { test } from '@japa/runner'
import User, { UserRole } from '#models/user'

function authHeader(token: string) {
  return { Authorization: `Bearer ${token}` }
}

async function registerAndLogin(client: any) {
  const email = `admin${Math.random().toString(36).slice(2)}@test.com`
  const password = 'Secret1234'
  await client.post('/auth/register').json({ email, password })
  const user = await User.findBy('email', email)
  if (user) {
    user.role = UserRole.ADMIN
    await user.save()
  }
  const loginRes = await client.post('/auth/login').json({ email, password })
  const token = loginRes.body().token.token || loginRes.body().token.value
  return token as string
}

test.group('QR Local y /registro', () => {
  test('GET /qr/local/:publicId.png devuelve PNG', async ({ client, assert }) => {
    const token = await registerAndLogin(client)
    const localRes = await client.post('/locals').headers(authHeader(token)).json({ name: 'Mi Local' })
    const publicId: string = localRes.body().publicId

    const res = await client.get(`/qr/local/${publicId}.png`)
    assert.equal(res.status(), 200)
    assert.equal(res.header('content-type'), 'image/png')
  })

  test('QR con publicId inexistente → 404', async ({ client, assert }) => {
    const res = await client.get('/qr/local/no-such-id.png')
    assert.equal(res.status(), 404)
  })

  test('GET /registro devuelve localPublicId y localName', async ({ client, assert }) => {
    const token = await registerAndLogin(client)
    const localRes = await client.post('/locals').headers(authHeader(token)).json({ name: 'Local ABC' })
    const publicId: string = localRes.body().publicId

    const res = await client.get(`/registro?local=${publicId}`)
    assert.equal(res.status(), 200)
    const body = res.body()
    assert.properties(body, ['localPublicId', 'localName'])
    assert.equal(body.localPublicId, publicId)
    assert.equal(body.localName, 'Local ABC')
    // Aseguramos que no filtramos ids internos
    assert.notProperty(body, 'id')
    assert.notProperty(body, 'adminUserId')
  })

  test('GET /registro sin query local → 400', async ({ client, assert }) => {
    const res = await client.get('/registro')
    assert.equal(res.status(), 400)
  })
})


