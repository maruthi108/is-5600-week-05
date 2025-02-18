// Import the `fs` module from Node.js with promises support to handle file operations asynchronously
const fs = require('fs').promises;

// Import the `path` module from Node.js to handle and transform file paths
const path = require('path');

// Import the `cuid` library to generate unique IDs for products
const cuid = require('cuid');

// Import the mongoose instance from the `db.js` file to interact with the MongoDB database
const db = require('./db');

// Define the path to the JSON file that contains product data
const productsFile = path.join(__dirname, 'data/full-products.json');

// Define the Product model schema using the mongoose instance from db
// This schema describes the structure of the product documents in the MongoDB collection
const Product = db.model('Product', {
  // Unique identifier for each product, generated using cuid
  _id: { type: String, default: cuid },

  // Description of the product
  description: { type: String },

  // Alternative description of the product
  alt_description: { type: String },

  // Number of likes for the product, required field
  likes: { type: Number, required: true },

  // URLs related to the product, including regular, small, and thumbnail sizes
  urls: {
    regular: { type: String, required: true }, // URL for regular image size
    small: { type: String, required: true }, // URL for small image size
    thumb: { type: String, required: true }, // URL for thumbnail image size
  },

  // Links to the product, including self and HTML links
  links: {
    self: { type: String, required: true }, // API endpoint link to the product
    html: { type: String, required: true }, // Web link to the product page
  },

  // Information about the user who created or uploaded the product
  user: {
    id: { type: String, required: true }, // User's unique identifier
    first_name: { type: String, required: true }, // User's first name
    last_name: { type: String }, // User's last name (optional)
    portfolio_url: { type: String }, // User's portfolio URL (optional)
    username: { type: String, required: true }, // User's username
  },

  // Array of tags associated with the product
  tags: [{
    title: { type: String, required: true }, // Title of the tag, required for each tag
  }],
});

/**
 * List products with optional filters, sorting, and pagination
 * @param {Object} options - Options for listing products
 * @param {number} options.offset - Number of products to skip (for pagination)
 * @param {number} options.limit - Maximum number of products to return
 * @param {string} options.tag - Filter products by tag title
 * @returns {Promise<Array>} - A promise that resolves to an array of products
 */
async function list(options = {}) {
  // Destructure options object with default values for offset and limit
  const { offset = 0, limit = 25, tag } = options;

  // If a tag is provided, create a query object to match products with the given tag
  const query = tag ? {
    tags: {
      $elemMatch: { // Matches documents that contain an element in the tags array
        title: tag // Matches products that have the specified tag title
      }
    }
  } : {};

  // Find products that match the query, sort by _id in ascending order, skip and limit results for pagination
  const products = await Product.find(query)
    .sort({ _id: 1 }) // Sort by _id in ascending order
    .skip(offset) // Skip the specified number of products (for pagination)
    .limit(limit); // Limit the number of returned products

  return products; // Return the list of products
}

/**
 * Get a single product by its ID
 * @param {string} id - The unique identifier of the product
 * @returns {Promise<object>} - A promise that resolves to the product object
 */
async function get(_id) {
  // Find the product by its _id
  const product = await Product.findById(_id);
  return product; // Return the product object
}

/**
 * Create a new product
 * @param {Object} fields - The fields to create a new product with
 * @returns {Promise<Object>} - A promise that resolves to the newly created product object
 */
async function create(fields) {
  // Create a new product document using the provided fields and save it to the database
  const product = await new Product(fields).save();
  return product; // Return the newly created product
}

/**
 * Edit an existing product
 * @param {string} _id - The unique identifier of the product to edit
 * @param {Object} change - The changes to apply to the product
 * @returns {Promise<Object>} - A promise that resolves to the updated product object
 */
async function edit(_id, change) {
  // Retrieve the existing product using the `get` function
  const product = await get(_id);

  // Iterate over the keys in the change object and apply each change to the product
  Object.keys(change).forEach(function(key) {
    product[key] = change[key]; // Apply changes to the corresponding product fields
  });

  // Save the updated product back to the database
  await product.save();

  return product; // Return the updated product
}

/**
 * Delete an existing product
 * @param {string} _id - The unique identifier of the product to delete
 * @returns {Promise<void>} - A promise that resolves when the deletion is complete
 */
async function destroy(_id) {
  // Delete the product document from the database that matches the provided _id
  return await Product.deleteOne({ _id });
}

// Export the product-related functions to be used in other parts of the application
module.exports = {
  list,   // Function to list products
  create, // Function to create a new product
  edit,   // Function to edit an existing product
  destroy,// Function to delete a product
  get     // Function to get a single product by ID
};
