// Import the `cuid` library to generate unique identifiers for orders
const cuid = require('cuid');

// Import the mongoose instance from the `db.js` file
const db = require('./db');

// Define the Order model using the mongoose instance from db
// The schema specifies the structure of the order documents in the MongoDB collection
const Order = db.model('Order', {
  // Custom _id field that uses cuid to generate unique string identifiers for each order
  _id: { type: String, default: cuid },

  // The buyer's email address, required for each order
  buyerEmail: { type: String, required: true },

  // Array of product IDs associated with the order
  // `ref` links to the Product model to enable population (join-like behavior)
  products: [{
    type: String, // Product ID type (usually ObjectId in MongoDB)
    ref: 'Product', // Reference to the Product collection
    index: true, // Index for faster querying
    required: true // Each order must have at least one product
  }],

  // Order status, default is 'CREATED'
  // Only allows specific values: 'CREATED', 'PENDING', or 'COMPLETED'
  status: {
    type: String,
    index: true, // Indexed for faster querying
    default: 'CREATED', // Default status for a new order
    enum: ['CREATED', 'PENDING', 'COMPLETED'] // Allowed status values
  }
});

/**
 * List orders with optional filters
 * @param {Object} options - Options to filter, sort, and paginate the list of orders
 * @returns {Promise<Array>} - A promise that resolves to an array of orders
 */
async function list(options = {}) {
  // Destructure the options object with default values for offset and limit
  const { offset = 0, limit = 25, productId, status } = options;

  // Create a query object for filtering orders based on productId, if provided
  const productQuery = productId ? {
    products: productId // Matches orders that contain the specified productId
  } : {};

  // Create a query object for filtering orders based on status, if provided
  const statusQuery = status ? {
    status: status // Matches orders with the specified status
  } : {};

  // Combine the productQuery and statusQuery objects into a single query object
  const query = {
    ...productQuery,
    ...statusQuery
  };

  // Execute the query using the Order model
  const orders = await Order.find(query)
    .sort({ _id: 1 }) // Sort orders by _id in ascending order
    .skip(offset) // Skip the specified number of records (for pagination)
    .limit(limit); // Limit the number of returned records (for pagination)

  return orders; // Return the list of orders
}

/**
 * Get an order by its ID
 * @param {String} _id - The unique identifier of the order
 * @returns {Promise<Object>} - A promise that resolves to the order object
 */
async function get(_id) {
  // Find the order by its _id and populate the products field
  // `populate('products')` will replace the product IDs with the actual product documents
  const order = await Order.findById(_id)
    .populate('products') // Automatically fetch the associated product details
    .exec(); // Execute the query

  return order; // Return the order object
}

/**
 * Create a new order
 * @param {Object} fields - The fields to create a new order with
 * @returns {Promise<Object>} - A promise that resolves to the newly created order object
 */
async function create(fields) {
  // Create a new order document using the provided fields and save it to the database
  const order = await new Order(fields).save();

  // Populate the products field to include detailed product information
  await order.populate('products');

  return order; // Return the newly created order
}

/**
 * Edit an existing order
 * @param {String} _id - The unique identifier of the order to edit
 * @param {Object} change - The changes to apply to the order
 * @returns {Promise<Object>} - A promise that resolves to the updated order object
 */
async function edit(_id, change) {
  // Retrieve the existing order using the `get` function
  const order = await get(_id);

  // Iterate over the keys in the change object and apply each change to the order
  Object.keys(change).forEach(function(key) {
    order[key] = change[key]; // Apply changes to the corresponding order fields
  });

  // Save the updated order back to the database
  await order.save();

  return order; // Return the updated order
}

/**
 * Delete an existing order
 * @param {String} _id - The unique identifier of the order to delete
 * @returns {Promise<void>} - A promise that resolves when the deletion is complete
 */
async function destroy(_id) {
  // Delete the order document from the database that matches the provided _id
  await Order.deleteOne({ _id });
}

// Export the order-related functions to be used in other parts of the application
module.exports = {
  create,
  get,
  list,
  edit,
  destroy
};
