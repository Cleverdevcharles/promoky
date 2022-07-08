import connectDB from '../../../../utils/connectDB'
import Orders from '../../../../models/orderModel'
import auth from '../../../../middleware/auth'

connectDB()

export default async (req, res) => {
  switch (req.method) {
    case 'DELETE':
      await deleteOrder(req, res)
      break
  }
}

const deleteOrder = async (req, res) => {
  try {
    const result = await auth(req, res)
    if (result.role !== 'admin')
      return res.status(400).json({ err: 'Authentication is not valid.' })
    const { id } = req.query

    await Orders.findByIdAndDelete(id)
    res.json({ msg: 'Deleted Success!' })
  } catch (err) {
    return res.status(500).json({ err: err.message })
  }
}
