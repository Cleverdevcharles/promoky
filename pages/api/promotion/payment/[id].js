import connectDB from '../../../../utils/connectDB'
import Promotions from '../../../../models/promotionModel'
import auth from '../../../../middleware/auth'

connectDB()

export default async (req, res) => {
    switch(req.method){
        case "PATCH":
            await paymentPromotion(req, res)
            break;
    }
}

const paymentPromotion = async(req, res) => {
    try {
        const result = await auth(req, res)
        const today = new Date();
        if(result.role === 'user'){
            const {id} = req.query
            const { paymentId } = req.body
    
            await Promotions.findOneAndUpdate({_id: id}, {
                paid: true, 
                dateOfPayment: new Date().toISOString(), 
                paymentId,
                dateOfExpiration: new Date(today.getTime() + promotion.duration * 24 * 60 * 60 * 1000).toLocaleDateString(),
                method: 'Paypal'
            })
    
            res.json({msg: 'Payment success!'})
        }
        
    } catch (err) {
        return res.status(500).json({err: err.message})
    }
}