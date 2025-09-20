import React, { useState, useEffect } from 'react';
import { Title, TextInput, Button, Paper, Group, NumberInput, Select, ActionIcon, Grid, Text } from '@mantine/core';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import AppLayout from '../components/AppLayout';
import apiClient from '../api/apiClient';
import { useNavigate } from 'react-router-dom';
import { notifications } from '@mantine/notifications';

const AddProductPage = () => {
  const [productName, setProductName] = useState('');
  const [inventoryItems, setInventoryItems] = useState([]);
  // State for material components
  const [materials, setMaterials] = useState([{ item_id: '', quantity_required: 1 }]);
  // New state for work order steps
  const [workOrders, setWorkOrders] = useState([{ operation_name: '', time_required_mins: 10 }]);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch only raw materials for the BOM list
    apiClient.get('/products/inventory').then(response => {
      const itemsForSelect = response.data
        .filter(item => !item.is_product) // Filter for raw materials
        .map(item => ({
          value: item.item_id.toString(),
          label: item.name
        }));
      setInventoryItems(itemsForSelect);
    });
  }, []);

  // Functions to handle material components
  const handleAddMaterial = () => setMaterials([...materials, { item_id: '', quantity_required: 1 }]);
  const handleMaterialChange = (index, field, value) => {
    const newMaterials = [...materials];
    newMaterials[index][field] = value;
    setMaterials(newMaterials);
  };
  const handleRemoveMaterial = (index) => setMaterials(materials.filter((_, i) => i !== index));

  // Functions to handle work orders
  const handleAddWorkOrder = () => setWorkOrders([...workOrders, { operation_name: '', time_required_mins: 10 }]);
  const handleWorkOrderChange = (index, field, value) => {
    const newWorkOrders = [...workOrders];
    newWorkOrders[index][field] = value;
    setWorkOrders(newWorkOrders);
  };
  const handleRemoveWorkOrder = (index) => setWorkOrders(workOrders.filter((_, i) => i !== index));

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Combine materials and work orders into a single components array for the backend
    const componentsPayload = [
        ...materials.map((mat, index) => ({ ...mat, step_order: index + 1 })),
        ...workOrders.map((wo, index) => ({ ...wo, item_id: null, quantity_required: 0, step_order: materials.length + index + 1 }))
    ];

    try {
      await apiClient.post('/products', {
        name: productName,
        quantity_in_stock: 0,
        is_product: true,
        components: componentsPayload.map(c => ({
            ...c, 
            item_id: c.item_id ? parseInt(c.item_id) : null, 
            quantity_required: Number(c.quantity_required),
            time_required_mins: Number(c.time_required_mins) || null
        }))
      });
      notifications.show({
        title: 'Product Created',
        message: 'Your new product has been created successfully.',
        color: 'green',
      });
      navigate('/dashboard');
    } catch (error) {
      notifications.show({
        title: 'Failed to create product',
        message: error?.response?.data?.error || 'Server error',
        color: 'red',
      });
      console.error(error);
    }
  };

  return (
    <AppLayout>
      <Title order={2} mb="lg">Add New Product</Title>
      <Paper component="form" onSubmit={handleSubmit} withBorder shadow="sm" p="md" radius="md">
        <TextInput 
          label="Product Name" 
          placeholder="e.g., Wooden Chair" 
          value={productName} 
          onChange={(e) => setProductName(e.target.value)} 
          required 
          mb="xl"
        />

        <Grid gutter="xl">
          {/* Column 1: Bill of Materials */}
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Paper withBorder p="md" radius="md" h="100%">
              <Title order={4} mb="md">
                <Group justify="space-between">
                  <span>Bill of Materials</span>
                  <Button 
                    size="xs" 
                    variant="light" 
                    leftSection={<IconPlus size={16} />} 
                    onClick={handleAddMaterial}
                  >
                    Add Material
                  </Button>
                </Group>
              </Title>
              {materials.length === 0 ? (
                <Text c="dimmed" ta="center" py="md">No materials added yet</Text>
              ) : (
                materials.map((mat, index) => (
                  <Group key={index} align="flex-end" mb="md" wrap="nowrap">
                    <Select 
                      label={`Material ${index + 1}`} 
                      placeholder="Select item" 
                      data={inventoryItems} 
                      value={mat.item_id} 
                      onChange={(value) => handleMaterialChange(index, 'item_id', value)} 
                      searchable 
                      required 
                      flex={1}
                    />
                    <NumberInput 
                      label="Qty" 
                      value={mat.quantity_required} 
                      onChange={(value) => handleMaterialChange(index, 'quantity_required', value)} 
                      min={1} 
                      required 
                      style={{ width: '100px' }}
                    />
                    <ActionIcon 
                      color="red" 
                      variant="subtle" 
                      onClick={() => handleRemoveMaterial(index)}
                      mb={24}
                    >
                      <IconTrash size={18} />
                    </ActionIcon>
                  </Group>
                ))
              )}
            </Paper>
          </Grid.Col>

          {/* Column 2: Work Orders */}
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Paper withBorder p="md" radius="md" h="100%">
              <Title order={4} mb="md">
                <Group justify="space-between">
                  <span>Production Steps</span>
                  <Button 
                    size="xs" 
                    variant="light" 
                    leftSection={<IconPlus size={16} />} 
                    onClick={handleAddWorkOrder}
                  >
                    Add Step
                  </Button>
                </Group>
              </Title>
              {workOrders.length === 0 ? (
                <Text c="dimmed" ta="center" py="md">No production steps added yet</Text>
              ) : (
                workOrders.map((wo, index) => (
                  <Group key={index} align="flex-end" mb="md" wrap="nowrap">
                    <Select 
                      label={`Process #${index + 1}`} 
                      placeholder="Select a process" 
                      data={['Assembly', 'Painting', 'Packing']}
                      value={wo.operation_name} 
                      onChange={(value) => handleWorkOrderChange(index, 'operation_name', value)}
                      required
                      flex={1}
                    />
                    <NumberInput 
                      label="Minutes" 
                      value={wo.time_required_mins} 
                      onChange={(value) => handleWorkOrderChange(index, 'time_required_mins', value)} 
                      min={1} 
                      required 
                      style={{ width: '120px' }}
                    />
                    <ActionIcon 
                      color="red" 
                      variant="subtle" 
                      onClick={() => handleRemoveWorkOrder(index)}
                      mb={24}
                    >
                      <IconTrash size={18} />
                    </ActionIcon>
                  </Group>
                ))
              )}
            </Paper>
          </Grid.Col>
        </Grid>

        <Group justify="flex-end" mt="xl">
          <Button 
            variant="outline" 
            onClick={() => navigate('/dashboard')}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={!productName || materials.length === 0 || workOrders.length === 0}
          >
            Create Product
          </Button>
        </Group>
      </Paper>
    </AppLayout>
  );
};

export default AddProductPage;