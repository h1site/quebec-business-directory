const express = require('express');
const router = express.Router();
const Business = require('../models/Business');

// @route   GET /api/businesses
// @desc    Get all businesses with pagination and filtering
// @access  Public
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Build filter object
    const filter = { status: 'approved' };
    
    if (req.query.regionId) {
      filter.regionId = req.query.regionId;
    }
    
    if (req.query.categoryId) {
      filter.categoryIds = req.query.categoryId;
    }
    
    // Execute query with pagination
    const businesses = await Business.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    // Get total count for pagination
    const total = await Business.countDocuments(filter);
    
    res.json({
      businesses,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   GET /api/businesses/search
// @desc    Search businesses
// @access  Public
router.get('/search', async (req, res) => {
  try {
    const searchTerm = req.query.q;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    if (!searchTerm) {
      return res.status(400).json({ message: 'Search term is required' });
    }
    
    // Search using text index
    const businesses = await Business.find(
      { 
        $text: { $search: searchTerm },
        status: 'approved'
      },
      { score: { $meta: 'textScore' } }
    )
      .sort({ score: { $meta: 'textScore' } })
      .skip(skip)
      .limit(limit);
    
    // Get total count for pagination
    const total = await Business.countDocuments({ 
      $text: { $search: searchTerm },
      status: 'approved'
    });
    
    res.json({
      businesses,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   GET /api/businesses/:id
// @desc    Get business by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const business = await Business.findById(req.params.id);
    
    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }
    
    // Increment view count
    business.viewCount += 1;
    await business.save();
    
    res.json(business);
  } catch (err) {
    console.error(err);
    
    // Check if error is due to invalid ObjectId
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Business not found' });
    }
    
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   POST /api/businesses
// @desc    Create a new business
// @access  Public
router.post('/', async (req, res) => {
  try {
    const {
      name,
      description,
      website,
      email,
      phone,
      address,
      city,
      postalCode,
      regionId,
      categoryIds,
      contactPerson
    } = req.body;
    
    // Basic validation
    if (!name || !description || !email || !address || !city || !postalCode || !regionId) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }
    
    // Create new business
    const newBusiness = new Business({
      name,
      description,
      website,
      email,
      phone,
      address,
      city,
      postalCode,
      regionId,
      categoryIds: categoryIds || [],
      contactPerson,
      status: 'pending' // All new submissions start as pending
    });
    
    const business = await newBusiness.save();
    
    res.status(201).json(business);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   PUT /api/businesses/:id
// @desc    Update a business
// @access  Private (would require auth middleware in production)
router.put('/:id', async (req, res) => {
  try {
    const {
      name,
      description,
      website,
      email,
      phone,
      address,
      city,
      postalCode,
      regionId,
      categoryIds,
      contactPerson,
      status
    } = req.body;
    
    // Find business
    let business = await Business.findById(req.params.id);
    
    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }
    
    // Update fields
    business.name = name || business.name;
    business.description = description || business.description;
    business.website = website || business.website;
    business.email = email || business.email;
    business.phone = phone || business.phone;
    business.address = address || business.address;
    business.city = city || business.city;
    business.postalCode = postalCode || business.postalCode;
    business.regionId = regionId || business.regionId;
    business.categoryIds = categoryIds || business.categoryIds;
    business.contactPerson = contactPerson || business.contactPerson;
    business.status = status || business.status;
    business.updatedAt = Date.now();
    
    // Save updated business
    business = await business.save();
    
    res.json(business);
  } catch (err) {
    console.error(err);
    
    // Check if error is due to invalid ObjectId
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Business not found' });
    }
    
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   DELETE /api/businesses/:id
// @desc    Delete a business
// @access  Private (would require auth middleware in production)
router.delete('/:id', async (req, res) => {
  try {
    const business = await Business.findById(req.params.id);
    
    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }
    
    await business.remove();
    
    res.json({ message: 'Business removed' });
  } catch (err) {
    console.error(err);
    
    // Check if error is due to invalid ObjectId
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Business not found' });
    }
    
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
