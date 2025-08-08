import { Button, Group, Stack, Text, Title } from '@mantine/core'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function AdminDashboard() {
  const { user, signOut } = useAuth()
  return (
    <Stack p="md">
      <Group justify="space-between">
        <Title order={3}>Panel Admin</Title>
        <Button variant="light" onClick={signOut}>Salir</Button>
      </Group>
      <Text>Hola, {user?.email}</Text>
      <Text>Acá conectaremos el formulario de cuponera (2.4).</Text>
      <Button component={Link} to="/admin/cuponera">Configurar cuponera</Button>
    </Stack>
  )
}


