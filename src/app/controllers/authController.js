const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authCongig = require('../../config/auth');
const crypto = require('crypto');
const mailer = require('../../modules/mailer');

const router = express.Router();


function generateToken (params = {}) {
    // body
    return jwt.sign(params, authCongig.secret, {
      expiresIn: 86400
    });
}


router.post('/register', async(req, res) => {
    const { email } = req.body;
    try {
        if( await User.findOne({ email })){
            return res.status(409).send({ error: "User already exists!" });
        }
        const user = await User.create(req.body);
        
        user.password = undefined;
        
        return res.send({ user,
            token: generateToken({ id: user.id }),
         });
    } catch (error) {
        return res.status(400).send({ error: "Registration Failed"});
    }
});

router.post('/authenticate', async (req,res) => {
    const {email, password} = req.body;

    const user = await User.findOne({email}).select('+password');

    if(!user){
        return res.status(404).send({error: "User not found!"});
    }

    if(!await bcrypt.compare(password, user.password) ){
        return res.status(401).send({error: "Password wrong!"});
    }
    
    user.password = undefined;
    return res.status(200).send({user, 
        token: generateToken({ id: user.id }),
    });
});

router.post('/forgot_password', async(req, res) => {
    const {email} =  req.body;
    try {
        const user = await User.findOne({ email });

        if(!user){
            return res.status(404).send({ error: "User not found!" });
        }
        

        const token = crypto.randomBytes(20).toString('hex');

        const now = new Date();

        now.setHours(now.getHours() + 1 );

        await User.findByIdAndUpdate(user.id, {
            '$set':{
                passwordResetToken: token,
                passwordResetExpires: now,
            }
        });

        mailer.sendMail(
          {
            to: email,
            from: "mayconrebordao2014@gmail.com",
            template: "auth/forgot_password",
            context: { token }
          },
          (error,info) => {
            // console.log(error);
            // console.log("info:"+info);
            

            if (error) {
              return res
                .status(500)
                .send({ error: "Cannot send forgot password email" });
            }
            return res
              .status(200)
              .send({
                error: "Email for reset password send successfull."
              });
          }
        );
        
        // console.log(token, now);
        
        
    } catch (error) {
        // console.log(error);
        
        res.status(500).send({ error: 'Internal Server Error. Erro on forgot password, try again. '});
    }
});

router.post('/reset_password', async (req, res) => {
    const { email, token , password } = req.body;
    
    try {

        const user = await User.findOne({ email })
            .select('+passwordResetToken passwordResetExpires');
        if(!user){
            return res.status(404).send({ error: "User not found." });
        }

        if(token !== user.passwordResetToken ){
            console.log({token});
            console.log(user.passwordResetToken);
            
            return res
              .status(412)
              .send({
                error: "The token send to account not recognized, token is invalid"
              });
        }

        const now = new Date();

        if(now > user.passwordResetExpires){
            return res.status(410).send({ error: "Token lifetime expired, request new reset password token and try again." });
        }
        user.password = password;
        await user.save();
        res.status(200).send({ error: "Password successfully reset."})

        
    } catch (error) {
        res.status(500).send({ error: "Internal Server Error. Cannot reset password, try again." });
    }
    

});



// module.exports = app => app.use('/authenticate', router);
module.exports = app => app.use('/auth', router );


