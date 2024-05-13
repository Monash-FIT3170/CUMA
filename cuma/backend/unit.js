async function addUnitInfo(universityName, unitInfo){
    /** 
    unitInfo structure: {
        name: str;
        desc: 
        type: int;
        creditPt: int;
        level: int;
        overview: str;
        link: str

    }
    */
    // var name=  unitInfo.name;
    // var desc=  unitInfo.desc;
    // var type=  unitInfo.type;
    // var creditPt= unitInfo.creditPt;
    // var level= unitInfo.level;
    // var overview= unitInfo.overview;
    // var link= unitInfo.link;

    fieldMissing = []
    
    // if (desc) {
    //     if (type) {
    //         if (creditPt) {
    //             if (level) {
    //                 if (overview) {
    //                     if (link) {
                            try {
                                const response = await fetch("http://127.0.0.1:3000" + "/api/unit", {
                                  method: "POST", 
                                  headers: {
                                    "Content-Type": "application/json",
                                  },
                                  body: JSON.stringify({"universityName": universityName, unitInfo}),
                                });

                                console.log({"universityName": universityName, unitInfo})
                            
                                const result = await response.json();
                                console.log("Success:", result);
                              } catch (error) {
                                console.error("Error:", error);
                            }
    //                     } else {
    //                         fieldMissing.push("desc");
    //                     }
    //                 } else {
    //                     fieldMissing.push("type");
    //                 }
    //             } else {
    //                 fieldMissing.push("creditPt");
    //             }
    //         } else {
    //             fieldMissing.push("level");
    //         }
    //     } else {
    //         fieldMissing.push("overview");
    //     }
    // } else {
    //     fieldMissing.push("link");
    // }
}



function modifyUnit(unitCode, unitInfoChange){
    /** 
    unitInfo structure: {
        name: str;
        desc: 
        type: int;
        creditPt: int;
        level: int;
        overview: str;
        link: str

    }
    */

    db.Unit.updateOne({unitCode: unitCode}, {$set:unitInfoChange})

    return {successCode: 1, message : message.success}

}

function deleteUnit(unitCode){
    /** 
    unitInfo structure: {
        name: str;
        desc: 
        type: int;
        creditPt: int;
        level: int;
        overview: str;
        link: str

    }
    */

    db.Unit.deleteOne({unitCode: unitCode})

    return {successCode: 1, message : message.success}

}






