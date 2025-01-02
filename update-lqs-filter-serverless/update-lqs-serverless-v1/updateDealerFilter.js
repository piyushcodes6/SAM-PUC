const axios = require('axios');
const path = require("path");
// const AWS = require('aws-sdk');

let parsedResult = {};

// const getSecretValue = async() => {
//      const secret_name = "qa/businessTypeCsv";
//     const clientSecret= new AWS.SecretsManager({
//         region: process.env.AWS_REGION,
//     });
    
//     const resultSecret = await clientSecret
//         .getSecretValue({
//             SecretId: secret_name,
//         })
//         .promise();
//       parsedResult = JSON.parse(resultSecret.SecretString);
// }
const fetchFilterData = async () => {
    try {
        const getFilterData = await axios.get(`${parsedResult.dynamoDbUrl}/filter`, {
            headers: {
                "x-api-key": parsedResult.dynamoDbKey
            },
            data: { "filter_exp": "id = :id", "exp_attr_value": { ":id": "1667490191018" } }
        });
        //console.log(getFilterData.data.Items[0]);
        return getFilterData.data.Items[0];
    } catch (error) {
        console.error(error);
    }
};

const fetchDataFromNagarooModel = async () => {
    try {
        const data = await axios.get(`${parsedResult.nagarooPublicUrl}parentDealers/all/dealers?type=1,2,3&status=true&lob=${parsedResult.lob}`, {
            headers: {
                "x-api-key": parsedResult.nagarooPublicKey
            },
        } );
        return data.data.data;

    } catch (error) {
        console.error(error);
    }
};

exports.checkUpdate = async (secretValues) => {
    try {
        // await getSecretValue()
        parsedResult = secretValues;
        const filterData = await fetchFilterData();
        const awsData = await fetchDataFromNagarooModel();
        // const filterDataLength = Object.keys(filterData.data).length
        // const awsDataLength = awsData.length
        // if (filterDataLength < awsDataLength) {
            // console.log(filterDataLength, awsDataLength)
            // let diff = await awsData.filter(x => !Object.keys(filterData.data).includes(x.code));
            //filterData.data = {}
             filterData[`data_${parsedResult.lob}`] = {}
            
            await awsData.forEach((item) => {
                filterData[`data_${parsedResult.lob}`][item.code] = item.name
            })
           // console.log(filterData.data)
            try{
                 delete filterData.data
                await axios.post(`${parsedResult.dynamoDbUrl}/filter`, filterData, {
                    headers: {
                        "x-api-key": parsedResult.dynamoDbKey
                    }
                })
                console.log("Run Successfully Dealr")
            }catch(error) {
                console.log(error)
            }

        // }

    } catch (error) {
    }
}

