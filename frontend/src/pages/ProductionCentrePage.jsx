import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Title, Paper, Table, Button, Text, Group, Modal, NumberInput, Badge } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import AppLayout from '../components/AppLayout';
import apiClient from '../api/apiClient';
import { notifications } from '@mantine/notifications';

const ProductionCentrePage = () => {
  const { id } = useParams(); // Get the product ID from the URL
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isProducible, setIsProducible] = useState(false);
  const [produceQuantity, setProduceQuantity] = useState(1);
  const [modalOpened, { open: openModal, close: closeModal }] = useDisclosure(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get(`/products/${id}`);
        setProduct(response.data);
        // Check if the product is producible
        const canProduce = response.data.components.every(
          comp => comp.quantity_in_stock >= comp.quantity_required
        );
        setIsProducible(canProduce);
      } catch (err) {
        setError('Failed to fetch product details.');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]); // Refetch if the ID in the URL changes

  const handleProduce = async () => {
    try {
        await apiClient.post(`/products/${id}/produce`, { quantity: produceQuantity });
        notifications.show({
          title: 'Production successful',
          message: `Successfully produced ${produceQuantity} unit(s).`,
          color: 'green',
        });
        closeModal();
        navigate('/dashboard'); // Go back to dashboard to see updated stock
    } catch (error) {
        notifications.show({
          title: 'Production failed',
          message: error.response?.data?.error || 'Server error',
          color: 'red',
        });
    }
  };

  if (loading) return <AppLayout><Text>Loading product...</Text></AppLayout>;
  if (error) return <AppLayout><Text color="red">{error}</Text></AppLayout>;
  if (!product) return <AppLayout><Text>Product not found.</Text></AppLayout>;

  return (
    <AppLayout>
      <Modal opened={modalOpened} onClose={closeModal} title="Confirm Production">
        <NumberInput
            label={`How many '${product.name}' would you like to produce?`}
            value={produceQuantity}
            onChange={setProduceQuantity}
            min={1}
            allowDecimal={false}
        />
        <Button onClick={handleProduce} mt="md" fullWidth>Confirm Production</Button>
      </Modal>

      <Title order={2} mb="lg">Production Centre: {product.name}</Title>
      <Paper withBorder shadow="sm" p="md" radius="md">
        <Title order={4} mb="sm">Recipe / Bill of Materials</Title>
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Component</Table.Th>
              <Table.Th>Required</Table.Th>
              <Table.Th>In Stock</Table.Th>
              <Table.Th>Status</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {product.components.map(comp => (
              <Table.Tr key={comp.component_id}>
                <Table.Td>{comp.name}</Table.Td>
                <Table.Td>{comp.quantity_required}</Table.Td>
                <Table.Td>{comp.quantity_in_stock}</Table.Td>
                <Table.Td>
                  {comp.quantity_in_stock >= comp.quantity_required ? (
                    <Badge color="green">Available</Badge>
                  ) : (
                    <Badge color="red">Insufficient</Badge>
                  )}
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
        <Group justify="flex-end" mt="xl">
            <Button onClick={openModal} disabled={!isProducible} size="lg">
                Produce Item
            </Button>
        </Group>
      </Paper>
    </AppLayout>
  );
};

export default ProductionCentrePage;