import express from "express";
import dotenv from "dotenv";
import crypto from "crypto";
import fetch from "node-fetch";
import fs from "fs";

dotenv.config();

const app = express();
const PORT = 3000;

const CLIENT_ID = process.env.SHOPIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SHOPIFY_CLIENT_SECRET;
const SCOPES = "write_content,read_content,write_files";
const REDIRECT_URI = "http://localhost:3000/auth/callback";
const SHOPIFY_SHOP = process.env.SHOPIFY_SHOP;

app.get("/install", (req, res) => {
  const shop = req.query.shop;

  if (!shop) {
    return res
      .status(400)
      .send(
        "Missing shop parameter. Try: /install?shop=your-store.myshopify.com",
      );
  }

  const state = crypto.randomBytes(16).toString("hex");
  const installUrl = `https://${shop}/admin/oauth/authorize?client_id=${CLIENT_ID}&scope=${SCOPES}&redirect_uri=${REDIRECT_URI}&state=${state}`;

  res.redirect(installUrl);
});

app.get("/auth/callback", async (req, res) => {
  const { shop, code } = req.query;

  const hmac = req.query.hmac;
  const queryParams = Object.assign({}, req.query);
  delete queryParams.hmac;

  const message = Object.keys(queryParams)
    .sort()
    .map((key) => `${key}=${queryParams[key]}`)
    .join("&");

  const generatedHash = crypto
    .createHmac("sha256", CLIENT_SECRET)
    .update(message)
    .digest("hex");

  if (generatedHash !== hmac) {
    return res.status(400).send("HMAC validation failed");
  }

  try {
    const response = await fetch(`https://${shop}/admin/oauth/access_token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code: code,
      }),
    });

    const data = await response.json();
    fs.appendFileSync(
      `.env`,
      `\n
      # Authenticated Admin Access Token \n
      SHOPIFY_ACCESS_TOKEN=${data.access_token}`,
    );

    res.send(
      `<h1>App Installed Successfully!</h1><p>Shop: ${shop}</p><p>Access Token: ${data.access_token.substring(0, 20)}... Check your code. You won't get everything here.</p><p>Token saved to .env</p><p>Scopes: ${data.scope}</p>`,
    );
  } catch (error) {
    console.error("Error getting access token:", error);
    res.status(500).send("Failed to get access token");
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(
    `\nTo install the app, visit:\nhttp://localhost:${PORT}/install?shop=${SHOPIFY_SHOP}.myshopify.com`,
  );
});
