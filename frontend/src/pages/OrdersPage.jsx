import React,{useState, useEffect } from 'react';
import { Title, Table, Paper, Badge, Group, Button, Modal, Select, NumberInput, Menu, Text } from '@mantine/core';
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
  const [feasibility, setFeasibility] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
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
    apiClient.get('/products').then(res => {
      const productOptions = res.data.map(p => ({ value: p.item_id.toString(), label: p.name }));
      setProducts(productOptions);
    });
  }, []);

  const handleCreateOrder = async () => {
    try {
      const response = await apiClient.post('/orders', {
        product_id: parseInt(newOrderProduct),
        quantity_to_produce: newOrderQuantity
      });

      if (response.data.feasibility.isFeasible) {
        notifications.show({ title: 'Success', message: 'Manufacturing order created!', color: 'green' });
        closeModalAndReset();
        fetchOrders();
      }
    } catch (error) {
      const feasibilityData = error.response?.data?.feasibility;
      setFeasibility(feasibilityData);
      notifications.show({ title: 'Order Not Feasible', message: 'Insufficient stock for one or more components.', color: 'red' });
    }
  };

  const closeModalAndReset = () => {
    closeModal();
    setFeasibility(null);
    setNewOrderProduct(null);
    setNewOrderQuantity(1);
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await apiClient.put(`/orders/${orderId}`, { status: newStatus });
      notifications.show({ title: 'Success', message: `Order ${orderId} status updated.`, color: 'blue' });
      fetchOrders();
    } catch (error) {
      notifications.show({ title: 'Error', message: 'Failed to update status.', color: 'red' });
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
      <Table.Td>
        <Text fw={700} c={order.quantity_on_hand > 0 ? 'green' : 'red'}>
          {order.quantity_on_hand}
        </Text>
      </Table.Td>
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
            <Menu.Item onClick={() => handleStatusChange(order.order_id, 'In Progress')}>In Progress</Menu.Item>
            <Menu.Item onClick={() => handleStatusChange(order.order_id, 'Done')}>Done</Menu.Item>
            <Menu.Item color="red" onClick={() => handleStatusChange(order.order_id, 'Canceled')}>Canceled</Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <AppLayout>
      <Modal opened={modalOpened} onClose={closeModalAndReset} title="Create Manufacturing Order">
        <Select label="Product" placeholder="Select a product" data={products} value={newOrderProduct} onChange={setNewOrderProduct} searchable />
        <NumberInput label="Quantity to Produce" value={newOrderQuantity} onChange={setNewOrderQuantity} min={1} mt="md" />
        
        {feasibility && (
          <Paper p="md" mt="lg" withBorder>
            <Text fw={700} c={feasibility.isFeasible ? 'green' : 'red'}>
              {feasibility.isFeasible ? 'Order is Feasible' : 'Order Not Feasible'}
            </Text>
            <List spacing="xs" size="sm" mt="xs">
              {feasibility.details.map(detail => (
                <List.Item
                  key={detail.name}
                  icon={
                    detail.isAvailable ? <ThemeIcon color="green" size={20} radius="xl"><IconCircleCheck size={14} /></ThemeIcon>
                    : <ThemeIcon color="red" size={20} radius="xl"><IconCircleX size={14} /></ThemeIcon>
                  }
                >
                  {detail.name} (Required: {detail.required}, Available: {detail.available})
                </List.Item>
              ))}
            </List>
          </Paper>
        )}

        <Button fullWidth onClick={handleCreateOrder} mt="xl">Create Order</Button>
      </Modal>

      <Group justify="space-between" mb="lg">
        <Title order={2}>Manufacturing Orders</Title>
        <Button onClick={openModal} leftSection={<IconPlus size={16} />}>
          New Order
        </Button>
      </Group>

      <Paper withBorder shadow="sm" p="md" radius="md">
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Order ID</Table.Th>
              <Table.Th>Product</Table.Th>
              <Table.Th>Qty On Hand</Table.Th>
              <Table.Th>Order Qty</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>Date Created</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>{rows.length > 0 ? rows : <Table.Tr><Table.Td colSpan={7}>No manufacturing orders found.</Table.Td></Table.Tr>}</Table.Tbody>
        </Table>
      </Paper>
    </AppLayout>
  );
};

export default OrdersPage;