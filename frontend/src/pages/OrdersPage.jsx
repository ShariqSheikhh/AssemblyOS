import React, { useState, useEffect } from 'react';
import { Title, Table, Paper, Badge, Group, Button, Modal, Select, NumberInput, Menu } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconPlus, IconDotsVertical } from '@tabler/icons-react';
import AppLayout from '../components/AppLayout';
import apiClient from '../api/apiClient';
import { notifications } from '@mantine/notifications';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpened, { open: openModal, close: closeModal }] = useDisclosure(false);
  const [newOrderProduct, setNewOrderProduct] = useState(null);
  const [newOrderQuantity, setNewOrderQuantity] = useState(1);

  const fetchOrders = async () => {
    try {
      const response = await apiClient.get('/orders');
      setOrders(response.data);
    } catch (err) {
      setError('Failed to fetch manufacturing orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // Fetch products for the dropdown
    apiClient.get('/products').then(res => {
      const productOptions = res.data.map(p => ({ value: p.item_id.toString(), label: p.name }));
      setProducts(productOptions);
    }).catch(err => {
      console.error('Failed to fetch products:', err);
    });
  }, []);

  const handleCreateOrder = async () => {
    try {
      await apiClient.post('/orders', {
        product_id: parseInt(newOrderProduct),
        quantity_to_produce: newOrderQuantity
      });
      notifications.show({ title: 'Success', message: 'Manufacturing order created!', color: 'green' });
      closeModal();
      // Reset form
      setNewOrderProduct(null);
      setNewOrderQuantity(1);
      fetchOrders();
    } catch (error) {
      console.error('Error creating order:', error);
      notifications.show({ 
        title: 'Error', 
        message: error.response?.data?.message || 'Failed to create order.', 
        color: 'red' 
      });
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await apiClient.put(`/orders/${orderId}`, { status: newStatus });
      notifications.show({ 
        title: 'Success', 
        message: `Order ${orderId} status updated to ${newStatus}.`, 
        color: 'blue' 
      });
      fetchOrders();
    } catch (error) {
      console.error('Error updating status:', error);
      notifications.show({ 
        title: 'Error', 
        message: error.response?.data?.message || 'Failed to update status.', 
        color: 'red' 
      });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Planned': return 'blue';
      case 'In Progress': return 'yellow';
      case 'Done': return 'green';
      case 'Canceled': return 'red';
      default: return 'gray';
    }
  };

  const rows = orders.map((order) => (
    <Table.Tr key={order.order_id}>
      <Table.Td>{order.order_id}</Table.Td>
      <Table.Td>{order.product_name}</Table.Td>
      <Table.Td>{order.quantity_to_produce}</Table.Td>
      <Table.Td>
        <Badge color={getStatusColor(order.status)}>{order.status}</Badge>
      </Table.Td>
      <Table.Td>{new Date(order.created_at).toLocaleDateString()}</Table.Td>
      <Table.Td>
        <Menu shadow="md" width={200}>
          <Menu.Target>
            <Button variant="subtle" size="xs"><IconDotsVertical size={16} /></Button>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Label>Update Status</Menu.Label>
            <Menu.Item 
              onClick={() => handleStatusChange(order.order_id, 'In Progress')}
              disabled={order.status === 'In Progress'}
            >
              In Progress
            </Menu.Item>
            <Menu.Item 
              onClick={() => handleStatusChange(order.order_id, 'Done')}
              disabled={order.status === 'Done' || order.status === 'Canceled'}
            >
              Done
            </Menu.Item>
            <Menu.Divider />
            <Menu.Item 
              color="red" 
              onClick={() => handleStatusChange(order.order_id, 'Canceled')}
              disabled={order.status === 'Canceled' || order.status === 'Done'}
            >
              Cancel
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <AppLayout>
      {/* New Order Modal */}
      <Modal opened={modalOpened} onClose={closeModal} title="Create Manufacturing Order">
        <Select 
          label="Product" 
          placeholder="Select a product" 
          data={products} 
          value={newOrderProduct} 
          onChange={setNewOrderProduct} 
          searchable 
          required
          mt="md"
        />
        <NumberInput 
          label="Quantity to Produce" 
          value={newOrderQuantity} 
          onChange={setNewOrderQuantity} 
          min={1} 
          mt="md"
          required
        />
        <Button 
          fullWidth 
          onClick={handleCreateOrder} 
          mt="xl"
          disabled={!newOrderProduct || !newOrderQuantity}
          loading={loading}
        >
          Create Order
        </Button>
      </Modal>

      <Group justify="space-between" mb="lg">
        <Title order={2}>Manufacturing Orders</Title>
        <Button 
          onClick={openModal} 
          leftSection={<IconPlus size={16} />}
          loading={loading}
        >
          New Order
        </Button>
      </Group>

      <Paper withBorder shadow="sm" p="md" radius="md">
        {loading && <p>Loading orders...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {!loading && !error && (
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Order ID</Table.Th>
                <Table.Th>Product</Table.Th>
                <Table.Th>Quantity</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th>Date Created</Table.Th>
                <Table.Th>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {rows.length > 0 ? (
                rows
              ) : (
                <Table.Tr>
                  <Table.Td colSpan={6} style={{ textAlign: 'center' }}>
                    No manufacturing orders found.
                  </Table.Td>
                </Table.Tr>
              )}
            </Table.Tbody>
          </Table>
        )}
      </Paper>
    </AppLayout>
  );
};

export default OrdersPage;