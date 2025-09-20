const pool = require('../config/db.config');

exports.createOrder = async (req, res) => {
    const { product_id, quantity_to_produce } = req.body;
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const bomResult = await client.query('SELECT component_id, quantity_required FROM bom_components WHERE product_id = $1', [product_id]);
      const components = bomResult.rows;
      if (components.length === 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: 'This item is not a product or has no recipe.' });
      }
      let isFeasible = true;
      const feasibilityDetails = [];
      for (const component of components) {
        const stockResult = await client.query('SELECT name, quantity_in_stock FROM items WHERE item_id = $1', [component.component_id]);
        const stockInfo = stockResult.rows[0];
        const requiredStock = component.quantity_required * quantity_to_produce;
        const hasEnoughStock = stockInfo.quantity_in_stock >= requiredStock;
        if (!hasEnoughStock) {
          isFeasible = false;
        }
        feasibilityDetails.push({
          name: stockInfo.name,
          required: requiredStock,
          available: stockInfo.quantity_in_stock,
          isAvailable: hasEnoughStock
        });
      }
      if (isFeasible) {
          const newOrder = await client.query(
              'INSERT INTO manufacturing_orders (product_id, quantity_to_produce, status) VALUES ($1, $2, $3) RETURNING *',
              [product_id, quantity_to_produce, 'Planned']
          );
          await client.query('COMMIT');
          return res.status(201).json({ 
              message: 'Order created successfully!', 
              order: newOrder.rows[0], 
              feasibility: { isFeasible: true, details: feasibilityDetails } 
          });
      } else {
          await client.query('ROLLBACK');
          return res.status(400).json({ 
              message: 'Order not feasible due to insufficient components.',
              feasibility: { isFeasible: false, details: feasibilityDetails }
          });
      }
    } catch (error) {
      await client.query('ROLLBACK');
      console.error(error.message);
      res.status(500).send('Server error');
    } finally {
      client.release();
    }
};

exports.getAllOrders = async (req, res) => {
  try {
    const allOrdersQuery = `
      SELECT 
        mo.*, 
        i.name AS product_name,
        i.quantity_in_stock AS quantity_on_hand,
        (
          SELECT 
            i2.quantity_in_stock - COALESCE(SUM(mo2.quantity_to_produce), 0)
          FROM 
            items i2
          LEFT JOIN 
            manufacturing_orders mo2 ON i2.item_id = mo2.product_id AND mo2.status IN ('Planned', 'In Progress')
          WHERE 
            i2.item_id = mo.product_id
          GROUP BY 
            i2.item_id
        ) AS quantity_available
      FROM 
        manufacturing_orders mo
      JOIN 
        items i ON mo.product_id = i.item_id
      ORDER BY 
        mo.created_at DESC;
    `;
    const allOrders = await pool.query(allOrdersQuery);
    res.status(200).json(allOrders.rows);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
};

exports.updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
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