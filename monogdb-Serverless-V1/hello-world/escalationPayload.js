const AWS = require('aws-sdk');
const dateTimeFormat = require("./dateTimeForma");

const clientPromise = require('./mongo-client');
const axios = require('axios');
exports.LeadEscalationBussiness = async (userData, db_identifiers, lead_id, key, addHrs, is_sales, text, msg_type = "Escalation", lead_data, token, timezone, ownerName, ownerId, parsedResult) => {
    console.log("lead_data.Name", lead_data.Name)
    const escaltionPayload = {
        "msg_type": msg_type,
        "country": db_identifiers,
     "actual_created_on": dateTimeFormat.dateTime(Date.now(), timezone),
        "schedule_time": dateTimeFormat.dateTime(addHrsToCurrent(addHrs), timezone),
        "lead_id": lead_id,
        "timezone": timezone,
        "email": [{
            "sendTo": userData.emailId,
            "subject": await getMeesages("FOLLOWUP_ESCALATION_NOTIFICATION_EMAIL", db_identifiers, token, parsedResult) + ownerName,
            "subject": `${msg_type} Mail`,
            "country": db_identifiers,
            "fileName": key,
            "obj": {
                text: text, 
                lead_details: lead_data,
                imgUrl: parsedResult.image_base_url,
                salesExecutiveName:ownerName,
                toName: userData.firstName,
                androidAppUrl: parsedResult.ANDROID_APP_URL,
                iosAppUrl: parsedResult.IOS_APP_URL,
                privacyPolicy:parsedResult.PRIVACY_POLICY,
                termsAndCondition:parsedResult.TERMS_AND_CONDITIONS

            }
        }],
        "phone": [{
            "send": userData.primaryPhoneNo,
            // "message": readFileSync(join(process.cwd(), `./src/CountryConfig/Escalation/${db_identifiers}/Sms/${key}.txt`)).toString()
        }],
        "portal": [{
            "created_by": "1663738541833",
            "created_for": userData.user_id,
            "is_read": 0,
            "module_link": `${parsedResult.feAppUrl}/Leads/LeadsDetails?id=${lead_id}`,
            "module_class": "entypo-info",
            "module": "LEAD_Escalation",
            "description": await getMeesages("FOLLOWUP_MISSED_TEXT_BY", db_identifiers, token, parsedResult) + ownerName,
            // "id": Date.now().toString(),
            "is_deleted": 0,
            "created_on": dateTimeFormat.dateTime(addHrsToCurrent(addHrs), timezone),
            "title": await getMeesages("NO_ACTION_FOLLWUP_ESCALATION", db_identifiers, token, parsedResult),
            "lead_id": lead_id,
            "sapp_module": "enquirydetails",
            "lob": Number(parsedResult.lob)
        }],

        "extra_parameters": {
            "user_id": userData.user_id,
            "search_key": key,
            "team_lead_id": userData.parent_id || null,
            "outlet_id": userData.user_id.split("-")[0],
            "owner_name": ownerName,
            "owner_id": ownerId
        }
    }
    let payload
    const push_notification_arr = [];
    //If the user is sales executive then send notification to app
    if (is_sales) {
        const data = await getUserDeviceData(userData.user_id, db_identifiers, parsedResult)

        if (data !== null && data.token !== 0) {
            // await Promise.all(data.token.map(async (tokenData: any) => {
            payload = {
                tokens: data.token,
                apns: {
                    payload: {
                        aps: {
                            mutable_content: true,
                            content_available: true,
                            sound: "default",
                        },
                    },
                },
                notification: {
                    title: msg_type === "Followup" ? (await getMeesages("NO_ACTION_FOLLWUP_ESCALATION", db_identifiers, token, parsedResult)) : (await getMeesages("NO_ACTION_QUALIFIED_LEAD_ESCALATION", db_identifiers, token, parsedResult)),
                    body: msg_type === "Followup" ? (await getMeesages("FOLLOWUP_MISSED_TEXT", db_identifiers, token, parsedResult)) : (await getMeesages("NO_ACTION_QUALIFIED_LEAD_ESCALATION", db_identifiers, token, parsedResult)),
                },
                android: {
                    priority: "high",
                    notification: {
                        title: msg_type === "Followup" ? (await getMeesages("NO_ACTION_FOLLWUP_ESCALATION", db_identifiers, token, parsedResult)) : (await getMeesages("NO_ACTION_QUALIFIED_LEAD_ESCALATION", db_identifiers, token, parsedResult)),
                        body: msg_type === "Followup" ? (await getMeesages("FOLLOWUP_MISSED_TEXT", db_identifiers, token, parsedResult)) : (await getMeesages("NO_ACTION_QUALIFIED_LEAD_ESCALATION", db_identifiers, token, parsedResult)),
                    },
                },
                data: {
                    priority: "high",
                    title: msg_type === "Followup" ? (await getMeesages("NO_ACTION_FOLLWUP_ESCALATION", db_identifiers, token, parsedResult)) : (await getMeesages("NO_ACTION_QUALIFIED_LEAD_ESCALATION", db_identifiers, token, parsedResult)),
                    body: msg_type === "Followup" ? (await getMeesages("FOLLOWUP_MISSED_TEXT", db_identifiers, token, parsedResult)) : (await getMeesages("NO_ACTION_QUALIFIED_LEAD_ESCALATION", db_identifiers, token, parsedResult)),
                    leadId: lead_id,
                    sapp_module: "enquirydetails"
                },
            };

        }
    }

    console.log(escaltionPayload, "final paylaod")
    escaltionPayload.push_notification = push_notification_arr
    escaltionPayload.is_active = 1
    escaltionPayload.lob =  Number(parsedResult.lob)
    const dbclient = await clientPromise;
    await dbclient
        .db("")
        .collection("events").insertOne(escaltionPayload)

    return escaltionPayload
}

const random4Digit = () => {
    const data = shuffle("0123456789".split('')).join('').substring(0, 4);
    return data
}

const shuffle = (o) => {
    for (var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
}

const addHrsToCurrent = (hrs) => {
    var date = new Date().getTime();
    date += (hrs * 60 * 60 * 1000);
    console.log(new Date(date), "updated Date");
    return new Date(date)
    // displays: Wed, 30 Jul 2014 01:44:06 GMT
}

const getMonth = (month) => {
    const monthArray = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    return monthArray[month - 1]
}

const formatAMPM = (_date) => {
    const date = new Date(_date.split(".")[0])
    let hours = date.getHours();

    let minutes = date.getMinutes();
    let ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0' + minutes : minutes;
    let strTime = hours + ':' + minutes + ' ' + ampm;
    return strTime;
}

const getMeesages = async (key, db_identifiers, token, parsedResult) => {

    try {
 
        const mssgData = await axios.post(`${parsedResult.leadAppUrl}/restful/get-custom-messages`,
            {
                country: db_identifiers,
                messageType: key
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': parsedResult["x-api-key"]
                }
            })

        console.log(mssgData.data, "data for the mesage")

        return mssgData.data.data

    } catch (error) {

        console.log(error)
    }
}


const getUserDeviceData = async (user_id, db_identifiers, parsedResult) => {
    try {
        const userDeviceData = await axios.post(`${parsedResult.leadAppUrl}/restful/get-user-device-data`,
            {
                country: db_identifiers,
                id: user_id
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': parsedResult["x-api-key"]
                }
            })



        console.log(userDeviceData.data, "data for the mesage")

        return userDeviceData.data.data

    } catch (error) {

        console.log(error)
    }
}
