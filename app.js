const express = require("express");
const cors = require("cors");
require("dotenv").config();
const sequelize = require("./utils/database");
const app = express();
app.use(express.urlencoded({ limit: "5000mb" }));
app.use(express.raw({ limit: "5000mb" }));
app.use(express.json({ limit: "5000mb" }));
app.use(cors());

const userRoute = require("./routes/user_route");

app.use("/api/auth", userRoute);

const PORT = process.env.PORT;

sequelize.sync().then(() => {
  console.log("All models connected successfully");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
