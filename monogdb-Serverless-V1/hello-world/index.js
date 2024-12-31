
const AWS = require('aws-sdk');
const dateTimeFormat = require("./dateTimeForma");
const sqsPush = require('./sqsPush');
const escalationNew = require("./escalationNew");
const clientPromise = require('./mongo-client');
const { ObjectId } = require("mongodb");

exports.handler = async (event) => {
    const client = await clientPromise;

    try {
        // Get the system date and time string and remove the fraction second from that
        const systemDate = new Date(new Date().setSeconds(0, 0));

        // Add timezone to get exact date and time string
        const secret_name = "lqs/apiKey";
        const clientSecret = new AWS.SecretsManager({
            region: process.env.AWS_REGION,
        });

        const resultSecret = await clientSecret.getSecretValue({ SecretId: secret_name }).promise();
        const parsedResult = JSON.parse(resultSecret.SecretString);
        const timeZone = parsedResult.timezone;
        parsedResult.lob = 1;

        let currentDateString = dateTimeFormat.dateTime(systemDate, timeZone);
        const currentDate = `${currentDateString.getFullYear()}-${currentDateString.getMonth() < 9 ? '0' : ''}${currentDateString.getMonth() + 1}-${currentDateString.getDate() < 10 ? '0' : ''}${currentDateString.getDate()}T${currentDateString.getHours() < 10 ? '0' : ''}${currentDateString.getHours()}:${currentDateString.getMinutes() < 10 ? '0' : ''}${currentDateString.getMinutes()}:00.000Z`;

        console.log('CurrentDate::',currentDate);

        const result = await client.db("").collection("events").find({ schedule_time: { $lte: new Date(currentDate) }, lob: Number(parsedResult.lob) }, { "batchSize": 10 }).toArray();

        console.log("@@@@@@@@: ", result);

        const operations = result.map(async (elem) => {
            try {
                await client.db("").collection("events").deleteOne({ _id: new ObjectId(elem._id) });
                console.log("Deleted");

                console.log(JSON.stringify(elem), "id of the user");
                await sqsPush.pushIntoSqs(JSON.stringify(elem), parsedResult);

                if (elem.msg_type == 'Escalation' || elem.msg_type == 'Followup') {
                    console.log("In escalation block");
                    await escalationNew.handleMessage(elem, parsedResult);
                }
            } catch (err) {
                console.log(err.message);
            }
        });

        await Promise.all(operations);

    } catch (error) {
        throw new Error(error);
        console.error(error);
    } 
    // finally {
    //     // Close the MongoDB connection
    //     console.log(`Db Connection getting closed`)
    //     await client.close();
    // }

    return {
        statusCode: 200,
    };
};