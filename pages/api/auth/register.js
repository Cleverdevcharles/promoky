import connectDB from '../../../utils/connectDB'
import Users from '../../../models/userModel'
// import valid from '../../../utils/valid'
import bcrypt from 'bcrypt'

connectDB()

export default async (req, res) => {
  switch (req.method) {
    case 'POST':
      await register(req, res)
      break
  }
}

const register = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      phoneNo,
      country,
      region,
      email,
      password,
      cf_password,
    } = req.body


    const user = await Users.findOne({ email })
    if (user) return res.status(400).json({ err: 'This email already exists.' })

    const passwordHash = await bcrypt.hash(password, 12)

    const newUser = new Users({
      firstName,
      lastName,
      phoneNo,
      country,
      region,
      email,
      password: passwordHash,
      cf_password,
    })

    await newUser.save()
    res.json({ msg: 'Register Success!' })
  } catch (err) {
    return res.status(500).json({ err: err.message })
  }
}
