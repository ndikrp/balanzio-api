const express = require('express');
const cors = require('cors');
const responseHelper = require('express-response-helper').helper();
const bodyParser = require('body-parser')
const dotenv = require('dotenv');
const userRoutes = require('./routes/users'); 
const recipeRoutes = require('./routes/recipes');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 8080;
app.use(bodyParser.json());
app.use(responseHelper);
app.use(express.json());
app.use(cors());

app.use(userRoutes);
app.use(recipeRoutes);

app.get("/", async (req, res) => {
    res.json({ status: "Response to this server is success" });
});


app.get("*", async (req, res) => {
    res.json({ status: "Route doesn't exist!" })
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
