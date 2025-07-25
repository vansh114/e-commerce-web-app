require('dotenv').config();
const connectToMongo = require('./db');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

connectToMongo();
const app = express();
const port = process.env.PORT;

app.use(cors());
app.use(express.json());
app.use(helmet({ contentSecurityPolicy: false }));
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, error: 'Internal Server Error' });
});

app.get('/', (req, res) => { res.send('API is running') });

app.use('/api/auth', require('./routes/auth'));
app.use('/api/user', require('./routes/user'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/products', require('./routes/product'));
app.use('/api/review', require('./routes/review'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/wishlist', require('./routes/wishlist'));
app.use('/api/order', require('./routes/order'));

app.listen(port, () => {
  console.log(`E-Commerce Web App backend listening on port ${port}`);
});