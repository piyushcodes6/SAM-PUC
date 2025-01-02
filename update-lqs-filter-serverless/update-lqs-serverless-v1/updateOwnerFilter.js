const axios = require('axios');
const path = require("path");
let parsedResult = {};

const fetchFilterData = async () => {
    try {
        const getFilterData = await axios.get(`${parsedResult.dynamoDbUrl}/filter`, {
            headers: {
                "x-api-key": parsedResult.dynamoDbKey
            },
            data: { "filter_exp": "id = :id", "exp_attr_value": { ":id": "1707312035044" } }
        });
        return getFilterData.data.Items[0];
    } catch (error) {
        console.error(error);
    }
};

const fetchOwnerDataFromNagaroo = async () => {
    try {
        
        const dealerDataRes = await axios.get(`${parsedResult.nagarooPublicUrl}parentDealers/all/dealers?type=1,2,3&status=true&lob=${parsedResult.lob}`, {
            headers: {
                "x-api-key": parsedResult.nagarooPublicKey
            },
        } );
        const dealerData = dealerDataRes.data.data;
        const ownerDataArr = [];
        const promises = dealerData.map(async dealerData => {
            const data = await axios.get(`${parsedResult.nagarooPublicUrl}employees?lob=${parsedResult.lob}&dealerCode=${dealerData.code}&status=2&designationCode=SE`, {
                headers: {
                    "x-api-key": parsedResult.nagarooPublicKey
                } 
            });
            ownerDataArr.push(...data.data.data);
        });
        await Promise.all(promises)
        return ownerDataArr;
        

    } catch (error) {
        console.error(error);
    }
};




exports.checkUpdate = async (secretValues) => {
    try {
        parsedResult = secretValues;
        const filterData = await fetchFilterData();
        const ownerData = await fetchOwnerDataFromNagaroo();
        filterData.data = {}
        
        await ownerData.forEach((item) => {
            console.log("item.name", item.middleName)
            filterData.data[item.dealerCode+"~"+item.code] = item.firstName + " " + `${item.middleName ? `${item.middleName} ` : ""}` + item.lastName;
        })
        console.log("filterData", JSON.stringify(filterData))
        try{
            await axios.post(`${parsedResult.dynamoDbUrl}/filter`, filterData, {
                headers: {
                    "x-api-key": parsedResult.dynamoDbKey
                }
            })
            console.log("Run Successfully ownerData")
        }catch(error) {
            console.log(error)
        }

    } catch (error) {
        console.log(error)
    }
}
    