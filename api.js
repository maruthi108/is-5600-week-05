// Import necessary modules
const path = require('path') // Node.js module to handle file paths
const Products = require('./products') // Import the Products service/module
const Orders = require('./orders'); // Import the Orders service/module
const autoCatch = require('./lib/auto-catch') // Wrapper to catch errors in async functions

/**
 * Serve the root HTML file when the root route is accessed.
 * @param {object} req - Express request object
 * @param {object} res - Express response object
*/
function handleRoot(req, res) {
  res.sendFile(path.join(__dirname, '/index.html')); // Send index.html file as response
}

/**
 * List all products with pagination and optional tag filtering.
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
async function listProducts(req, res) {
  // Extract the limit, offset, and tag query parameters from the request
  const { offset = 0, limit = 25, tag } = req.query
  // Fetch the list of products from the Products service, with pagination and tag filtering
  res.json(await Products.list({
    offset: Number(offset),
    limit: Number(limit),
    tag
  }))
}

/**
 * Get a single product by its ID.
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next middleware function
 */
async function getProduct(req, res, next) {
  const { id } = req.params // Extract the product ID from the request parameters

  const product = await Products.get(id) // Fetch the product by its ID
  if (!product) {
    return next() // If no product is found, call the next middleware (usually 404 handler)
  }

  return res.json(product) // Send the product data as JSON
}

/**
 * Create a new product.
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
async function createProduct(req, res) {
  const product = await Products.create(req.body) // Create a new product using request body data
  res.json(product) // Send the created product data as JSON
}

/**
 * Edit an existing product by its ID.
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next middleware function
 */
async function editProduct(req, res, next) {
  const change = req.body // Extract the updated product data from the request body
  const product = await Products.edit(req.params.id, change) // Update the product with the new data
  res.json(product) // Send the updated product data as JSON
}

/**
 * Delete a product by its ID.
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next middleware function
 */
async function deleteProduct(req, res, next) {
  const response = await Products.destroy(req.params.id) // Delete the product by its ID
  res.json(response) // Send the deletion response as JSON
}

/**
 * Create a new order.
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next middleware function
 */
async function createOrder(req, res, next) {
  const order = await Orders.create(req.body) // Create a new order using request body data
  res.json(order) // Send the created order data as JSON
}

/**
 * List all orders with pagination and optional productId and status filtering.
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next middleware function
 */
async function listOrders(req, res, next) {
  // Extract the limit, offset, productId, and status query parameters from the request
  const { offset = 0, limit = 25, productId, status } = req.query
  // Fetch the list of orders from the Orders service, with pagination and optional filters
  const orders = await Orders.list({
    offset: Number(offset),
    limit: Number(limit),
    productId,
    status
  })
  res.json(orders) // Send the list of orders as JSON
}

/**
 * Edit an existing order by its ID.
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next middleware function
 */
async function editOrder(req, res, next) {
  const change = req.body // Extract the updated order data from the request body
  const order = await Orders.edit(req.params.id, change) // Update the order with the new data
  res.json(order) // Send the updated order data as JSON
}

/**
 * Delete an order by its ID.
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next middleware function
 */
async function deleteOrder(req, res, next) {
  await Orders.destroy(req.params.id) // Delete the order by its ID
  res.json({ success: true }) // Send success response
}

// Export all the functions wrapped in autoCatch for error handling
module.exports = autoCatch({
  handleRoot,
  listProducts,
  getProduct,
  createProduct,
  editProduct,
  deleteProduct,
  createOrder,
  listOrders,
  editOrder,
  deleteOrder
});

