const express = require('express');



// const userRoutes = require('./routes/userRoutes');
// const productRoutes = require('./routes/productRoutes');

const app = express();
const port = 3000;

// Mount the route handlers
app.use('/api/data', unit);
// app.use('/api/users', userRoutes);
// app.use('/api/products', productRoutes);

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
