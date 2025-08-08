import { useEffect, useMemo, useState } from 'react'
import { ActionIcon, Alert, Button, Card, Group, NumberInput, Stack, Table, Text, TextInput, Title } from '@mantine/core'
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
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)

  const [totalSellos, setTotalSellos] = useState<number | ''>(10)
  const [premios, setPremios] = useState<Premio[]>([{ titulo: 'Premio 1', cantidadSellos: 5 }])
  const [fechaCaducidad, setFechaCaducidad] = useState<Date | null>(null)
  const [expired, setExpired] = useState<boolean>(false)

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
      })
      .catch((e) => setError(e.message || 'Error al cargar cuponera'))
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

  async function onSave() {
    setSaving(true)
    setError(null)
    setInfo(null)
    try {
      const payload = {
        totalSellos: typeof totalSellos === 'number' ? totalSellos : 0,
        premios,
        fechaCaducidad: fechaCaducidad ? fechaCaducidad.toISOString() : null,
      }
      const res = await apiPost<CuponeraDto>('/cuponera', payload)
      setInfo('Guardado OK')
      setExpired(Boolean(res.expired))
      notifications.show({ color: 'green', title: 'Guardado', message: 'La cuponera se guardó correctamente' })
    } catch (e: any) {
      setError(e.message || 'Error al guardar cuponera')
      notifications.show({ color: 'red', title: 'Error', message: e.message || 'Error al guardar cuponera' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Stack p="md">
      <Group justify="space-between">
        <Title order={3}>Cuponera</Title>
        {expired && <Alert color="red" title="Cuponera expirada">La cuponera está expirada</Alert>}
      </Group>

      {loading && <Text>Cargando…</Text>}
      {error && <Text c="red">{error}</Text>}
      {info && <Text c="green">{info}</Text>}

      <Card withBorder>
        <Stack>
          <NumberInput
            label="Total de sellos"
            value={totalSellos}
            onChange={(v) => setTotalSellos(typeof v === 'number' ? v : '')}
            min={1}
            required
          />
          <Stack>
            <Group gap="xs">
              <Title order={5}>Premios</Title>
              <ActionIcon variant="light" onClick={() => setPremios((p) => [...p, { titulo: '', cantidadSellos: 1 }])}>
                <IconPlus size={16} />
              </ActionIcon>
            </Group>
            <Table withRowBorders={false} verticalSpacing="xs">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Título</Table.Th>
                  <Table.Th>Cantidad de sellos</Table.Th>
                  <Table.Th></Table.Th>
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
              </Table.Tbody>
            </Table>
          </Stack>
          <DateInput label="Fecha de caducidad" value={fechaCaducidad} onChange={setFechaCaducidad} clearable />
          {validations.length > 0 && (
            <Alert color="yellow" title="Validaciones">
              <Stack gap={4}>
                {validations.map((v, i) => (
                  <Text key={i} size="sm">• {v}</Text>
                ))}
              </Stack>
            </Alert>
          )}
          <Group>
            <Button onClick={onSave} loading={saving} disabled={validations.length > 0}>Guardar</Button>
          </Group>
        </Stack>
      </Card>
    </Stack>
  )
}


