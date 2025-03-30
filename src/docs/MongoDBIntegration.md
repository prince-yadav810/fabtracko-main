
# MongoDB Integration Guide for Vikas Fabrication Works

## 1. Overview and Objectives

### Purpose

This document provides technical guidance for integrating MongoDB with the Vikas Fabrication Works backend application. MongoDB was chosen as the database solution due to its flexibility, scalability, and suitability for document-based data models that align with our application's requirements.

### Data Storage Requirements

The following types of data will be stored in MongoDB:

1. **Authentication Data**:
   - User credentials (username and hashed passwords)
   - Authentication tokens

2. **Worker Information**:
   - Personal details (name)
   - Profile pictures (as URL references)
   - Employment information (joining date)
   - Compensation details (daily wage)

3. **Attendance Records**:
   - Daily status tracking (present, absent, half-day, overtime)
   - Date information
   - Worker relationships

4. **Payment Records**:
   - Advance payments
   - Overtime compensation
   - Transaction dates
   - Worker relationships

### Benefits of MongoDB Integration

- **Flexible Schema**: Allows for evolution of data models without extensive migrations
- **Document-Oriented**: Natural fit for hierarchical or nested data structures
- **Scalability**: Ability to scale horizontally as data volume increases
- **Performance**: Efficient querying for our specific access patterns
- **Cloud Compatibility**: Seamless integration with Google Cloud services

## 2. MongoDB Connection Setup

### Installation and Configuration

1. **Install the MongoDB Node.js Driver**:

```bash
npm install mongodb mongoose
```

For our application, we're using Mongoose (an ODM for MongoDB) to provide schema validation and simplify interactions with the database:

```bash
npm install mongoose
```

2. **Basic Connection Setup**:

```javascript
const mongoose = require('mongoose');
require('dotenv').config(); // For loading environment variables

// Connection string (store in .env file)
const MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));
```

### Connection String Format

MongoDB connection strings follow this format:

```
mongodb+srv://<username>:<password>@<cluster-address>/<database-name>?retryWrites=true&w=majority
```

Where:
- `<username>` and `<password>` are your MongoDB Atlas credentials
- `<cluster-address>` is your MongoDB Atlas cluster address
- `<database-name>` is the name of your database
- Additional query parameters configure connection behavior

### Secure Credential Storage

1. **Environment Variables** (recommended approach):
   - Store MongoDB connection details in environment variables
   - Use a `.env` file locally (but exclude from version control)
   - Set environment variables in your cloud deployment platform

Example `.env` file structure:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority
```

2. **Connection Options for Production**:

```javascript
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  connectTimeoutMS: 10000,
};

mongoose.connect(MONGODB_URI, options)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));
```

### Best Practices for Cloud Environments

1. **Connection Pooling**:
   - MongoDB Node.js drivers implement connection pooling by default
   - For Google Cloud Run or similar serverless platforms, set `maxPoolSize` appropriately:

```javascript
const options = {
  maxPoolSize: 10, // Adjust based on expected concurrent operations
};
```

2. **Network Security**:
   - Configure MongoDB Atlas Network Access to only allow connections from your application's IP or IP range
   - For Google Cloud, use VPC peering when possible for private connectivity

3. **Handling Reconnection**:
   - Mongoose will attempt to reconnect automatically if the connection is lost
   - Implement additional reconnection logic for critical operations:

```javascript
mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected, attempting to reconnect...');
});

mongoose.connection.on('reconnected', () => {
  console.log('MongoDB reconnected successfully');
});
```

## 3. Data Modeling and Schema Design

### Authentication Model

```javascript
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  // Optional additional fields
  lastLogin: Date,
  role: {
    type: String,
    enum: ['admin', 'viewer'],
    default: 'admin'
  }
}, { timestamps: true });

// Pre-save hook to hash passwords
userSchema.pre('save', async function(next) {
  // Only hash the password if it's modified or new
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;
```

### Worker Model

```javascript
const mongoose = require('mongoose');

const workerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  profilePicture: {
    type: String, // URL to profile picture
    default: '/placeholder.svg'
  },
  joiningDate: {
    type: String, // Store as ISO date string for consistency
    required: true
  },
  dailyWage: {
    type: Number,
    required: true,
    min: 0
  },
  // Optional additional fields
  contactInfo: {
    phone: String,
    address: String
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

// Indexes to optimize queries
workerSchema.index({ name: 1 });
workerSchema.index({ isActive: 1, name: 1 });

const Worker = mongoose.model('Worker', workerSchema);
module.exports = Worker;
```

### Attendance Model

```javascript
const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  workerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Worker',
    required: true
  },
  date: {
    type: String, // Store as ISO date string for consistency
    required: true
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'halfday', 'overtime'],
    required: true
  }
}, { timestamps: true });

// Compound index to ensure unique attendance records per worker per day
attendanceSchema.index({ workerId: 1, date: 1 }, { unique: true });

// Optional: Add a virtual field for color-coded indicators
attendanceSchema.virtual('statusColor').get(function() {
  switch(this.status) {
    case 'present': return 'green';
    case 'absent': return 'red';
    case 'halfday': return 'yellow';
    case 'overtime': return 'blue';
    default: return 'gray';
  }
});

const Attendance = mongoose.model('Attendance', attendanceSchema);
module.exports = Attendance;
```

### Payment Model

```javascript
const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  workerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Worker',
    required: true
  },
  date: {
    type: String, // Store as ISO date string for consistency
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  type: {
    type: String,
    enum: ['advance', 'overtime'],
    required: true
  },
  // Optional additional fields
  description: String,
  approvedBy: String
}, { timestamps: true });

// Indexes for querying payments by worker and date
paymentSchema.index({ workerId: 1 });
paymentSchema.index({ date: 1 });
paymentSchema.index({ workerId: 1, date: 1 });

const Payment = mongoose.model('Payment', paymentSchema);
module.exports = Payment;
```

### Schema Design Best Practices

1. **Data Validation**:
   - Use Mongoose's built-in validators for type checking and range validation
   - Add custom validators for complex business rules

2. **Indexing Strategy**:
   - Create indexes for frequently queried fields
   - Use compound indexes for queries on multiple fields
   - Consider the uniqueness and cardinality of fields when designing indexes

3. **Relationships**:
   - Use MongoDB references (`ObjectId` references) for relationships
   - For frequently accessed related data, consider embedding smaller documents
   - Use `populate()` in Mongoose to retrieve related documents in a single query

4. **Schema Evolution**:
   - Plan for schema changes over time
   - Consider using versioning for critical schemas
   - Design with future extensibility in mind

## 4. Security Best Practices

### Password Security

1. **Hashing with Bcrypt**:
   - Never store passwords in plain text
   - Use bcrypt for password hashing with appropriate salt rounds
   - Implement password hashing in pre-save hooks (as shown in the User model)

2. **Authentication Token Security**:
   - Use JWT (JSON Web Tokens) for session management
   - Store tokens with appropriate expiration times
   - Implement token refresh mechanisms for better security

```javascript
// Example JWT token generation
const jwt = require('jsonwebtoken');

function generateToken(user) {
  return jwt.sign(
    { id: user._id, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );
}
```

### Access Control

1. **Middleware for Route Protection**:

```javascript
// Authentication middleware
const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token', error: error.message });
  }
};
```

2. **Mongoose Field Projection**:
   - Always exclude sensitive fields when returning user documents:

```javascript
// Example of excluding password field in queries
const user = await User.findById(id).select('-password');
```

### Environment Variable Management

1. **Storing Secrets**:
   - Use `.env` files for local development (never commit to version control)
   - Use environment variables in production deployments
   - Consider using a secrets management solution for more complex deployments

2. **Required Environment Variables**:

```javascript
// Validate required environment variables at startup
function validateEnv() {
  const required = ['MONGODB_URI', 'JWT_SECRET'];
  
  for (const variable of required) {
    if (!process.env[variable]) {
      console.error(`Error: Environment variable ${variable} is required`);
      process.exit(1);
    }
  }
}

validateEnv();
```

3. **Connection String Security**:
   - Never hardcode MongoDB credentials in your codebase
   - Use environment variables for all sensitive connection information
   - Rotate credentials periodically for better security

## 5. Integration with the Backend

### CRUD Operation Patterns

1. **User Authentication Operations**:

```javascript
// Example user creation
async function createUser(username, password) {
  try {
    const newUser = new User({ username, password });
    await newUser.save();
    return { success: true, userId: newUser._id };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Example login
async function loginUser(username, password) {
  try {
    const user = await User.findOne({ username });
    if (!user) return { success: false, message: 'User not found' };
    
    const isMatch = await user.comparePassword(password);
    if (!isMatch) return { success: false, message: 'Invalid credentials' };
    
    const token = generateToken(user);
    return {
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username
      }
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
```

2. **Worker Data Operations**:

```javascript
// Create a new worker
async function addWorker(workerData) {
  try {
    const worker = new Worker(workerData);
    await worker.save();
    return { success: true, worker };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Get all workers
async function getAllWorkers() {
  try {
    const workers = await Worker.find({ isActive: true }).sort({ name: 1 });
    return { success: true, workers };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Update worker
async function updateWorker(id, updates) {
  try {
    const worker = await Worker.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    );
    if (!worker) return { success: false, message: 'Worker not found' };
    return { success: true, worker };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Delete worker
async function deleteWorker(id) {
  try {
    const worker = await Worker.findByIdAndDelete(id);
    if (!worker) return { success: false, message: 'Worker not found' };
    return { success: true, message: 'Worker deleted' };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
```

3. **Attendance Operations**:

```javascript
// Mark attendance
async function markAttendance(workerId, date, status) {
  try {
    // Check if record already exists
    const existingRecord = await Attendance.findOne({ workerId, date });
    
    if (existingRecord) {
      // Update existing record
      existingRecord.status = status;
      await existingRecord.save();
      return { success: true, attendance: existingRecord };
    }
    
    // Create new record
    const attendance = new Attendance({ workerId, date, status });
    await attendance.save();
    return { success: true, attendance };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Get attendance by date range
async function getAttendanceByDateRange(startDate, endDate) {
  try {
    const records = await Attendance.find({
      date: { $gte: startDate, $lte: endDate }
    }).populate('workerId', 'name');
    
    return { success: true, records };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
```

4. **Payment Operations**:

```javascript
// Add payment
async function addPayment(paymentData) {
  try {
    const payment = new Payment(paymentData);
    await payment.save();
    return { success: true, payment };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Get payments by worker
async function getPaymentsByWorker(workerId) {
  try {
    const payments = await Payment.find({ workerId })
      .sort({ date: -1 });
    
    return { success: true, payments };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Delete payment
async function deletePayment(id) {
  try {
    const payment = await Payment.findByIdAndDelete(id);
    if (!payment) return { success: false, message: 'Payment not found' };
    return { success: true, message: 'Payment deleted' };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
```

### Error Handling Best Practices

1. **Try-Catch Pattern**:
   - Wrap database operations in try-catch blocks
   - Return structured error responses
   - Log errors for server-side debugging

2. **Structured Error Responses**:

```javascript
// Example error handler middleware
function errorHandler(err, req, res, next) {
  console.error(err.stack);
  
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  res.status(statusCode).json({
    error: {
      message,
      status: statusCode,
      timestamp: new Date().toISOString()
    }
  });
}
```

3. **Connection Pooling and Performance**:
   - MongoDB Node.js driver implements connection pooling automatically
   - For optimal performance, reuse the mongoose connection throughout your application
   - Implement timeouts for operations that might take too long:

```javascript
// Example of query with timeout
const result = await Model.find().maxTimeMS(5000);
```

## 6. Testing and Deployment Considerations

### Testing MongoDB Integration

1. **Unit Testing with a Test Database**:

```javascript
// Example using Jest with a test database
beforeAll(async () => {
  const mongoUri = 'mongodb://localhost:27017/test_db';
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

test('should save a user to the database', async () => {
  const testUser = new User({ username: 'testuser', password: 'password123' });
  await testUser.save();
  
  const savedUser = await User.findOne({ username: 'testuser' });
  expect(savedUser).not.toBeNull();
  expect(savedUser.username).toBe('testuser');
});
```

2. **Integration Testing**:
   - Use a dedicated test database for integration tests
   - Test all CRUD operations and edge cases
   - Implement cleanup routines to reset the database between tests

### Deployment Strategies

1. **MongoDB Atlas Deployment**:
   - Create a MongoDB Atlas cluster (M0 free tier for development, M10+ for production)
   - Configure network access and database users
   - Obtain the connection string for your application

2. **Google Cloud Run Deployment**:
   - Set up a containerized application (Dockerfile)
   - Configure environment variables in the Cloud Run service
   - Ensure proper connection handling for serverless environments

3. **Logging and Monitoring**:

```javascript
// Example of enhanced logging for database operations
mongoose.set('debug', process.env.NODE_ENV !== 'production');

// Connection event logging
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
  // Optional: Send alert or notification for critical errors
});

mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB disconnected');
});

mongoose.connection.on('reconnected', () => {
  console.info('MongoDB reconnected');
});
```

4. **High Availability Considerations**:
   - Use MongoDB Atlas for automatic failover and high availability
   - Implement retry logic for critical operations
   - Set appropriate connection timeouts and server selection timeouts

## 7. Troubleshooting and FAQs

### Common Issues and Solutions

1. **Connection Failures**:
   - **Issue**: Unable to connect to MongoDB Atlas
   - **Solution**: Verify network access settings in Atlas, check IP whitelist, and validate credentials

2. **Query Performance Problems**:
   - **Issue**: Slow queries or timeouts
   - **Solution**: Review indexes, check query patterns, use explain() to analyze query performance:

```javascript
const explanation = await Model.find({ field: value }).explain();
console.log(explanation);
```

3. **Schema Validation Errors**:
   - **Issue**: Data validation errors when saving documents
   - **Solution**: Review schema definitions, check data types, and implement custom validators where needed

4. **Memory Issues**:
   - **Issue**: High memory usage with large result sets
   - **Solution**: Use pagination, limit query results, and use projection to select only needed fields:

```javascript
// Pagination example
const page = 1;
const limit = 20;
const skip = (page - 1) * limit;

const results = await Model.find()
  .skip(skip)
  .limit(limit)
  .select('field1 field2');
```

### Frequently Asked Questions

1. **Q: How do I optimize MongoDB for read-heavy operations?**
   - A: Create appropriate indexes, consider read replicas, and implement caching strategies for frequently accessed data.

2. **Q: What's the best practice for storing large binary data like images?**
   - A: Store binary data externally (cloud storage, file system) and save references in MongoDB. For smaller files (<16MB), GridFS can be used.

3. **Q: How can I perform transactions across multiple collections?**
   - A: Use MongoDB transactions for operations that span multiple collections:

```javascript
const session = await mongoose.startSession();
session.startTransaction();

try {
  // Perform operations within the transaction
  await Model1.create([{ data }], { session });
  await Model2.findOneAndUpdate({ query }, { update }, { session });
  
  await session.commitTransaction();
} catch (error) {
  await session.abortTransaction();
  throw error;
} finally {
  session.endSession();
}
```

4. **Q: How do I handle schema evolution over time?**
   - A: Plan for schema changes, use schema versioning when needed, and consider migration strategies for existing data.

### Additional Resources

1. Official Documentation:
   - [MongoDB Documentation](https://docs.mongodb.com/)
   - [Mongoose Documentation](https://mongoosejs.com/docs/)
   - [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)

2. Security Resources:
   - [MongoDB Security Checklist](https://docs.mongodb.com/manual/administration/security-checklist/)
   - [OWASP Authentication Best Practices](https://owasp.org/www-project-cheat-sheets/cheatsheets/Authentication_Cheat_Sheet)

3. Performance Optimization:
   - [MongoDB Performance Best Practices](https://docs.mongodb.com/manual/core/query-optimization/)
   - [Mongoose Performance Optimization](https://mongoosejs.com/docs/guide.html#indexes)

## Conclusion

This document has outlined the key aspects of integrating MongoDB with the Vikas Fabrication Works backend application. By following these guidelines, you can ensure a secure, efficient, and maintainable database integration that will support your application's data management needs.

Remember that database design and integration is an iterative process. Start with a solid foundation, monitor performance, and refine your approach based on actual usage patterns and requirements as they evolve.
