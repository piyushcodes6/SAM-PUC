const axios = require('axios');
const path = require("path");

let parsedResult = {};

const fetchFilterData = async () => {
    try {
       
      
        const getFilterData = await axios.get(`${parsedResult.dynamoDbUrl}/filter`, {
            headers: {
                "x-api-key":parsedResult.dynamoDbKey
            },
            data: { "filter_exp": "id = :id", "exp_attr_value": { ":id": "1667302192278" } }
        });
        return getFilterData.data.Items[0];
    } catch (error) {
        console.error(error);
    }
};

const fetchDataFromAWS = async () => {
    try {
        const data = await axios.get(`${parsedResult.dynamoDbUrl}/business-type` , {
            headers: {
                "x-api-key":parsedResult.dynamoDbKey
            }
        });
        return data.data.Items;

    } catch (error) {
        console.error(error);
    }
};

exports.checkUpdate = async (secretValues) => {
    try {
        parsedResult = secretValues;
        const filterData = await fetchFilterData();
        const awsData = await fetchDataFromAWS();
        // const filterDataLength = Object.keys(filterData.data).length
        // const awsDataLength = awsData.length
        // if (filterDataLength < awsDataLength) {
            // let diff = await awsData.filter(x => !Object.keys(filterData.data).includes(x.id));
            filterData.data = {}
            //console.log("awsDataawsData1", awsData)
           await Promise.all(
            [
               await awsData.forEach((item) => {
                    filterData.data[item.id] = item.business_type
                })
            ]
           )

         delete filterData.data["1672659960190"] //remove finance
         
            try{
                await axios.post(`${parsedResult.dynamoDbUrl}/filter`, filterData, {
                    headers: {
                        "x-api-key": parsedResult.dynamoDbKey
                    }
                })
                console.log("Run Successfully Businesstype")
            }catch(error) {
                console.log(error)
            }


        // }
    } catch (error) {
        console.log(error)
    }
}

