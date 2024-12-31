


const { MongoClient } = require('mongodb');
const AWS = require("aws-sdk");

// Export a module-scoped MongoClient promise. By doing this in a separate
// module, the client can be shared across functions.

const mongoClient = async () => {
    const secret_name = "lqs/apiKey";
    const clientSecret = new AWS.SecretsManager({
        region: process.env.AWS_REGION,
    });

    const resultSecret = await clientSecret
        .getSecretValue({
            SecretId: secret_name,
        })
        .promise();

    const parsedResult = JSON.parse(resultSecret.SecretString);

    parsedResult.mongoUrl=parsedResult.mongoUrl+"?appName=LQS-Lambda-mongodbLambda"
   const client = new MongoClient(parsedResult.mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true });

    return client.connect()

}
module.exports = mongoClient()