const appleAppSiteApplication = {
    "appclips":{
        "apps":[
            "L9XMPZ8VHL.com.begenuin.begenuin.Clip",
            "L9XMPZ8VHL.com.begenuin.begenuin.qa.Clip"
        ]
    },
    "applinks":{
        "apps":[],
        "details":[
            {
                "paths":[
                    "/86sn/*"
                ],
                "appID":"L9XMPZ8VHL.com.begenuin.begenuin"
            },
            {
                "paths":[
                    "/9YGw/*"
                ],
                "appID":"L9XMPZ8VHL.com.begenuin.begenuin.qa"
            }
        ]
    }
}
export default function AppleAppSiteApplication() {
    return JSON.stringify(appleAppSiteApplication)
}