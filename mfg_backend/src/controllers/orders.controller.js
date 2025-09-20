const pool = require('../config/db.config');

// Create a new manufacturing order
exports.createOrder = async (req, res) => {
  const { product_id, quantity_to_produce } = req.body;
  try {
    const newOrder = await pool.query(
      'INSERT INTO manufacturing_orders (product_id, quantity_to_produce, status) VALUES ($1, $2, $3) RETURNING *',
      [product_id, quantity_to_produce, 'Planned']
    );
    res.status(201).json(newOrder.rows[0]);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
};

// Get all manufacturing orders
exports.getAllOrders = async (req, res) => {
  try {
    // We JOIN with the items table to get the product name
    const allOrders = await pool.query(
      `SELECT mo.*, i.name AS product_name 
       FROM manufacturing_orders mo
       JOIN items i ON mo.product_id = i.item_id
       ORDER BY mo.created_at DESC`
    );
    res.status(200).json(allOrders.rows);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
};

// Update the status of a manufacturing order
exports.updateOrderStatus = async (req, res) => {
  const { id } = req.params; // The ID of the order to update
  const { status } = req.body; // The new status

  // Optional: Add validation to ensure status is one of the allowed values
  const allowedStatuses = ['Planned', 'In Progress', 'Done', 'Canceled'];
  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status value.' });
  }

  try {
    const updateQuery = 'UPDATE manufacturing_orders SET status = $1 WHERE order_id = $2 RETURNING *';
    const updatedOrder = await pool.query(updateQuery, [status, id]);

    if (updatedOrder.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    res.status(200).json(updatedOrder.rows[0]);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
};