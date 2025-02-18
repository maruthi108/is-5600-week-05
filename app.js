// Import necessary modules
const express = require('express') // Import the Express framework
const api = require('./api') // Import the API functions from the 'api' module
const middleware = require('./middleware') // Import custom middleware
const bodyParser = require('body-parser') // Import body-parser for parsing request bodies

// Set the port for the server to listen on, defaulting to 3000 if not specified in environment variables
const port = process.env.PORT || 3000

// Create an instance of an Express application
const app = express()

// Register the public directory to serve static files like HTML, CSS, and JavaScript
app.use(express.static(__dirname + '/public'))

// Register body-parser middleware to parse JSON bodies of incoming requests
app.use(bodyParser.json())

// Register CORS middleware to handle Cross-Origin Resource Sharing
app.use(middleware.cors)

// Register the root route to serve the home page
app.get('/', api.handleRoot)

// Register routes for managing products
app.get('/products', api.listProducts) // Route to list all products
app.get('/products/:id', api.getProduct) // Route to get a specific product by ID
app.put('/products/:id', api.editProduct) // Route to edit a specific product by ID
app.delete('/products/:id', api.deleteProduct) // Route to delete a specific product by ID
app.post('/products', api.createProduct) // Route to create a new product

// Register routes for managing orders
app.get('/orders', api.listOrders) // Route to list all orders
app.post('/orders/', api.createOrder) // Route to create a new order

app.put('/orders/:id', api.editOrder) // Route to edit a specific order by ID
app.delete('/orders/:id', api.deleteOrder) // Route to delete a specific order by ID

// Start the server and listen on the specified port, logging a message to indicate the server is running
app.listen(port, () => console.log(`Server listening on port ${port}`))


