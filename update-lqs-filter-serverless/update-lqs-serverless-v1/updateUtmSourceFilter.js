const axios = require('axios')

let parsedResult = {}

const fetchFilterData = async () => {
    try {
        const getFilterData = await axios.get(`${parsedResult.dynamoDbUrl}/filter`, {
            headers: {
                "x-api-key": parsedResult.dynamoDbKey
            },
            data: { "filter_exp": "id = :id", "exp_attr_value": { ":id": "1663837406316" } }
        })
        return getFilterData.data.Items[0]
    } catch (error) {
        console.error(error)
    }
}

const fetchDataFromAWS = async () => {
    try {
        const data = await axios.get(`${parsedResult.dynamoDbUrl}/utm-source`, {
            headers: {
                "x-api-key": parsedResult.dynamoDbKey
            }
        })

        return data.data.Items

    } catch (error) {
        console.error(error)
    }
}

exports.checkUpdate = async (secretValues) => {
    try {
        parsedResult = secretValues;
        const filterData = await fetchFilterData();
        const awsData = await fetchDataFromAWS();

        // const filterDataLength = Object.keys(filterData.data).length
        // const awsDataLength = awsData.length

        // console.log(soretdData, "heyyyyyyyyyyy")
        // filterData.data = soretdData
        // console.log(filterDataLength , awsDataLength)
        // 
        // if (filterDataLength < awsDataLength) {
        //     let diff = await awsData.filter(x => !Object.keys(filterData.data).includes(x.id));
               filterData.data = {}
            await awsData.forEach((item) => {
                filterData.data[item.utm_source] = item.utm_source
            })

           // console.log(filterData)
            await axios.post(`${parsedResult.dynamoDbUrl}/filter`, filterData, {
                headers: {
                    "x-api-key": parsedResult.dynamoDbKey
                }
            })
        // }
        console.log("Run Successfullyutm source")

    } catch (error) {
        console.log(error)
    }
}

