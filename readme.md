# Setup and Usage Guide for Shopify OAuth Authentication

## Overview

This application provides a simple Express server for authenticating with Shopify using OAuth 2.0. It handles the OAuth flow and saves the access token to your `.env` file.

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn package manager
- A Shopify app with OAuth credentials (Client ID and Client Secret)
- A Shopify store (development store or regular store)

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

This will install all required packages including:

- `express` - Web server framework
- `dotenv` - Environment variable management
- `node-fetch` - HTTP client for API requests
- `crypto` - Built-in Node.js module for cryptographic operations

### 2. Configure Environment Variables

Create or update your `.env` file in the project root with the following variables:

```env
SHOPIFY_SHOP=your-shop-name
SHOPIFY_CLIENT_ID=your-client-id
SHOPIFY_CLIENT_SECRET=your-client-secret
```

**Where to find these values:**

- **SHOPIFY_SHOP**: Your shop name without `.myshopify.com` (e.g., `sandbox-jaskaran`)
  Dev - **SHOPIFY_CLIENT_ID**: Found in your Shopify Dev Dashboard → Apps → Your App → Client credentials
- **SHOPIFY_CLIENT_SECRET**: Found in the same location as Client ID

### 3. Configure Shopify App Settings

In your Shopify Dev Dashboard, make sure your app's redirect URI is set to:

```
http://localhost:3000/auth/callback
```

The app requests the following scopes:

- `write_content`
- `read_content`
- `write_files`

Ensure these scopes are enabled in your Shopify app settings.

## Usage

### 1. Start the Server

```bash
npm start
```

Or directly:

```bash
node auth.js
```

The server will start on `http://localhost:3000` and display a message with the installation URL.

### 2. Install the App

Open your browser and navigate to:

```
http://localhost:3000/install?shop=your-shop-name.myshopify.com
```

Replace `your-shop-name` with your actual shop name (the same value you used in `SHOPIFY_SHOP`).

**Example:**

```
http://localhost:3000/install?shop=sandbox-jaskaran.myshopify.com
```

### 3. Authorize the App

1. You'll be redirected to Shopify's authorization page
2. Review the requested permissions
3. Click "Install app" to authorize

### 4. Complete Authentication

After authorization, Shopify will redirect you back to:

```
http://localhost:3000/auth/callback
```

The server will:

- Validate the HMAC signature for security
- Exchange the authorization code for an access token
- Save the access token to your `.env` file as `SHOPIFY_ACCESS_TOKEN`
- Display a success message

### 5. Verify Installation

Check your `.env` file - you should see a new line:

```env
SHOPIFY_ACCESS_TOKEN=shpua_...
```

This access token can now be used to make authenticated API requests to Shopify.

## Next Steps

After successful authentication, you can use the `SHOPIFY_ACCESS_TOKEN` from your `.env` file to make authenticated requests to the Shopify Admin API.

Example API request:

```javascript
const response = await fetch(
  `https://${SHOPIFY_SHOP}.myshopify.com/admin/api/2024-01/graphql.json`,
  {
    headers: {
      "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN,
      "Content-Type": "application/json",
    },
    // ... rest of your request
  },
);
```
