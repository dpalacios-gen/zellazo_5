import { Button, Group, Image, Stack, Text, Title } from '@mantine/core'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useEffect, useState } from 'react'
import { apiGet } from '../../lib/api'

export default function AdminDashboard() {
  const { user, signOut } = useAuth()
  const [publicId, setPublicId] = useState<string | null>(null)
  useEffect(() => {
    apiGet<{ id: number; name: string; publicId: string; adminUserId: number }>('/locals/me')
      .then((l) => setPublicId(l.publicId))
      .catch(() => setPublicId(null))
  }, [])
  return (
    <Stack p="md">
      <Group justify="space-between">
        <Title order={3}>Panel Admin</Title>
        <Button variant="light" onClick={signOut}>Salir</Button>
      </Group>
      <Text>Hola, {user?.email}</Text>
      <Button component={Link} to="/admin/cuponera">Configurar cuponera</Button>
      {publicId && (
        <Stack>
          <Title order={5}>QR del local</Title>
          <Image src={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3333'}/qr/local/${publicId}.png`} w={180} h={180} alt="QR Local"/>
          <Button
            component="a"
            href={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3333'}/qr/local/${publicId}.png`}
            download={`zellazo-qr-${publicId}.png`}
            variant="light"
          >
            Descargar PNG
          </Button>
        </Stack>
      )}
    </Stack>
  )
}


