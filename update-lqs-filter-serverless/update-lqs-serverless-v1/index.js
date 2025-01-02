const AWS = require('aws-sdk');
const updateBusinessTypeFilter = require("./updateBusinessTypeFilter");
const updateDealerFilter = require("./updateDealerFilter");
const updateLeadModeFilter = require("./updateLeadModeFilter");
const updateModelFilter = require("./updateModelFilter");
const updateStatusFilter = require("./updateStatusFilter");
const updateUtmSourceFilter = require("./updateUtmSourceFilter");
const updateLeadSourceFilter = require("./updateLeadSourceFilter")
const updateOwnerFilter = require("./updateOwnerFilter")

exports.handler = async (event) => {
    let parsedResult = {};
    // TODO implement
    
         const secret_name = "qa/businessTypeCsv";
    const clientSecret= new AWS.SecretsManager({
        region: process.env.AWS_REGION,
    });
    
    const resultSecret = await clientSecret
        .getSecretValue({
            SecretId: secret_name,
        })
        .promise();
       parsedResult = JSON.parse(resultSecret.SecretString);
//    parsedResult.lob = event.Parameters.lob ? event.Parameters.lob : "1" //lob added from event bridge
  parsedResult.lob = "1"
       
    await updateBusinessTypeFilter.checkUpdate(parsedResult);
    
    await updateDealerFilter.checkUpdate(parsedResult);
    await updateLeadModeFilter.checkUpdate(parsedResult);
    await updateModelFilter.checkUpdate(parsedResult);
    await updateUtmSourceFilter.checkUpdate(parsedResult);
    await updateStatusFilter.checkUpdate(parsedResult);
    await updateLeadSourceFilter.checkUpdate(parsedResult);
    await updateOwnerFilter.checkUpdate(parsedResult);
    const response = {
        statusCode: 200,
        body: JSON.stringify('Hello from Lambda!'),
    };
    return response;
};
