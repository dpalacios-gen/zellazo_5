import { Button, Group, Stack, Text, Title } from '@mantine/core'
import { useAuth } from '../../context/AuthContext'

export default function ClienteHome() {
  const { user, signOut } = useAuth()
  return (
    <Stack p="md">
      <Group justify="space-between">
        <Title order={3}>Cliente</Title>
        <Button variant="light" onClick={signOut}>Salir</Button>
      </Group>
      <Text>Hola, {user?.email}</Text>
      <Text>Vista placeholder del cliente.</Text>
    </Stack>
  )
}


