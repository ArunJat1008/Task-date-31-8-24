const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  try {
    let token = req.header("Authorization");

    if (!token) {
      return res.status(401).send({ error: "No token provided" });
    }

    token = token.split(" ")[1];

    jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
      if (err) {
        return res.status(401).send({ error: "Invalid token" });
      }

      if (req.method == "GET") {
        req.query.id = decoded.id;
      } else {
        req.body.id = decoded.id;
      }

      next();
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = authMiddleware;
