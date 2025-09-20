import React from 'react';
import { AppShell, Burger, Group, Title, NavLink } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Link } from 'react-router-dom';

const AppLayout = ({ children }) => {
  const [opened, { toggle }] = useDisclosure();

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 300, breakpoint: 'sm', collapsed: { mobile: !opened } }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md">
          <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
          <Title order={3}>AssemblyOS</Title>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <NavLink label="Dashboard" component={Link} to="/dashboard" />
        <NavLink label="Add New Product" component={Link} to="/add-product" />
      </AppShell.Navbar>

      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
};

export default AppLayout;