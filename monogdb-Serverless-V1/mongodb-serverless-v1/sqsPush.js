const AWS = require("aws-sdk");
exports.pushIntoSqs = async (message, parsedResult) => {
    try {

        console.log("pused to sql", parsedResult)
        AWS.config.update({
            // accessKeyId: parsedResult.accessKeyId,
            // secretAccessKey: parsedResult.secretAccessKey,
            region: parsedResult.region
        })
        const sqs = await new AWS.SQS();
        const params = {
            QueueUrl: parsedResult.SqsUrl,
            MessageBody: message
        }
        console.log("params", params.QueueUrl)
        return await new Promise(async (resolve, reject) => {

            await sqs.sendMessage(params, (err, data) => {
                if (err) {
                    console.log(err, "error in addindg data to queue")
                    reject(err);
                } else {
                    resolve(data, "send to the sqs");
                }
            })
        })

    } catch (e) {
        console.log("i m here")
        console.log(e)
    }
}