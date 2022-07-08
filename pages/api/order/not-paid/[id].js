import connectDB from '../../../../utils/connectDB'
import Orders from '../../../../models/orderModel'
import auth from '../../../../middleware/auth'

connectDB()

export default async (req, res) => {
    switch(req.method){
        case "PATCH":
            await noPaidOrder(req, res)
            break;
    }
}

const noPaidOrder = async(req, res) => {
    try {
        const result = await auth(req, res)
        if(result.role !== 'admin')
        return res.status(400).json({err: 'Authentication is not valid.'})
        const {id} = req.query


        const order = await Orders.findOne({_id: id})
        if(!order.delivered){
            await Orders.findOneAndUpdate({_id: id}, {paid: false})
    
            res.json({
                msg: 'Updated success!',
                result: {
                    paid: false, 
                    dateOfPayment: order.method,
                    method: order.method, 
                    delivered: false
                }
            })
        }else{
            await Orders.findOneAndUpdate({_id: id}, {
                paid: false, 
                dateOfPayment: new Date().toISOString(), 
                method:order.method, 
                delivered: false
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