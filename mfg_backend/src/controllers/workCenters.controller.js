const pool = require('../config/db.config');

exports.getWorkCenterStats = async (req, res) => {
  try {
    const statsQuery = `
      SELECT
          wc.name,
          wc.cost_per_hour,
          -- Sum time for 'Done' orders, convert minutes to hours
          COALESCE(SUM(CASE WHEN mo.status = 'Done' THEN bc.time_required_mins ELSE 0 END) / 60.0, 0) AS hours_worked
      FROM
          work_centers wc
      LEFT JOIN
          bom_components bc ON wc.name = bc.operation_name
      LEFT JOIN
          manufacturing_orders mo ON bc.product_id = mo.product_id
      GROUP BY
          wc.id
      ORDER BY
          wc.name;
    `;
    const statsResult = await pool.query(statsQuery);
    res.status(200).json(statsResult.rows);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
};
