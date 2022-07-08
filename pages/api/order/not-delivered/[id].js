import connectDB from '../../../../utils/connectDB'
import Orders from '../../../../models/orderModel'
import auth from '../../../../middleware/auth'

connectDB()

export default async (req, res) => {
    switch(req.method){
        case "PATCH":
            await notDeliveredOrder(req, res)
            break;
    }
}


const notDeliveredOrder = async(req, res) => {
    try {
        const result = await auth(req, res)
        if(result.role !== 'admin')
        return res.status(400).json({err: 'Authentication is not valid.'})
        const {id} = req.query


        const order = await Orders.findOne({_id: id})
        if(!order.paid){
            await Orders.findOneAndUpdate({_id: id}, {delivered: false})
    
            res.json({
                msg: 'Updated success!',
                result: {
                    paid: true, 
                    dateOfPayment: order.dateOfPayment, 
                    method: order.method, 
                    delivered: false
                }
            })
        }else{
            await Orders.findOneAndUpdate({_id: id}, {
                paid: true, dateOfPayment: new Date().toISOString(), 
                method: order.method, delivered: false
            })
    
            res.json({
                msg: 'Updated success!',
                result: {
                    paid: false, 
                    dateOfPayment: new Date().toISOString(), 
                    method: order.method, 
                    delivered: false
                }
            })
        }
        
    } catch (err) {
        return res.status(500).json({err: err.message})
    }
}