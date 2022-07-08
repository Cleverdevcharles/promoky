import connectDB from '../../../../utils/connectDB'
import Promotions from '../../../../models/promotionModel'
import auth from '../../../../middleware/auth'

connectDB()

export default async (req, res) => {
  switch (req.method) {
    case 'PATCH':
      await noPaidPromotion(req, res)
      break
  }
}

const noPaidPromotion = async (req, res) => {
  try {
    const today = new Date()
    const result = await auth(req, res)
    if (result.role !== 'admin')
      return res.status(400).json({ err: 'Authentication is not valid.' })
    const { id } = req.query

    const promotion = await Promotions.findOne({ _id: id })
    if (!promotion.activated) {
      await Promotions.findOneAndUpdate({ _id: id }, { paid: false })

      res.json({
        msg: 'Updated success!',
        result: {
          paid: false,
          dateOfPayment: promotion.dateOfPayment,
          dateOfExpiration: promotion.dateOfExpiration,
          method: promotion.method,
          activated: false,
        },
      })
    } else {
      await Promotions.findOneAndUpdate(
        { _id: id },
        {
          paid: false,
          dateOfPayment: new Date().toISOString(),
          dateOfExpiration: new Date(
            today.getTime() + promotion.duration * 24 * 60 * 60 * 1000,
          ).toLocaleDateString(),
          method: promotion.method,
          activated: false,
        },
      )

      res.json({
        msg: 'Updated success!',
        result: {
          paid: false,
          dateOfPayment: new Date().toISOString(),
          dateOfExpiration: new Date(
            today.getTime() + promotion.duration * 24 * 60 * 60 * 1000,
          ).toLocaleDateString(),
          method: promotion.method,
          activated: false,
        },
      })
    }
  } catch (err) {
    return res.status(500).json({ err: err.message })
  }
}
