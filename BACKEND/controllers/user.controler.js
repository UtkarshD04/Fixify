const userModel =   require('../models/user.model')
const userServices = require('../services/user.service')
const {validationResult} = require('express-validator')
const blacklistTokenModel  = require('../models/blacklistToken.model')

module.exports.registerUser = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

   //  console.log(req.body);
    const { fullname, email, password, phone } = req.body;
    const hashPassword = await userModel.hashPassword(password);

    const user = await userServices.createUser(
       { firstname: fullname.firstname,
         lastname: fullname.lastname,
          email,
         password: hashPassword,
         phone
        } );
   const token =  await user.generateAuthToken();
  // Printing token for debugging purposes. You can remove it before production.  // DO NOT LOG SECRET KEYS IN PRODUCTION!  // You should
   res.status(201).json({ user, token });
}


module.exports.loginUser = async (req, res) => {
 
const errors = validationResult(req);
 if(!errors.isEmpty()){
    return res.status(400).json({ errors: errors.array() });
 }

 const { email , password} = req.body;

 const user = await userModel.findOne({email}).select('+password');

 if(!user){
    return res.status(401).json({ error: 'Invalid email or password' });

 } 
 const isMatch = await user.comparePassword(password);

 if(!isMatch){
    return res.status(401).json({message:'Invalid email or password'});

 }

 const token = await user.generateAuthToken();
    res.cookie('token', token);
    res.status(200).json({ token, user });

 
}

module.exports.getUserProfile = async (req, res) => { 
   res.status(200).json(req.user);
 }
module.exports.logoutUser = async (req, res) => {
    res.clearCookie('token');
    const token = req.cookies.token || req.headers.authorization.split(' ')[ 1 ];

    await blacklistTokenModel.create({ token });

    res.status(200).json({ message: 'Logged out' });

}

module.exports.updateProfile = async (req, res) => {
    try {
        const { fullname, email, phone, profileImage } = req.body;
        const userId = req.user._id;
        
        const updatedUser = await userModel.findByIdAndUpdate(
            userId,
            {
                fullname,
                email,
                phone,
                profileImage
            },
            { new: true }
        );
        
        res.status(200).json({ user: updatedUser });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update profile' });
    }
}
