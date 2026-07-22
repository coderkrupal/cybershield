import express from 'express';
import Incident from '../models/Incident.js';

const router = express.Router();

// @route   POST api/incidents
// @desc    Report a new cybersecurity incident
router.post('/', async (req, res) => {
  try {
    const { title, description, category, priority, targetUrl } = req.body;
    
    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required fields.' });
    }

    const newIncident = new Incident({
      title,
      description,
      category,
      priority,
      targetUrl
    });

    const savedIncident = await newIncident.save();
    return res.status(201).json(savedIncident);
  } catch (error) {
    console.error('Error reporting incident:', error);
    return res.status(500).json({ error: 'Server error reporting incident' });
  }
});

// @route   GET api/incidents
// @desc    Get all incident reports
router.get('/', async (req, res) => {
  try {
    const incidents = await Incident.find().sort({ reportedAt: -1 });
    return res.json(incidents);
  } catch (error) {
    console.error('Error fetching incidents:', error);
    return res.status(500).json({ error: 'Server error fetching incidents' });
  }
});

// @route   GET api/incidents/stats
// @desc    Get incident analytics and statistics
router.get('/stats', async (req, res) => {
  try {
    const incidents = await Incident.find();
    
    // Aggregation of categories, priorities, and statuses
    const categoryCounts = {};
    const priorityCounts = { Low: 0, Medium: 0, High: 0, Critical: 0 };
    const statusCounts = { Open: 0, Investigating: 0, Resolved: 0 };

    incidents.forEach(inc => {
      // Category
      categoryCounts[inc.category] = (categoryCounts[inc.category] || 0) + 1;
      
      // Priority
      if (priorityCounts[inc.priority] !== undefined) {
        priorityCounts[inc.priority]++;
      }
      
      // Status
      if (statusCounts[inc.status] !== undefined) {
        statusCounts[inc.status]++;
      }
    });

    return res.json({
      total: incidents.length,
      categories: categoryCounts,
      priorities: priorityCounts,
      statuses: statusCounts
    });
  } catch (error) {
    console.error('Error calculating incident statistics:', error);
    return res.status(500).json({ error: 'Server error compiling statistics' });
  }
});

// @route   PUT api/incidents/:id
// @desc    Update status or details of a reported incident
router.put('/:id', async (req, res) => {
  try {
    const { status, priority } = req.body;
    
    const updatedIncident = await Incident.findByIdAndUpdate(
      req.params.id,
      { $set: { status, priority } },
      { new: true }
    );

    if (!updatedIncident) {
      return res.status(404).json({ error: 'Incident report not found' });
    }

    return res.json(updatedIncident);
  } catch (error) {
    console.error('Error updating incident:', error);
    return res.status(500).json({ error: 'Server error updating incident' });
  }
});

// @route   DELETE api/incidents/:id
// @desc    Delete an incident report
router.delete('/:id', async (req, res) => {
  try {
    const incident = await Incident.findByIdAndDelete(req.params.id);
    if (!incident) {
      return res.status(404).json({ error: 'Incident report not found' });
    }
    return res.json({ message: 'Incident report deleted successfully' });
  } catch (error) {
    console.error('Error deleting incident:', error);
    return res.status(500).json({ error: 'Server error deleting incident' });
  }
});

export default router;
