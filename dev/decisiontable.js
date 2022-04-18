
let decisionTable = `
decision table(
    outputs: ["Applicant Risk Rating"],
    inputs: ["Applicant Age","Medical History"],
    rule list: [
        [>60,"good","Medium"],
        [>60,"bad","High"],
        [[25..60],-,"Medium"],
        [<25,"good","Low"],
        [<25,"bad","Medium"]
    ],
    hit policy: "Unique"
)`
