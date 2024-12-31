exports.dateTime = (date, timezone)=>{
       let generatedTime=date.getTime();
  //  timezone = "5.30";
    let arr = timezone.split(".")

    let addTime = {hours:arr[0], minutes:arr[1], seconds:0};
    if(addTime.seconds) generatedTime+=1000*addTime.seconds; //check for additional seconds
    if(addTime.minutes) generatedTime+=1000*60*addTime.minutes;//check for additional minutes
    if(addTime.hours) generatedTime+=1000*60*60*addTime.hours;//check for additional hours
    let futureDate = new Date(generatedTime)
    futureDate.setMilliseconds(0);
    return futureDate;
}