import connectDB from '../../../utils/connectDB'
import Promotions from '../../../models/promotionModel'
import auth from '../../../middleware/auth'

connectDB()

export default async (req, res) => {
  switch (req.method) {
    case 'POST':
      await createPromotion(req, res)
      break
    case 'GET':
      await getPromotions(req, res)
      break
  }
}

const getPromotions = async (req, res) => {
  try {
    const result = await auth(req, res)

    let promotions
    if (result.role !== 'admin') {
      promotions = await Promotions.find({
        user: result.id,
      }).populate('user', '-password')
    } else {
      promotions = await Promotions.find().populate('user', '-password')
    }

    res.json({ promotions })
  } catch (err) {
    return res.status(500).json({ err: err.message })
  }
}

const createPromotion = async (req, res) => {
  try {
    const result = await auth(req, res)
    const {
      companyName,
      companyWebsite,
      country,
      region,
      address,
      total,
      duration,
      companyCAC,
      dateOfExpiration,
    } = req.body

    const newPromotion = new Promotions({
      user: result.id,
      address,
      companyName,
      companyWebsite,
      country,
      region,
      total,
      duration,
      companyCAC,
      dateOfExpiration
    })

    await newPromotion.save()

    res.json({
      msg:
        'Request submitted successfully! Please wait while you under go verification.',
      newPromotion,
    })
  } catch (err) {
    return res.status(500).json({ err: err.message })
  }
}
