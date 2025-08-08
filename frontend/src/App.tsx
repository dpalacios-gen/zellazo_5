import { useState } from 'react'
import './App.css'
import { MantineProvider, AppShell, Container, Tabs } from '@mantine/core'
import LoginPage from './pages/Login'
import RegisterPage from './pages/Register'

function App() {
  const [tab, setTab] = useState<string | null>('login')
  return (
    <MantineProvider>
      <AppShell header={{ height: 56 }} padding="md">
        <AppShell.Header>
          <Container size="lg" p="sm">Zellazo - Auth</Container>
        </AppShell.Header>
        <AppShell.Main>
          <Container size="lg">
            <Tabs value={tab} onChange={setTab} mt="md">
              <Tabs.List>
                <Tabs.Tab value="login">Login</Tabs.Tab>
                <Tabs.Tab value="register">Registro</Tabs.Tab>
              </Tabs.List>
              <Tabs.Panel value="login">
                <LoginPage />
              </Tabs.Panel>
              <Tabs.Panel value="register">
                <RegisterPage />
              </Tabs.Panel>
            </Tabs>
          </Container>
        </AppShell.Main>
      </AppShell>
    </MantineProvider>
  )
}

export default App
