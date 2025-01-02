const aws = require('aws-sdk');

const lambda = new aws.Lambda({
    region: 'ap-south-1' 
});



exports.sendMobileMessage = async(phoneNumber,textMessage)=>{
    
    const data = {
        phoneNumber,
        textMessage
    }
    
    
    console.log("Message Send");
    
     const params = {
        FunctionName: 'arn:aws:lambda:ap-south-1:288519183534:function:Lqs-Sms-Notification-Lambda',
        InvocationType: 'RequestResponse',
        Payload: JSON.stringify(data) // pass params
    }
    
    
    
    return new Promise((resolve, reject) => {

        lambda.invoke(params, (err, data) => {
            if (err) {
                console.log(err, err.stack);
                reject(err);
            }
            else {
                console.log(data);
                resolve(data);
            }
        });
    });
}