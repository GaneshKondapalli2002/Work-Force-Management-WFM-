const express = require('express');
const admin = require('firebase-admin');
const router = express.Router();
const JobPost = require('../models/jobpost');
const auth = require('../middleware/auth');

const serviceAccount = require('../config/serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// POST /api/jobPosts - Create a new job post
router.post('/', auth, async (req, res) => {
  const { Date, Shift, Location, Starttime, Endtime, JobDescription, Payment, TemplateName, isTemplate } = req.body;

  try {
    const newJobPost = new JobPost({
      user: req.user.id,
      Date,
      Shift,
      Location,
      Starttime,
      Endtime,
      JobDescription,
      Payment,
      TemplateName,
      isTemplate
    });
    const jobPost = await newJobPost.save();

    // Send notification to all devices subscribed to 'job_posts' topic
    const message = {
      notification: {
        title: 'New Job Posted!',
        body: `A new job post has been created. Shift: ${Shift}, Location: ${Location}, JobDescription: ${JobDescription}`,
      },
      topic: 'job_posts',
    };

    await admin.messaging().send(message);

    res.json(jobPost);
  } catch (err) {
    console.error('Error creating job post:', err.message);
    res.status(500).send('Server Error');
  }
});

// GET /api/jobPosts - Fetch all job posts
router.get('/', async (req, res) => {
  try {
    // Extract the isTemplate query parameter from the request
    const isTemplate = req.query.isTemplate === 'true';

    // Find job posts based on the isTemplate filter
    const jobPosts = await JobPost.find({ isTemplate }).sort({ createdAt: -1 });

    res.json(jobPosts);
  } catch (err) {
    console.error('Error fetching job posts:', err.message);
    res.status(500).send('Server Error');
  }
});

// GET /api/jobPosts/:id - Fetch a specific job post by ID
router.get('/:id', async (req, res) => {
  const jobId = req.params.id;

  try {
    const jobPost = await JobPost.findById(jobId);
    if (!jobPost) {
      return res.status(404).json({ msg: 'Job post not found' });
    }
    res.json(jobPost);
  } catch (err) {
    console.error('Error fetching job post:', err.message);
    res.status(500).send('Server Error');
  }
});

// PUT /api/jobPosts/:id - Update a job post
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const updatedJobPost = req.body;

  try {
    const updatedJob = await JobPost.findByIdAndUpdate(id, updatedJobPost, { new: true });
    res.status(200).json(updatedJob);
  } catch (error) {
    console.error('Error updating job post:', error);
    res.status(500).json({ message: 'Failed to update job post' });
  }
});

// DELETE /api/jobPosts/:id - Delete a job post
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await JobPost.findByIdAndDelete(id);
    res.json({ message: 'Job post deleted successfully' });
  } catch (err) {
    console.error('Error deleting job post:', err);
    res.status(500).json({ error: 'Server Error' });
  }
});

// GET /api/jobPosts/upcoming - Fetch upcoming job posts
router.get('/upcoming', async (req, res) => {
    try {
        const jobs = await JobPost.find({ status: 'upcoming' });
        res.json(jobs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// PUT /api/jobPosts/accept/:id - Accept a job post
router.put('/accept/:id', auth, async (req, res) => {
  const { id } = req.params;

  try {
    const jobPost = await JobPost.findById(id);
    if (!jobPost) {
      return res.status(404).json({ msg: 'Job post not found' });
    }

    // Check if job post is already accepted or completed
    if (jobPost.status !== 'open') {
      return res.status(400).json({ message: 'Job already accepted or completed' });
    }

    // Update job post status to 'upcoming' and assign to the user
    jobPost.status = 'upcoming';
    jobPost.assignedTo = req.user.id;

    await jobPost.save();
    res.json(jobPost); // Return updated job object
  } catch (error) {
    console.error('Error accepting job:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/jobPosts/checkIn/:id - Check in to a job
router.put('/checkIn/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const job = await JobPost.findById(id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.status !== 'upcoming') {
      return res.status(400).json({ message: 'Job not in upcoming status' });
    }

    // Update job status to 'checkedIn' and store check-in time
    job.status = 'checkedIn';
    job.checkInTime = new Date();

    // Save updated job
    await job.save();

    // Return updated job object
    res.json(job);
  } catch (error) {
    console.error('Error checking in job:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/jobPosts/checkOut/:id - Check out from a job
// PUT /api/jobPosts/checkOut/:id - Check out from a job
router.put('/checkOut/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const job = await JobPost.findById(id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.status !== 'checkedIn') {
      return res.status(400).json({ message: 'Job not checked in' });
    }

    // Update job status to 'completed' and store check-out time
    job.status = 'completed';
    job.checkOutTime = new Date();

    // Save updated job
    await job.save();

    // Return updated job object
    res.json(job);
  } catch (error) {
    console.error('Error checking out job:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});


// GET /api/jobPosts/template/:templateName - Fetch a specific job post by TemplateName
router.get('/template/:templateName', async (req, res) => {
  const { templateName } = req.params;

  try {
    const jobPost = await JobPost.findOne({ TemplateName: templateName, isTemplate: true });
    if (!jobPost) {
      return res.status(404).json({ msg: 'Job post not found' });
    }
    res.json(jobPost);
  } catch (err) {
    console.error('Error fetching job post by template name:', err.message);
    res.status(500).send('Server Error');
  }
});


router.get('/templates/:id', async (req, res) => {
  try {
    const jobPost = await JobPost.findById(req.params.id);
    if (!jobPost) {
      return res.status(404).json({ message: 'Template not found' });
    }
    res.json(jobPost);
  } catch (error) {
    console.error('Error fetching template:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


router.get('/job-dates-statuses', async (req, res) => {
  try {
    const jobs = await JobPost.find({}, 'Date status');
    res.json(jobs);
  } catch (error) {
    console.error('Error fetching job dates and statuses:', error);
    res.status(500).json({ error: 'Failed to fetch job dates and statuses' });
  }
});


// GET /api/jobPosts/date/:date - Fetch job posts for a specific date
router.get('/date/:date', async (req, res) => {
  const { date } = req.params;

  try {
    const jobPosts = await JobPost.find({ Date: new Date(date) });
    res.json(jobPosts);
  } catch (err) {
    console.error('Error fetching job posts by date:', err.message);
    res.status(500).send('Server Error');
  }
});



module.exports = router;
