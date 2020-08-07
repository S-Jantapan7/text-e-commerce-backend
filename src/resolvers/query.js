import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/user'
import Product from "../models/product"

const Query ={
    login: async (parent, args, context, info) => {
        const {email, password} = args
        const user = await User.findOne({email})
        if(!user) throw new Error('Email not found, please sign up.')

        const valiPassword = await bcrypt.compare(password, user.password)
        if(!valiPassword) throw new Error('Invalid email or password')

        const token = jwt.sign({userId: user.id}, process.env.SECRET, {expiresIn: '7day'})

        return {userId: user.id, jwt: token}
    },

    user: (parent, args, {userId}, info) =>{
        //เช็ต ถ้า user login
        if (!userId) throw new Error('Please login')
        if (userId !== args.id) throw new Error('Not authorized.')

    return User.findById(args.id).populate({
        path: "products",
        populate: { path: "user" }
    }).populate({path: 'carts', populate: { path: "product"}})
    },
    
    users: (parent, args, context, info) => User.find({}).populate({
        path: "products",
        populate: { path: "user" }

    }).populate({path: 'carts', populate: { path: "product"}}),

    ///Query  see product is user
    product: (parent, args, context, info) =>
        Product.findById(args.id).populate({
            path: "user",
            populate: { path: "products" }
        }),

    /// Query see all products 
    products: (parent, args, context, info) =>
        Product.find().populate({
            path: "user",
            populate: { path: "products" }
        }).sort({createAt: 'desc'})


}

export default Query