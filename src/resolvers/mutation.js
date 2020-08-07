import bcrypt from 'bcryptjs'
import User from '../models/user'
import Product from '../models/product'
import CartItem from '../models/cartItem'

const Mutation =  {
    ///////////////////////////signup/////////////////////////////
    signup: async (parent, args, context, info) => {
        // Trim and Lower case email
        const email = args.email.trim().toLowerCase()

        //Check if email already exist in databaes
        const currentUsers = await User.find({})
        const isEmailExist = currentUsers.findIndex(user => user.email === email) > -1

        if (isEmailExist){
            throw new Error('Email alresdy extst.')
        }

        //Chack password 8cha 

        if(args.password.trim().length <8){
            throw new Error('Password must be at least 8 chareacters.')
        }
        const password = await bcrypt.hash(args.password, 10)
        return User.create({...args, email, password})

    },
    /////////////////////////////createProduct////////////////////////////////
    createProduct: async (parent, args, { userId }, info) => {
        //const userId = "5ef061b63f8a7c31d026032d"
        //เซ็ค usr login
        if (!userId) throw new Error('Please login')
        //if (userId !== args.id) throw new Error('Not authorized.')


        if (!args.description || !args.price || !args.imageUrl){
            throw new Error('Please Provide all required fields.')
        }

        const product = await Product.create({ ...args, user: userId })
        const user = await User.findById(userId)

        if (!user.products) {
            user.products = [product]
        } else {
            user.products.push(product)
        }

        await user.save()

        return Product.findById(product.id).populate({
            path: "user",
            populate: { path: "products" }
        })
    },
    //////////////////////////////updateProduct///////////////////////////////////
    updateProduct: async (parent, args, { userId }, info) => {
        const {id, description, price, imageUrl} = args

        if (!userId) throw new Error('Please login')
        const product =await Product.findById(id)

        //const userId = "5ef061b63f8a7c31d026032d"

        if (userId !== product.user.toString()){
            throw new Error('you are not authorized.')
        }

        const updateInfo = {
            description: !!description ? description : product.description,
            price: !!price ? price : product.price,
            imageUrl: !!imageUrl ? imageUrl : product.imageUrl
        }

        await Product.findByIdAndUpdate(id, updateInfo)

        const updateProduct = await Product.findById(id).populate({path: 'user'})

        return updateProduct
    },
    //////////////////////////////addToCart//////////////////////////////
    addToCart: async (parent, args, { userId }, info) => {
        // id product
        const {id} = args
        if (!userId) throw new Error('Please login')
        try {
            // find user who perfrom add to cart from login
            //const userId = "5ef061c33f8a7c31d026032e"

            const user = await User.findById(userId).populate({
                path: "carts",
                populate: { path: "product" }
            })
           
        const findCartItemIndex = user.carts.findIndex(
            cartItem => cartItem.product.id === id
        )

        if (findCartItemIndex > -1) {
            user.carts[findCartItemIndex].quantity += 1
            await CartItem.findByIdAndUpdate(user.carts[findCartItemIndex].id, {
                quantity: user.carts[findCartItemIndex].quantity
            })

            const updatedCartItem = await CartItem.findById(
                user.carts[findCartItemIndex].id
                )
                .populate({path: "product" })
                .populate({path: "user"})
            
            return updatedCartItem
        } else {
            const cartItem = await CartItem.create({
                product: id,
                quantity: 1,
                user: userId
            })
            const newCartItem = await CartItem.findById(cartItem.id)
                .populate({ path: "product" })
                .populate({ path: "user" })

            await User.findByIdAndUpdate(userId, {
                carts: [...user.carts, newCartItem]
            })

            return newCartItem
        }


        }catch (error) {
            console.log(error)
            
        }

    },
    //////////////////////////deleteCart////////////////////////////////////
    deleteCart: async (parent, args, { userId }, info) => {
        const { id } = args
        const cart = await CartItem.findById(id)
        if (!userId) throw new Error('Please login')
        //const userId = "5ef061c33f8a7c31d026032e"
        
        const user = await User.findById(userId)

        if (cart.user.toString() !== userId) {
            throw new Error("You cannot authorized. ")
        } 
        //console.log(id)
        const deletedCart = await CartItem.findByIdAndDelete(id)
        //console.log(deletedCart)
        
        const updatedUserCarts = user.carts.filter(
            cartId => cartId.toString() !== deletedCart.id.toString()
        )
        await User.findByIdAndUpdate(userId, { carts: updatedUserCarts })
        //console.log(updatedUserCarts)
        return deletedCart
    }
}

export default Mutation