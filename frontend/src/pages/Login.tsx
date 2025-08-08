import { useState } from 'react'
import { Button, Paper, PasswordInput, Stack, Text, TextInput, Title } from '@mantine/core'
import { apiPost } from '../lib/api'

type LoginResponse = {
  token: { type: string; value?: string; token?: string; expiresAt?: string | null; name?: string | null }
  user: { id: number; email: string; role?: string }
}

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)
    try {
      const res = await apiPost<LoginResponse>('/auth/login', { email, password })
      const tokenStr = res.token.value ?? res.token.token
      if (!tokenStr) throw new Error('Token no recibido')
      setSuccess(`Login OK. Token: ${tokenStr.substring(0, 12)}…`)
      // TODO: store token in a proper auth store
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Stack align="center" mt="xl">
      <Paper withBorder p="xl" maw={420} w="100%">
        <Title order={3} mb="md">Ingresar</Title>
        <form onSubmit={onSubmit}>
          <Stack>
            <TextInput label="Email" placeholder="tu@email.com" value={email} onChange={(e) => setEmail(e.currentTarget.value)} required />
            <PasswordInput label="Contraseña" value={password} onChange={(e) => setPassword(e.currentTarget.value)} required />
            <Button type="submit" loading={loading}>Ingresar</Button>
            {error && <Text c="red" size="sm">{error}</Text>}
            {success && <Text c="green" size="sm">{success}</Text>}
          </Stack>
        </form>
      </Paper>
    </Stack>
  )
}


