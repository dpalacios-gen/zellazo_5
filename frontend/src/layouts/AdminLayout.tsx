import { AppShell, NavLink, Stack } from '@mantine/core'
import { IconChartBar, IconHome, IconTicket } from '@tabler/icons-react'
import { Link, Outlet, useLocation } from 'react-router-dom'

export default function AdminLayout() {
  const { pathname } = useLocation()
  return (
    <AppShell.Navbar>
      <Stack p="sm">
        <NavLink component={Link} to="/admin" active={pathname === '/admin'} label="Dashboard" leftSection={<IconHome size={16} />} />
        <NavLink component={Link} to="/admin/cuponera" active={pathname.startsWith('/admin/cuponera')} label="Cuponera" leftSection={<IconTicket size={16} />} />
        <NavLink component={Link} to="/admin/reports" active={pathname.startsWith('/admin/reports')} label="Reportes" leftSection={<IconChartBar size={16} />} />
      </Stack>
      <Outlet />
    </AppShell.Navbar>
  )
}


