import React, { useState, useEffect } from 'react';
import { Title, Table, Paper } from '@mantine/core';
import AppLayout from '../components/AppLayout';
import apiClient from '../api/apiClient';

const StockLedgerPage = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const response = await apiClient.get('/products/inventory');
        setInventory(response.data);
      } catch (err) {
        setError('Failed to fetch stock ledger.');
      } finally {
        setLoading(false);
      }
    };
    fetchInventory();
  }, []);

  const rows = inventory.map((item) => (
    <Table.Tr key={item.item_id}>
      <Table.Td>{item.item_id}</Table.Td>
      <Table.Td>{item.name}</Table.Td>
      <Table.Td>{item.quantity_in_stock}</Table.Td>
    </Table.Tr>
  ));

  return (
    <AppLayout>
      <Title order={2} mb="lg">Stock Ledger</Title>
      <Paper withBorder shadow="sm" p="md" radius="md">
        {loading && <p>Loading inventory...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {!loading && !error && (
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Item ID</Table.Th>
                <Table.Th>Item Name</Table.Th>
                <Table.Th>Quantity On Hand</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>{rows}</Table.Tbody>
          </Table>
        )}
      </Paper>
    </AppLayout>
  );
};

export default StockLedgerPage;
