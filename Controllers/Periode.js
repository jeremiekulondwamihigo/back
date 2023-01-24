const Model_Periode = require("../Models/Model_Periode")
const asyncLab = require("async")
const { isEmpty, generateString } = require("../Fonctions/Static_Function")

module.exports = {

    Add_Periode : (req, res)=>{
        try {
            
            const { periode, id, active } = req.body
            if(isEmpty(periode) || isEmpty(id)){
                return res.status(200).json({
                    "message":"Veuillez renseigner les champs",
                    "error":true
                })
            }
            const code_periode = generateString(6)
            asyncLab.waterfall([
                function(done){
                    Model_Periode.findOne({
                        code_periode
                    }).then(code =>{
                        if(code){
                            done(false)
                        }else{
                            done(null, true)
                        }
                    })
                },
                function(code, done){
                    
                },
            ], function(result){
                if(result){
                    return res.status(200).json({
                        "message":"Periode enregistrer",
                        "error":false
                    })
                    
                }else{
                    return res.status(200).json({
                        "message":"Erreur d'enregistrement",
                        "error":true
                    })

                }
                
            })
        } catch (error) {
            console.log(error)
        }
    }
}