import './App.css'
import { AppShell, Container, Group, MantineProvider, Title, Button } from '@mantine/core'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Notifications } from '@mantine/notifications'
import LoginPage from './pages/Login'
import RegisterPage from './pages/Register'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import AdminDashboard from './pages/Admin/Dashboard'
import ClienteHome from './pages/Cliente/Home'
import CuponeraForm from './pages/Admin/CuponeraForm'
import AdminLayout from './layouts/AdminLayout'
import ReportsPage from './pages/Admin/Reports.tsx'
import { useAuth } from './context/AuthContext'

function HeaderUserActions() {
  const { token, signOut } = useAuth()
  if (!token) return null
  return <Button variant="light" size="xs" onClick={signOut}>Salir</Button>
}

function App() {
  return (
    <MantineProvider theme={{ primaryColor: 'blue', defaultRadius: 'md' }}>
      <AuthProvider>
        <BrowserRouter>
          <Notifications position="top-right" />
          <AppShell header={{ height: 56 }} padding="md">
            <AppShell.Header>
              <Container size="lg" p="sm">
                <Group justify="space-between">
                  <Title order={4}>Zellazo</Title>
                  <HeaderUserActions />
                </Group>
              </Container>
            </AppShell.Header>
            <AppShell.Main>
              <Container size="lg">
                <Routes>
                  <Route path="/" element={<Navigate to="/login" replace />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />

                  <Route element={<ProtectedRoute allow={['ADMIN']} />}>
                    <Route element={<AdminLayout />}>
                      <Route index path="/admin" element={<AdminDashboard />} />
                      <Route path="/admin/cuponera" element={<CuponeraForm />} />
                      <Route path="/admin/reports" element={<ReportsPage />} />
                    </Route>
                  </Route>

                  <Route element={<ProtectedRoute allow={['CLIENTE', 'ADMIN']} />}>
                    <Route path="/cliente" element={<ClienteHome />} />
                  </Route>

                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Container>
            </AppShell.Main>
          </AppShell>
        </BrowserRouter>
      </AuthProvider>
    </MantineProvider>
  )
}

export default App
