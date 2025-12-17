import express from 'express';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, async (req, res) => {
  try {
    const offers = [
      {
        id: 1,
        title: 'Festival Special Offer',
        description: 'Get 0% interest for first 3 months on all electronics',
        image: 'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=800',
        validFrom: '2024-01-01',
        validTo: '2024-12-31',
        isActive: true,
        details: 'This offer is valid on all electronic items including mobiles, laptops, and home appliances. Minimum purchase value: ₹10,000',
        termsAndConditions: [
          'Valid only on selected products',
          'Cannot be combined with other offers',
          'Subject to credit approval',
          'Terms and conditions apply'
        ]
      },
      {
        id: 2,
        title: 'New Year Bonanza',
        description: 'Flat ₹5000 off on loans above ₹50,000',
        image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800',
        validFrom: '2024-01-01',
        validTo: '2024-01-31',
        isActive: true,
        details: 'Get instant discount of ₹5000 on all loan applications above ₹50,000. Limited period offer.',
        termsAndConditions: [
          'Minimum loan amount: ₹50,000',
          'Valid till 31st January 2024',
          'One offer per customer',
          'Subject to terms and conditions'
        ]
      }
    ];
    
    res.json(offers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
