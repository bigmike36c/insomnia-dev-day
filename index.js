const express = require('express');
const app = express();
const itemsRouter = require('./routes/items');

app.use(express.json());
app.use('/items', itemsRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));