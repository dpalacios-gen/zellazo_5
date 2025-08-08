import { test } from '@japa/runner'
import { DateTime } from 'luxon'
import User, { UserRole } from '#models/user'

function authHeader(token: string) {
  return { Authorization: `Bearer ${token}` }
}

async function registerAndLogin(client: any) {
  const email = `admin${Math.random().toString(36).slice(2)}@test.com`
  const password = 'Secret1234'
  await client.post('/auth/register').json({ email, password })
  // Promote to ADMIN to pass role checks on /locals and /cuponera
  const user = await User.findBy('email', email)
  if (user) {
    user.role = UserRole.ADMIN
    await user.save()
  }
  const loginRes = await client.post('/auth/login').json({ email, password })
  const token = loginRes.body().token.token || loginRes.body().token.value
  return token as string
}

test.group('Cuponera validations', () => {
  test('reject premios with duplicate cantidadSellos', async ({ client, assert }) => {
    const token = await registerAndLogin(client)
    await client.post('/locals').headers(authHeader(token)).json({ name: 'Mi Local' })

    const res = await client
      .post('/cuponera')
      .headers(authHeader(token))
      .json({
        totalSellos: 10,
        premios: [
          { titulo: 'P1', cantidadSellos: 5 },
          { titulo: 'P2', cantidadSellos: 5 },
        ],
        fechaCaducidad: null,
      })

    assert.equal(res.status(), 400)
  })

  test('reject premios over totalSellos', async ({ client, assert }) => {
    const token = await registerAndLogin(client)
    await client.post('/locals').headers(authHeader(token)).json({ name: 'Mi Local' })

    const res = await client
      .post('/cuponera')
      .headers(authHeader(token))
      .json({ totalSellos: 5, premios: [{ titulo: 'P1', cantidadSellos: 6 }], fechaCaducidad: null })

    assert.equal(res.status(), 400)
  })

  test('accept valid cuponera and set expired flag correctly', async ({ client, assert }) => {
    const token = await registerAndLogin(client)
    await client.post('/locals').headers(authHeader(token)).json({ name: 'Mi Local' })

    const past = DateTime.utc().minus({ days: 1 }).toISO()

    const res = await client
      .post('/cuponera')
      .headers(authHeader(token))
      .json({ totalSellos: 10, premios: [{ titulo: 'P1', cantidadSellos: 5 }], fechaCaducidad: past })

    assert.equal(res.status(), 201)
    assert.isTrue(res.body().expired)
  })

  test('only one cuponera per local (upsert semantics)', async ({ client, assert }) => {
    const token = await registerAndLogin(client)
    await client.post('/locals').headers(authHeader(token)).json({ name: 'Mi Local' })

    const first = await client
      .post('/cuponera')
      .headers(authHeader(token))
      .json({ totalSellos: 10, premios: [{ titulo: 'P1', cantidadSellos: 5 }], fechaCaducidad: null })
    assert.equal(first.status(), 201)

    const second = await client
      .post('/cuponera')
      .headers(authHeader(token))
      .json({ totalSellos: 12, premios: [{ titulo: 'P2', cantidadSellos: 6 }], fechaCaducidad: null })

    assert.equal(second.status(), 200)
    assert.equal(second.body().totalSellos, 12)
  })
})


