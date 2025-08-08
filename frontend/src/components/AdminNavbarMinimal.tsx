import { useMemo } from 'react'
import { Center, Stack, Tooltip, UnstyledButton } from '@mantine/core'
import { IconHome2, IconTicket, IconChartBar, IconLogout } from '@tabler/icons-react'
import { Link, useLocation } from 'react-router-dom'
import classes from './AdminNavbarMinimal.module.css'

type NavbarLinkProps = {
  icon: React.ElementType
  label: string
  to?: string
  active?: boolean
  onClick?: () => void
}

function NavbarLink({ icon: Icon, label, to, active, onClick }: NavbarLinkProps) {
  const content = (
    <UnstyledButton onClick={onClick} className={classes.link} data-active={active || undefined}>
      <Icon size={20} stroke={1.5} />
    </UnstyledButton>
  )
  return (
    <Tooltip label={label} position="right" transitionProps={{ duration: 0 }}>
      {to ? <Link to={to}>{content}</Link> : content}
    </Tooltip>
  )
}

export default function AdminNavbarMinimal({ onLogout }: { onLogout: () => void }) {
  const { pathname } = useLocation()
  const links = useMemo(() => (
    [
      { icon: IconHome2, label: 'Dashboard', to: '/admin', active: pathname === '/admin' },
      { icon: IconTicket, label: 'Cuponera', to: '/admin/cuponera', active: pathname.startsWith('/admin/cuponera') },
      { icon: IconChartBar, label: 'Reportes', to: '/admin/reports', active: pathname.startsWith('/admin/reports') },
    ]
  ), [pathname])

  return (
    <nav className={classes.navbar}>
      <Center>
        <div style={{ width: 26, height: 26, borderRadius: 6, background: 'white' }} />
      </Center>

      <div className={classes.navbarMain}>
        <Stack justify="center" gap={0}>
          {links.map((l) => (
            <NavbarLink key={l.label} {...l} />
          ))}
        </Stack>
      </div>

      <Stack justify="center" gap={0}>
        <NavbarLink icon={IconLogout} label="Salir" onClick={onLogout} />
      </Stack>
    </nav>
  )
}


