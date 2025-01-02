
const escaltionPayload = require("./escalationPayload")
const axios = require('axios');
const AWS = require('aws-sdk');




exports.handleMessage = async (escalationDataSet, parsedResult) => {

    const escalationData = escalationDataSet
    const lob = Number(parsedResult.lob)
    
    try {

        const token = '';
        const emailLeadDeatilsPayload = {
            "Lead Id": escalationData.lead_id,
            Phone: escalationData.email[0].obj.lead_details.Phone,
            Email: escalationData.email[0].obj.lead_details.Email,
            Name: escalationData.email[0].obj.lead_details.Name,
            Title: escalationData.email[0].obj.lead_details.Title,
            "Middle Name": escalationData.email[0].obj.lead_details["Middle Name"],
            "Last Name": escalationData.email[0].obj.lead_details["Last Name"],
            "Communication Medium": escalationData.email[0].obj.lead_details["Communication Medium"],
            "Lead Source": escalationData.email[0].obj.lead_details["Lead Source"],
            "Likely Purchase Date": escalationData.email[0].obj.lead_details["Likely Purchase Date"],
            "Customer Comment": escalationData.email[0].obj.lead_details["Customer Comment"]
        }




        console.log("Print team Lead Id", escalationData.extra_parameters.team_lead_id)

        if (1) {
            if (escalationData.extra_parameters.search_key === "two_hrs") {
                //send mail
                let userData = {}
                let baseurl
                //Send notification for four hrs to the team lead

                if (escalationData.extra_parameters.team_lead_id) {

                    baseurl = `/employees?dealerCode=${escalationData.extra_parameters.outlet_id}&designationCode=TL&status=2&code=${escalationData.extra_parameters.team_lead_id}`;

                } else if (escalationData.extra_parameters.outlet_id) {
                    //If not team lead found send the request to the outlet manager
                    baseurl = `/employees?dealerCode=${escalationData.extra_parameters.outlet_id}&designationCode=SM&status=2`;
                } else {
                    return
                }
                const payloadOwner = new URLSearchParams([["lob", lob]])
                console.log(baseurl, "i am the base url")
                userData = await axios.get(
                    `${parsedResult.urlNagroo}${baseurl}`, {
                        params: payloadOwner,
                        headers: {
                            'Content-Type': 'application/json',
                            "x-api-key": parsedResult.xApiKeyNagroo

                        }
                }
                );


                console.log("userdata fro nagaro", userData.data.totalRecords)

                if (userData.data.totalRecords > 0) {
                    //  console.log("Outlet manger found",userData )
                    userData = userData.data.data[0]
                    //console.log("Outlet manger found at 0 elemwnr",userData )

                    userData.user_id = escalationData.extra_parameters.outlet_id + "-" + userData.code

                    userData.user_id = userData.user_id.toUpperCase()
                    console.log("user id added", userData)

                    const escalationPayload = await escaltionPayload.LeadEscalationBussiness(userData, escalationData.country, escalationData.lead_id,
                        "four_hrs",
                        2,
                        0,
                        escalationData.email[0].obj.text, escalationData.msg_type, emailLeadDeatilsPayload, token, escalationData.timezone ? escalationData.timezone : parsedResult.timezone, escalationData.extra_parameters.owner_name, escalationData.extra_parameters.owner_id, parsedResult)
                    console.log("final escalationPayload of four hours", (escalationPayload))
                } else {

                    console.log("Could not get two_hours User data");
                }

            } else if (escalationData.extra_parameters.search_key === "four_hrs") {
                //Send notification for eight hrs to the outlet manager
                //Get outlet Manager Data
                try {
                    const payloadOwner = new URLSearchParams([["lob", lob]])
                    let outletManagerData = await axios.get(
                        `${parsedResult.urlNagroo}/employees?dealerCode=${escalationData.extra_parameters.outlet_id}&designationCode=SM&status=2`, {
                            params: payloadOwner,
                            headers: {
                                'Content-Type': 'application/json',
                                "x-api-key": parsedResult.xApiKeyNagroo

                            }
                        }
                    );

                //  console.log("userdata fro nagaro", userData.data.totalRecords)

                    if (outletManagerData.data.totalRecords > 0) {
                        //outletManagerData = outletManagerData.data
                        
                        outletManagerData = outletManagerData.data.data[0]
                        //console.log("Outlet manger found at 0 elemwnr",userData )
    
                        outletManagerData.user_id = escalationData.extra_parameters.outlet_id + "-" + outletManagerData.code
    
                        outletManagerData.user_id = outletManagerData.user_id.toUpperCase()
                        console.log("user id added", outletManagerData)
                    
                    
                        console.log("outlet manger Data", outletManagerData)
                        const escalationPayload = await escaltionPayload.LeadEscalationBussiness(outletManagerData, escalationData.country, escalationData.lead_id,
                            "eight_hrs",
                            4,
                            0,
                            escalationData.email[0].obj.text, escalationData.msg_type, emailLeadDeatilsPayload, token, escalationData.timezone ? escalationData.timezone : parsedResult.timezone, escalationData.extra_parameters.owner_name, escalationData.extra_parameters.owner_id, parsedResult)
                        console.log(escalationPayload)
                        
                        
                    }else{
                        
                      
                    }
                } catch (error) {
                    console.log(error)
                }
            }
            else if (escalationData.extra_parameters.search_key === "eight_hrs") {
                  //Send notification for sixteen hrs to the distributor
                //Get outlet Manager Data
                // try {
                //     const payloadOwner = new URLSearchParams([["lob", lob]])
                //     let distributorData = await axios.get(
                //         `${parsedResult.urlNagroo}/distributors?status=true&dealerCodecode=${escalationData.extra_parameters.outlet_id}`, {
                //             params: payloadOwner,
                //             headers: {
                //                 'Content-Type': 'application/json',
                //                 "x-api-key": parsedResult.xApiKeyNagroo

                //             }
                //         }
                //     );

                // //  console.log("userdata fro nagaro", userData.data.totalRecords)

                //     if (distributorData.data.totalRecords > 0) {
                //         //outletManagerData = outletManagerData.data
                        
                //         distributorData = distributorData.data.data[0]
                //         //console.log("Outlet manger found at 0 elemwnr",userData )
    
                //         distributorData.user_id = escalationData.extra_parameters.outlet_id + "-" + distributorData.code
    
                //         distributorData.user_id = distributorData.user_id.toUpperCase()
                //         console.log("user id added", distributorData)
                    
                    
                //         console.log("outlet manger Data", distributorData)
                //         distributorData.emailId = distributorData.email ? distributorData.email : ""
                //         distributorData.firstName = distributorData.userName ? distributorData.userName : ""
                //         distributorData.primaryPhoneNo = distributorData.phoneNumber ? distributorData.phoneNumber : ""
                //         const escalationPayload = await escaltionPayload.LeadEscalationBussiness(distributorData, escalationData.country, escalationData.lead_id,
                //             "eight_hrs",
                //             8,
                //             0,
                //             escalationData.email[0].obj.text, escalationData.msg_type, emailLeadDeatilsPayload, token, escalationData.timezone ? escalationData.timezone : parsedResult.timezone, escalationData.extra_parameters.owner_name, escalationData.extra_parameters.owner_id, parsedResult)
                //         console.log(escalationPayload)
                        
                        
                //     }else{
                        
                      
                //     }
                // } catch (error) {
                //     console.log(error)
                // }
            }
        }
    } catch (error) {
        console.log(error)
    }
}