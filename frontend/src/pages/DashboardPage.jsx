import React, { useState, useEffect } from 'react';
import { Title, Table, Paper, SimpleGrid, Text, Group, TextInput } from '@mantine/core'; // <-- Add TextInput
import { IconCube, IconList, IconAlertTriangle, IconSearch, IconArrowRight } from '@tabler/icons-react'; // <-- Add IconSearch
import AppLayout from '../components/AppLayout';
import apiClient from '../api/apiClient';
import { useNavigate } from 'react-router-dom';

const StatCard = ({ title, value, icon, color }) => {
    // ... (This component stays the same)
    const Icon = icon;
      return (
        <Paper withBorder p="md" radius="md">
          <Group justify="space-between">
            <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
              {title}
            </Text>
            <Icon size={22} color={color} />
          </Group>
          <Text fz="xl" fw={700}>
            {value}
          </Text>
        </Paper>
      );
};

const DashboardPage = () => {
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState({ totalProducts: 0, totalInventoryItems: 0, lowStockItems: 0 });
  const [searchTerm, setSearchTerm] = useState(''); // <-- 1. Add new state for the search term
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsResponse, productsResponse] = await Promise.all([
          apiClient.get('/products/stats'),
          apiClient.get('/products')
        ]);
        setStats(statsResponse.data);
        setProducts(productsResponse.data);
      } catch (err) {
        setError('Failed to fetch dashboard data.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);
  
  // 2. Filter the products based on the search term before mapping
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const rows = filteredProducts.map((product) => (
    <Table.Tr key={product.item_id} onClick={() => navigate(`/product/${product.item_id}`)} style={{ cursor: 'pointer' }}>
      <Table.Td>{product.item_id}</Table.Td>
      <Table.Td>{product.name}</Table.Td>
      <Table.Td>{product.quantity_in_stock}</Table.Td>
      <Table.Td>{/* Action Icon can go here if needed */}</Table.Td>
    </Table.Tr>
  ));

  return (
    <AppLayout>
      <Title order={2} mb="lg">Dashboard</Title>
      
      <SimpleGrid cols={{ base: 1, sm: 3 }} mb="xl">
        <StatCard title="Total Products" value={stats.totalProducts} icon={IconCube} color="violet" />
        <StatCard title="Total Inventory Items" value={stats.totalInventoryItems} icon={IconList} color="blue" />
        <StatCard title="Low Stock Items" value={stats.lowStockItems} icon={IconAlertTriangle} color="orange" />
      </SimpleGrid>

      <Group justify="space-between" mb="md">
        <Title order={3}>Product WO List</Title>
        {/* 3. Add the search input field */}
        <TextInput
          placeholder="Search by product name..."
          leftSection={<IconSearch size={14} />}
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.currentTarget.value)}
        />
      </Group>

      <Paper withBorder shadow="sm" p="md" radius="md">
        {loading && <p>Loading products...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {!loading && !error && (
            <Table striped highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>ID</Table.Th>
                    <Table.Th>Product Name</Table.Th>
                    <Table.Th>Quantity in Stock</Table.Th>
                    <Table.Th />
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>{rows.length > 0 ? rows : <Table.Tr><Table.Td colSpan={4}>No products found.</Table.Td></Table.Tr>}</Table.Tbody>
            </Table>
        )}
      </Paper>
    </AppLayout>
  );
};

export default DashboardPage;