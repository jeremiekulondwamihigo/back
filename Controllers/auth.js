const ErrorResponse = require("../utils/errorResponse");
const Model_User = require("../Models/Users")



exports.login = async (req, res, next) =>{
  
  const { username, password } = req.body;

  if(!username || !password){
    return next(new ErrorResponse("Veuillez renseigner les champs", 200));
  }

  try {

    //const user = await Model_User.aggregate([ look])
    
    const user = await Model_User.findOne({username}).select("+password");
    
    if(!user){
       return next(new ErrorResponse("username incorrect", 200));
    }

    const isMatch = await user.matchPasswords(password);
   
    if(!isMatch){
       return next(new ErrorResponse("password incorrect", 200));
    }

    sendToken(user, 200, res);
  } catch (error) {
    res.status(500).json({ success : false, error: error.message
    })
  }
}

exports.forgetPassword = async (req, res, next)=>{
  const { mail } = req.body;

  try {
    const user = await User.findOne({mail});

    if(!user){
      return next(new ErrorResponse("Email could not be sent", 404));
    }
    const resetToken = user.getResetPasswordToken();

    await user.save();

    const resetUrl = `http://localhost:3000/passwordreset/${resetToken}`;
    const message = `
      <h1>You have requested a password reset</h1>
      <p>Please go tp this link to reset your password</p>
      <a href=${resetUrl} clicktracking=off>${resetUrl}</a>
    `

    try {
      
    } catch (error) {
      
    }

  } catch (error) {
    
  }
}

exports.resetPassword = (req, res, next)=>{
  res.send("Reset password");
}

const sendToken = (user, statusCode, res)=>{
  
  const token = user.getSignedToken();
  res.status(statusCode).json({sucess : true, token })
}