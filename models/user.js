import mongoose, { mongo } from 'mongoose';


const userSchema = new mongoose.Schema({
    name: {
         type: String,
         required: true,
         trim: true },
    email: {
         type: String, 
         required: true, 
         trim: true ,
         match: [
            /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
            'Please use a valid email address',
          ],
        },
    password: { 
        type: String, 
        required: true, 
        trim: true, 
      },
    phone:{type:String,required: true, trim: true,match: [
        /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/,
        'Please enter a valid phone number',
      ],},
    profileImageUrl: { type: String},
    orderHistory: [{ type: Object }],
    cartItem:[{ type: Object}],
    role:{type:String,required:true},
    loggedIn:{type:Boolean,deafult:false},
    loggedExpire:{type:Date,deafult:null}
}, { timestamps: true }); 


const ProductSchema = new mongoose.Schema({
    name: { type: String, required: true },
    imageUrl: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true }
}, { timestamps: true }); 


const user = mongoose.model("user",userSchema)
const Product = mongoose.model('Product', ProductSchema);

export { user , Product };