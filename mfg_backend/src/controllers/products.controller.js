const pool = require('../config/db.config');

exports.createProduct = async (req, res) => {
  
  const { name, quantity_in_stock, is_product, components } = req.body;

  const client = await pool.connect(); 
  try {
    
    await client.query('BEGIN');

    
    const productQuery = 'INSERT INTO items (name, quantity_in_stock, is_product) VALUES ($1, $2, $3) RETURNING item_id';
    const productResult = await client.query(productQuery, [name, quantity_in_stock, is_product]);
    const newProductId = productResult.rows[0].item_id;

  
    for (const component of components) {
      const bomQuery = 'INSERT INTO bom_components (product_id, component_id, quantity_required, step_order) VALUES ($1, $2, $3, $4)';
      await client.query(bomQuery, [newProductId, component.item_id, component.quantity_required, component.step_order]);
    }

   
    await client.query('COMMIT');

    res.status(201).json({ message: 'Product and BOM created successfully!', productId: newProductId });

  } catch (error) {
    
    await client.query('ROLLBACK');
    console.error(error.message);
    res.status(500).send('Server error during transaction');
  } finally {
    
    client.release();
  }
};


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


exports.getAllProducts = async (req, res) => {
  try {
    const products = await pool.query("SELECT * FROM items WHERE is_product = true ORDER BY name");
    res.status(200).json(products.rows);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
};


exports.getInventory = async (req, res) => {
  try {
    const inventory = await pool.query("SELECT item_id, name, quantity_in_stock FROM items ORDER BY name");
    res.status(200).json(inventory.rows);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
};


exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params; 

    
    const productResult = await pool.query('SELECT * FROM items WHERE item_id = $1 AND is_product = true', [id]);

    if (productResult.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found.' });
    }
    const product = productResult.rows[0];

    
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