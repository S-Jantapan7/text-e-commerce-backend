import mongoose from 'mongoose'

const cartitemSchema = new mongoose.Schema({
    product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product'
    },
    quantity: {
        type: Number,
        required: true,
        lowercase: true,
        trim: true
    },
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        //required: true
    },
    
    createAt: {
        type: Date,
        required: true,
        default: ( ) => Date.now()
    }

})
 
const CartItem = mongoose.model('CartItem', cartitemSchema)

export default CartItem