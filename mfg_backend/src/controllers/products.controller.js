const pool = require('../config/db.config');

exports.createProduct = async (req, res) => {
  // is_product will be true, components is an array like [{ item_id: 1, quantity: 4, step: 1}, ...]
  const { name, quantity_in_stock, is_product, components } = req.body;

  const client = await pool.connect(); // Get a client from the connection pool

  try {
    // Start a transaction
    await client.query('BEGIN');

    // Insert the new product into the 'items' table and get its new ID
    const productQuery = 'INSERT INTO items (name, quantity_in_stock, is_product) VALUES ($1, $2, $3) RETURNING item_id';
    const productResult = await client.query(productQuery, [name, quantity_in_stock, is_product]);
    const newProductId = productResult.rows[0].item_id;

    // Now, loop through the components and insert them into the 'bom_components' table
    for (const component of components) {
      const bomQuery = 'INSERT INTO bom_components (product_id, component_id, quantity_required, step_order) VALUES ($1, $2, $3, $4)';
      await client.query(bomQuery, [newProductId, component.item_id, component.quantity_required, component.step_order]);
    }

    // If all queries were successful, commit the transaction
    await client.query('COMMIT');

    res.status(201).json({ message: 'Product and BOM created successfully!', productId: newProductId });

  } catch (error) {
    // If any query fails, roll back the transaction
    await client.query('ROLLBACK');
    console.error(error.message);
    res.status(500).send('Server error during transaction');
  } finally {
    // Release the client back to the pool
    client.release();
  }
};

// Controller for dashboard analytics
exports.getDashboardStats = async (req, res) => {
  try {
    const totalProductsResult = await pool.query('SELECT COUNT(*) FROM items WHERE is_product = true');
    const totalInventoryResult = await pool.query('SELECT COUNT(*) FROM items');
    const lowStockResult = await pool.query('SELECT COUNT(*) FROM items WHERE is_product = false AND quantity_in_stock < 50');

    res.status(200).json({
      totalProducts: parseInt(totalProductsResult.rows[0].count),
      totalInventoryItems: parseInt(totalInventoryResult.rows[0].count),
      lowStockItems: parseInt(lowStockResult.rows[0].count),
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
};

// Controller to get all manufacturable products
exports.getAllProducts = async (req, res) => {
  try {
    const products = await pool.query("SELECT * FROM items WHERE is_product = true ORDER BY name");
    res.status(200).json(products.rows);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
};

// Controller to get a list of all items (inventory)
exports.getInventory = async (req, res) => {
  try {
    const inventory = await pool.query("SELECT item_id, name, quantity_in_stock FROM items ORDER BY name");
    res.status(200).json(inventory.rows);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
};

// Controller to get a single product by its ID, including its BOM
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params; // Get the product ID from the URL parameter

    // First, get the main product details
    const productResult = await pool.query('SELECT * FROM items WHERE item_id = $1 AND is_product = true', [id]);

    if (productResult.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found.' });
    }
    const product = productResult.rows[0];

    // Now, get the components for this product from the BOM
    // We JOIN with the items table again to get the name and current stock of each component
    const bomResult = await pool.query(
      `SELECT 
        bc.component_id, 
        i.name, 
        bc.quantity_required,
        i.quantity_in_stock 
       FROM bom_components bc
       JOIN items i ON bc.component_id = i.item_id
       WHERE bc.product_id = $1 
       ORDER BY bc.step_order`,
      [id]
    );

    // Combine the results into a single object
    const productWithBOM = {
      ...product,
      components: bomResult.rows
    };

    res.status(200).json(productWithBOM);

  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
};

// Controller to "produce" an item
exports.produceProduct = async (req, res) => {
  const { id } = req.params; // The ID of the product to produce
  const { quantity } = req.body; // The quantity we want to produce

  if (!quantity || quantity <= 0) {
    return res.status(400).json({ error: 'Production quantity must be greater than 0.' });
  }

  const client = await pool.connect();

  try {
    // START THE TRANSACTION
    await client.query('BEGIN');

    // 1. Get the list of required components (the BOM) for the product
    const bomResult = await client.query('SELECT component_id, quantity_required FROM bom_components WHERE product_id = $1', [id]);
    const components = bomResult.rows;

    if (components.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'This item is not a product or has no bill of materials.' });
    }

    // 2. Check stock for all components
    for (const component of components) {
      // Get the current stock for this component, and lock the row until the transaction is over
      const stockResult = await client.query('SELECT quantity_in_stock FROM items WHERE item_id = $1 FOR UPDATE', [component.component_id]);
      const currentStock = stockResult.rows[0].quantity_in_stock;
      const requiredStock = component.quantity_required * quantity;

      if (currentStock < requiredStock) {
        // If we don't have enough of any component, stop everything.
        await client.query('ROLLBACK');
        return res.status(400).json({ error: `Insufficient stock for component ID ${component.component_id}. Required: ${requiredStock}, Available: ${currentStock}` });
      }
    }

    // 3. If we have enough stock, decrement the stock for each component
    for (const component of components) {
      const requiredStock = component.quantity_required * quantity;
      await client.query('UPDATE items SET quantity_in_stock = quantity_in_stock - $1 WHERE item_id = $2', [requiredStock, component.component_id]);
    }

    // 4. Increment the stock for the finished product
    await client.query('UPDATE items SET quantity_in_stock = quantity_in_stock + $1 WHERE item_id = $2', [quantity, id]);

    // COMMIT THE TRANSACTION
    await client.query('COMMIT');

    res.status(200).json({ message: `Successfully produced ${quantity} unit(s) of product ID ${id}.` });

  } catch (error) {
    // If anything goes wrong, roll back all changes
    await client.query('ROLLBACK');
    console.error(error.message);
    res.status(500).send('Server error during production.');
  } finally {
    // Always release the client back to the pool
    client.release();
  }
};