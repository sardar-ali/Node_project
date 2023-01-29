module.exports = (tryFunction) => {
    return  (req, res, next)=>{
         tryFunction(req, res, next).catch(next)
     }
 }