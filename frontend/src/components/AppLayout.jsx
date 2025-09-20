import React from 'react';
import { AppShell, Burger, Group, Title, NavLink } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Link } from 'react-router-dom';
import { ColorSchemeToggle } from './ColorSchemeToggle';

const AppLayout = ({ children }) => {
  const [opened, { toggle }] = useDisclosure();

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 300, breakpoint: 'sm', collapsed: { mobile: !opened } }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
            <Title order={3}>AssemblyOS</Title>
          </Group>
          <ColorSchemeToggle />
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <NavLink label="Dashboard" component={Link} to="/dashboard" />
        <NavLink label="Manufacturing Orders" component={Link} to="/orders" />
        <NavLink label="Add New Product" component={Link} to="/add-product" />
        <NavLink label="Stock Ledger" component={Link} to="/stock-ledger" />
        <NavLink label="Work Centers" component={Link} to="/work-centers" />
      </AppShell.Navbar>

      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
};

export default AppLayout;