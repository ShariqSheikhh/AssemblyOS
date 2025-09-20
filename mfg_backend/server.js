require('dotenv').config();
const express = require('express');
const cors = require('cors'); 
const userRoutes = require('./src/api/users.routes');
const productRoutes = require('./src/api/products.routes');
const orderRoutes = require('./src/api/orders.routes');
const workCenterRoutes = require('./src/api/workCenters.routes'); 

const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors()); 
app.use(express.json()); 


app.get('/', (req, res) => {
  res.send('Hello from the AssemblyOS Backend!');
});

app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/work-centers', workCenterRoutes); 

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});