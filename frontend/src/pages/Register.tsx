import { useState } from 'react'
import { Button, Paper, PasswordInput, Stack, Text, TextInput, Title } from '@mantine/core'
import { apiPost } from '../lib/api'

type RegisterResponse = { message?: string; id?: number; verifyToken?: string }

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setInfo(null)
    try {
      const res = await apiPost<RegisterResponse>('/auth/register', { email, password, name })
      setInfo(res.message || (res.verifyToken ? `Registrado. Token verificación: ${res.verifyToken}` : 'Registrado'))
    } catch (err: any) {
      setError(err.message || 'Error en registro')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Stack align="center" mt="xl">
      <Paper withBorder p="xl" maw={420} w="100%">
        <Title order={3} mb="md">Crear cuenta</Title>
        <form onSubmit={onSubmit}>
          <Stack>
            <TextInput label="Nombre" value={name} onChange={(e) => setName(e.currentTarget.value)} />
            <TextInput label="Email" value={email} onChange={(e) => setEmail(e.currentTarget.value)} required />
            <PasswordInput label="Contraseña" value={password} onChange={(e) => setPassword(e.currentTarget.value)} required />
            <Button type="submit" loading={loading}>Registrarme</Button>
            {error && <Text c="red" size="sm">{error}</Text>}
            {info && <Text c="green" size="sm">{info}</Text>}
          </Stack>
        </form>
      </Paper>
    </Stack>
  )
}


