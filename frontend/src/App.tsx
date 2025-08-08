import './App.css'
import { AppShell, Container, Group, MantineProvider, Title, Button } from '@mantine/core'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { Notifications } from '@mantine/notifications'
import LoginPage from './pages/Login'
import RegisterPage from './pages/Register'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import AdminDashboard from './pages/Admin/Dashboard'
import ClienteHome from './pages/Cliente/Home'
import CuponeraForm from './pages/Admin/CuponeraForm'
import ReportsPage from './pages/Admin/Reports.tsx'
import { useAuth } from './context/AuthContext'
import AdminNavbarMinimal from './components/AdminNavbarMinimal'

function HeaderUserActions() {
  const { token, signOut } = useAuth()
  if (!token) return null
  return (
    <Button
      variant="gradient"
      gradient={{ from: 'blue', to: 'cyan' }}
      size="xs"
      onClick={signOut}
    >
      Salir
    </Button>
  )
}

function AppInner() {
  const { pathname } = useLocation()
  const isAdmin = pathname.startsWith('/admin')
  return (
    <>
      <Notifications position="top-right" />
      <AppShell header={{ height: 56 }} padding="md" navbar={{ width: 80, breakpoint: 'xs' }}>
        <AppShell.Header>
          <Container size="lg" p="sm">
            <Group justify="space-between">
              <Group>
                <Title order={4}>Zellazo</Title>
              </Group>
              <HeaderUserActions />
            </Group>
          </Container>
        </AppShell.Header>
        {isAdmin && <AppShell.Navbar withBorder={false}><AdminNavbarMinimal onLogout={() => {}} /></AppShell.Navbar>}
        <AppShell.Main>
          <Container size="lg">
            <Routes>
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              <Route element={<ProtectedRoute allow={['ADMIN']} />}>
                <Route index path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/cuponera" element={<CuponeraForm />} />
                <Route path="/admin/reports" element={<ReportsPage />} />
              </Route>

              <Route element={<ProtectedRoute allow={['CLIENTE', 'ADMIN']} />}>
                <Route path="/cliente" element={<ClienteHome />} />
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Container>
        </AppShell.Main>
      </AppShell>
    </>
  )
}

function App() {
  return (
    <MantineProvider forceColorScheme="light" theme={{ primaryColor: 'blue', defaultRadius: 'md' }}>
      <AuthProvider>
        <BrowserRouter>
          <AppInner />
        </BrowserRouter>
      </AuthProvider>
    </MantineProvider>
  )
}

export default App
