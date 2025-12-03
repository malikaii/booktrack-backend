require("dotenv").config();
const express = require("express");
const session = require("express-session");

const app = express();

const jwt = require("jsonwebtoken");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

let refreshTokens = [];

app.post("/token", (req, res) => {
  const refreshToken = req.body.token;

  if (refreshToken == null) return res.sendStatus(401);
  if (!refreshTokens.includes(refreshToken)) {

    return res.sendStatus(403);
  }
  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) {

      return res.sendStatus(403);
    }
    const accessToken = generateAccessToken({ name: user.name });
    res.json({ accessToken });
  });
});


app.delete("/logout", (req, res) => {
  refreshTokens = refreshTokens.filter(token => token !== req.body.token)

  return res.sendStatus(204)
})


app.post("/login", (req, res) => {
  const username = req.body.username;

  const user = { name: username };

  const accessToken = generateAccessToken(user);
  const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET);
  refreshTokens.push(refreshToken);
  // Send access and refresh token back to client
  res.json({ accessToken: accessToken, refreshToken: refreshToken });
});

function generateAccessToken(user) {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "45s" });
}

app.listen(4000, () => {
  console.log("Server is running on port 4000");
});
