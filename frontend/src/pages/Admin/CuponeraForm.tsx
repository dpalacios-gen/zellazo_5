import { useEffect, useMemo, useState } from 'react'
import { ActionIcon, Alert, Box, Button, Card, Divider, Group, NumberInput, Skeleton, Stack, Table, Text, TextInput, Title } from '@mantine/core'
import { DateInput } from '@mantine/dates'
import { IconPlus, IconTrash } from '@tabler/icons-react'
import { apiGet, apiPost } from '../../lib/api'
import { notifications } from '@mantine/notifications'

type Premio = { titulo: string; cantidadSellos: number }

type CuponeraDto = {
  id: number
  localId: number
  totalSellos: number
  premios: Premio[]
  fechaCaducidad: string | null
  expired?: boolean
}

export default function CuponeraForm() {
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  // inline messages replaced by notifications

  const [totalSellos, setTotalSellos] = useState<number | ''>(10)
  const [premios, setPremios] = useState<Premio[]>([{ titulo: 'Premio 1', cantidadSellos: 5 }])
  const [fechaCaducidad, setFechaCaducidad] = useState<Date | null>(null)
  const [expired, setExpired] = useState<boolean>(false)
  const [initialSnapshot, setInitialSnapshot] = useState<string>('')

  useEffect(() => {
    let mounted = true
    setLoading(true)
    apiGet<CuponeraDto>('/cuponera')
      .then((data) => {
        if (!mounted) return
        setTotalSellos(data.totalSellos)
        setPremios(data.premios)
        setFechaCaducidad(data.fechaCaducidad ? new Date(data.fechaCaducidad) : null)
        setExpired(Boolean(data.expired))
        const snap = JSON.stringify({ totalSellos: data.totalSellos, premios: data.premios, fechaCaducidad: data.fechaCaducidad })
        setInitialSnapshot(snap)
      })
      .catch((e) => notifications.show({ color: 'red', title: 'Error', message: e.message || 'Error al cargar cuponera' }))
      .finally(() => setLoading(false))
    return () => {
      mounted = false
    }
  }, [])

  const validations = useMemo(() => {
    const errs: string[] = []
    if (!totalSellos || totalSellos <= 0) errs.push('totalSellos debe ser > 0')
    const seen = new Set<number>()
    for (const p of premios) {
      if (!p.titulo || !p.titulo.trim()) errs.push('Todos los premios deben tener título')
      if (p.cantidadSellos <= 0) errs.push('cantidadSellos debe ser > 0')
      if (typeof totalSellos === 'number' && p.cantidadSellos > totalSellos) errs.push('cantidadSellos no puede superar totalSellos')
      if (seen.has(p.cantidadSellos)) errs.push('cantidadSellos de premios debe ser único')
      seen.add(p.cantidadSellos)
    }
    return errs
  }, [totalSellos, premios])

  const isDirty = useMemo(() => {
    const snap = JSON.stringify({
      totalSellos: typeof totalSellos === 'number' ? totalSellos : 0,
      premios,
      fechaCaducidad: fechaCaducidad ? fechaCaducidad.toISOString() : null,
    })
    return initialSnapshot !== '' && snap !== initialSnapshot
  }, [initialSnapshot, totalSellos, premios, fechaCaducidad])

  async function onSave() {
    setSaving(true)
    try {
      const payload = {
        totalSellos: typeof totalSellos === 'number' ? totalSellos : 0,
        premios,
        fechaCaducidad: fechaCaducidad ? fechaCaducidad.toISOString() : null,
      }
      const res = await apiPost<CuponeraDto>('/cuponera', payload)
      setExpired(Boolean(res.expired))
      setInitialSnapshot(JSON.stringify({
        totalSellos: payload.totalSellos,
        premios: payload.premios,
        fechaCaducidad: payload.fechaCaducidad,
      }))
      notifications.show({ color: 'green', title: 'Guardado', message: 'La cuponera se guardó correctamente' })
    } catch (e: any) {
      notifications.show({ color: 'red', title: 'Error', message: e.message || 'Error al guardar cuponera' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Stack p="md">
      <Group justify="space-between" mb="sm">
        <div>
          <Title order={3}>Cuponera</Title>
          <Text size="sm" c="dimmed">Configura la cantidad total de sellos y los premios por hitos.</Text>
        </div>
        {expired && <Alert color="red" title="Cuponera expirada">La cuponera está expirada</Alert>}
      </Group>

      {loading ? (
        <Card withBorder shadow="sm" radius="md" maw={720} mx="auto">
          <Stack>
            <Skeleton height={28} width="40%" />
            <Skeleton height={38} />
            <Divider my="xs" />
            <Skeleton height={24} width="30%" />
            <Skeleton height={120} />
            <Skeleton height={38} width={160} />
          </Stack>
        </Card>
      ) : (
        <Card withBorder shadow="sm" radius="md" maw={720} mx="auto">
          <Stack>
            <div>
              <Text fw={500} mb={4}>Total de sellos</Text>
              <Text size="xs" c="dimmed" mb={8}>Cantidad total de casilleros a completar en la cuponera.</Text>
              <NumberInput
                value={totalSellos}
                onChange={(v) => setTotalSellos(typeof v === 'number' ? v : '')}
                min={1}
                required
              />
            </div>

            <Divider label="Premios" labelPosition="left" />
            <Text size="xs" c="dimmed">Definí los hitos de premios. La cantidad de sellos debe ser única y no superar el total.</Text>

            <Group gap="xs">
              <ActionIcon variant="light" onClick={() => setPremios((p) => [...p, { titulo: '', cantidadSellos: 1 }])}>
                <IconPlus size={16} />
              </ActionIcon>
              <Text size="sm" c="dimmed">Agregar premio</Text>
            </Group>

            <Table striped highlightOnHover withRowBorders={false} verticalSpacing="xs">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th style={{ width: '60%' }}>Título</Table.Th>
                  <Table.Th style={{ width: '30%' }}>Cantidad de sellos</Table.Th>
                  <Table.Th style={{ width: '10%' }}></Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {premios.map((p, idx) => (
                  <Table.Tr key={idx}>
                    <Table.Td>
                      <TextInput value={p.titulo} onChange={(e) => {
                        const v = e.currentTarget.value
                        setPremios((arr) => arr.map((x, i) => i === idx ? { ...x, titulo: v } : x))
                      }} placeholder="Ej: Premio 1" required />
                    </Table.Td>
                    <Table.Td>
                      <NumberInput value={p.cantidadSellos} min={1} onChange={(v) => {
                        const n = typeof v === 'number' ? v : 1
                        setPremios((arr) => arr.map((x, i) => i === idx ? { ...x, cantidadSellos: n } : x))
                      }} required />
                    </Table.Td>
                    <Table.Td>
                      <ActionIcon color="red" variant="light" onClick={() => setPremios((arr) => arr.filter((_, i) => i !== idx))}>
                        <IconTrash size={16} />
                      </ActionIcon>
                    </Table.Td>
                  </Table.Tr>
                ))}
                {premios.length === 0 && (
                  <Table.Tr>
                    <Table.Td colSpan={3}><Text size="sm" c="dimmed">No hay premios. Agregá al menos uno.</Text></Table.Td>
                  </Table.Tr>
                )}
              </Table.Tbody>
            </Table>

            <Divider label="Vigencia" labelPosition="left" />
            <div>
              <Text size="xs" c="dimmed" mb={8}>Fecha a partir de la cual la cuponera deja de estar activa.</Text>
              <DateInput value={fechaCaducidad} onChange={setFechaCaducidad} clearable valueFormat="DD/MM/YYYY" />
            </div>

            {validations.length > 0 && (
              <Alert color="yellow" title="Validaciones">
                <Stack gap={4}>
                  {validations.map((v, i) => (
                    <Text key={i} size="sm">• {v}</Text>
                  ))}
                </Stack>
              </Alert>
            )}

            <Box style={{ position: 'sticky', bottom: 0, background: 'var(--mantine-color-body)', paddingTop: 8 }}>
              <Group justify="space-between">
                <Text size="sm" c="dimmed">{isDirty ? 'Cambios sin guardar' : 'Sin cambios'}</Text>
                <Button onClick={onSave} loading={saving} disabled={validations.length > 0 || !isDirty}>Guardar</Button>
              </Group>
            </Box>
          </Stack>
        </Card>
      )}
    </Stack>
  )
}


