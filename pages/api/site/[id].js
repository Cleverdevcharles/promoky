import connectDB from '../../../utils/connectDB'
import Sites from '../../../models/siteModel'
import auth from '../../../middleware/auth'

connectDB()

export default async (req, res) => {
    switch(req.method){
        case "GET":
            await getSite(req, res)
            break;
        case "PUT":
            await updateSite(req, res)
            break;
        case "DELETE":
            await deleteSite(req, res)
            break;
    }
}

const getSite = async (req, res) => {
    try {
        const { id } = req.query;

        const site = await Sites.findById(id)
        if(!site) return res.status(400).json({err: 'This site does not exist.'})
        
        res.json({ site })

    } catch (err) {
        return res.status(500).json({err: err.message})
    }
}

const updateSite = async (req, res) => {
    try {
        const result = await auth(req, res)
        if(result.role !== 'admin') 
        return res.status(400).json({err: 'Authentication is not valid.'})

        const {id} = req.query
        const {
            title, 
            about, 
            phone, 
            email, 
            facebook, 
            whatsapp, 
            twitter, 
            instagram, 
            images, 
            terms_conditions, 
            privacy_policy  
        } = req.body

        if(!title || !about || !phone || !email || !terms_conditions || !privacy_policy  || images.length === 0)
        return res.status(400).json({err: 'Please add all the fields.'})

        await Sites.findOneAndUpdate({_id: id}, {
            title, 
            about, 
            phone, 
            email, 
            facebook, 
            whatsapp, 
            twitter, 
            instagram, 
            images, 
            terms_conditions, 
            privacy_policy  
        })

        res.json({msg: 'Success! Updated a site'})
    } catch (err) {
        return res.status(500).json({err: err.message})
    }
}

const deleteSite = async(req, res) => {
    try {
        const result = await auth(req, res)
        
        if(result.role !== 'admin') 
        return res.status(400).json({err: 'Authentication is not valid.'})

        const {id} = req.query

        await Sites.findByIdAndDelete(id)
        res.json({msg: 'Deleted a site.'})

    } catch (err) {
        return res.status(500).json({err: err.message})
    }
}