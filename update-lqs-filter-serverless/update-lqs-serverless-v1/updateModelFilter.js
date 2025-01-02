const axios = require('axios')
const path = require("path");

let parsedResult = {}

const fetchFilterData = async () => {
    try {
        const getFilterData = await axios.get(`${parsedResult.dynamoDbUrl}/filter`, {
            headers: {
                "x-api-key": parsedResult.dynamoDbKey
            },
            data: { "filter_exp": "id = :id", "exp_attr_value": { ":id": "1663837546651" } }
        })
        // console.log(getFilterData.data.Items[0])
        return getFilterData.data.Items[0]
    } catch (error) {
        console.error(error)
    }
}

const fetchDataFromNagarooModel = async () => {
    try {
       // console.log(`${parsedResult.nagarooPublicUrl}manufacturers/SUZ/models?status=true`)
        const data = await axios.get(`${parsedResult.nagarooPublicUrl}manufacturers/SUZ/models?status=true&lob=${parsedResult.lob}`, {
            headers: {
                "x-api-key": parsedResult.nagarooPublicKey
            },
        } )
        // console.log(data.data.data)
        return data.data.data

    } catch (error) {
        console.error(error)
    }
}

exports.checkUpdate = async (secretValues) => {
    try {
        parsedResult = secretValues;
        const awsData = await fetchDataFromNagarooModel();
                                // console.log(awsData)

        const filterData = await fetchFilterData();
        // console.log(filterData)
        const filterDataLength = Object.keys(filterData[`data_${parsedResult.lob}`]).length
        const awsDataLength = awsData.length
        // if (filterDataLength < awsDataLength) {
        //     console.log(filterDataLength, awsDataLength)
        //     let diff = await awsData.filter(x => !Object.keys(filterData.data).includes(x.code));
            // console.log(diff, "i am the diffrence")
            // console.log(sortedData, "i am sorted data")
               filterData[`data_${parsedResult.lob}`] = {}
            await awsData.forEach((item) => {
                  filterData[`data_${parsedResult.lob}`][item.code] = item.name
            })


            try{
                
                delete filterData.data
                await axios.post(`${parsedResult.dynamoDbUrl}/filter`, filterData, {
                    headers: {
                        "x-api-key": parsedResult.dynamoDbKey
                    }
                })
                console.log("Run Successfully Model")
            }catch(error) {
                console.log(error, "i am error form post")
            }

        // }

    } catch (error) {
        console.log(error)
    }
}
