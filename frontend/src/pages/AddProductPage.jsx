import React, { useState, useEffect } from 'react';
import { Title, TextInput, Button, Paper, Group, NumberInput, Select, ActionIcon } from '@mantine/core';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import AppLayout from '../components/AppLayout';
import apiClient from '../api/apiClient';
import { useNavigate } from 'react-router-dom';
import { notifications } from '@mantine/notifications';

const AddProductPage = () => {
  const [productName, setProductName] = useState('');
  const [inventoryItems, setInventoryItems] = useState([]);
  const [components, setComponents] = useState([{ item_id: '', quantity_required: 1, step_order: 1 }]);
  const navigate = useNavigate();

  useEffect(() => {
    apiClient.get('/products/inventory').then(response => {
      const itemsForSelect = response.data.map(item => ({
        value: item.item_id.toString(),
        label: item.name
      }));
      setInventoryItems(itemsForSelect);
    });
  }, []);
  
  const handleAddComponent = () => {
    setComponents([...components, { item_id: '', quantity_required: 1, step_order: components.length + 1 }]);
  };
  
  const handleComponentChange = (index, field, value) => {
    const newComponents = [...components];
    newComponents[index][field] = value;
    // When an item is selected, update its step_order based on its position
    newComponents[index]['step_order'] = index + 1;
    setComponents(newComponents);
  };

  const handleRemoveComponent = (index) => {
    const newComponents = components.filter((_, i) => i !== index);
    // After removing, update the step_order for all remaining components
    const updatedStepOrder = newComponents.map((comp, i) => ({ ...comp, step_order: i + 1 }));
    setComponents(updatedStepOrder);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post('/products', {
        name: productName,
        quantity_in_stock: 0,
        is_product: true,
        components: components.map(c => ({...c, item_id: parseInt(c.item_id), quantity_required: Number(c.quantity_required)}))
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
        <TextInput label="Product Name" placeholder="e.g., Wooden Chair" value={productName} onChange={(e) => setProductName(e.target.value)} required />
        
        <Title order={4} mt="xl" mb="sm">Recipe / Bill of Materials</Title>
        {components.map((component, index) => (
          <Group key={index} grow align="flex-end" mb="sm">
            <Select
              label={`Component #${index + 1}`}
              placeholder="Select item"
              data={inventoryItems}
              value={component.item_id}
              onChange={(value) => handleComponentChange(index, 'item_id', value)}
              searchable
              required
            />
            <NumberInput label="Quantity Required" value={component.quantity_required} onChange={(value) => handleComponentChange(index, 'quantity_required', value)} min={1} required />
            <ActionIcon color="red" size="lg" variant="default" onClick={() => handleRemoveComponent(index)}>
              <IconTrash size={18} />
            </ActionIcon>
          </Group>
        ))}

        <Button leftSection={<IconPlus size={16} />} variant="outline" onClick={handleAddComponent} mt="sm">
          Add Component
        </Button>

        <Button type="submit" fullWidth mt="xl">Create Product</Button>
      </Paper>
    </AppLayout>
  );
};

export default AddProductPage;