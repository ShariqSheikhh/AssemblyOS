import React, { useState, useEffect } from 'react';
import { Title, Table, Paper, Text } from '@mantine/core';
import AppLayout from '../components/AppLayout';
import apiClient from '../api/apiClient';

const WorkCentersPage = () => {
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    apiClient.get('/work-centers')
      .then(response => {
        setCenters(response.data);
      })
      .catch(err => {
        setError('Failed to fetch work center data.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const rows = centers.map((center) => {
    const hoursWorked = parseFloat(center.hours_worked);
    const costPerHour = parseFloat(center.cost_per_hour);
    const totalCost = hoursWorked * costPerHour;

    return (
      <Table.Tr key={center.name}>
        <Table.Td>{center.name}</Table.Td>
        <Table.Td>{hoursWorked.toFixed(2)}</Table.Td>
        <Table.Td>₹{costPerHour.toFixed(2)}</Table.Td>
        <Table.Td>
          <Text fw={700}>₹{totalCost.toFixed(2)}</Text>
        </Table.Td>
      </Table.Tr>
    );
  });

  return (
    <AppLayout>
      <Title order={2} mb="lg">Work Centers</Title>
      <Paper withBorder shadow="sm" p="md" radius="md">
        {loading && <p>Loading data...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {!loading && !error && (
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Work Center</Table.Th>
                <Table.Th>Hours Worked (Completed Orders)</Table.Th>
                <Table.Th>Cost Per Hour</Table.Th>
                <Table.Th>Total Cost</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>{rows}</Table.Tbody>
          </Table>
        )}
      </Paper>
    </AppLayout>
  );
};

export default WorkCentersPage;
