import React, { useState, useEffect } from 'react';
import { Title, Table, Paper, ActionIcon } from '@mantine/core';
import { IconArrowRight } from '@tabler/icons-react';
import AppLayout from '../components/AppLayout';
import apiClient from '../api/apiClient';
import { useNavigate } from 'react-router-dom';

const DashboardPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await apiClient.get('/products');
        setProducts(response.data);
      } catch (err) {
        setError('Failed to fetch products.');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const rows = products.map((product) => (
    <Table.Tr key={product.item_id} onClick={() => navigate(`/product/${product.item_id}`)} style={{ cursor: 'pointer' }}>
      <Table.Td>{product.item_id}</Table.Td>
      <Table.Td>{product.name}</Table.Td>
      <Table.Td>{product.quantity_in_stock}</Table.Td>
      <Table.Td><ActionIcon variant="transparent"><IconArrowRight size={16} /></ActionIcon></Table.Td>
    </Table.Tr>
  ));

  return (
    <AppLayout>
      <Title order={2} mb="lg">Products Dashboard</Title>
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
            <Table.Tbody>{rows}</Table.Tbody>
          </Table>
        )}
      </Paper>
    </AppLayout>
  );
};

export default DashboardPage;