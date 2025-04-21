const tests = [
    // add tests from file ../test/interpreter.datetime.spec.js here
    {
        expression: "date(\"2022-04-10\")",
        data: {},
        result: "2022-04-10"
    },
    {
        expression: "date(\"2022-04-10\").year",
        data: {},
        result: 2022
    },
    {
        expression: "date(\"2022-04-10\").month",
        data: {},
        result: 4
    },
    {
        expression: "@\"2022-04-10\".month",
        data: {},
        result: 4
    },
    {
        expression: "date(\"2022-04-10\").day",
        data: {},
        result: 10
    },
    {
        expression: "date and time(\"2022-04-10T13:15:20\")",
        data: {},
        result: "2022-04-10T13:15:20"
    },
    {
        expression: "date and time(\"2022-04-10T13:15:20\").year",
        data: {},
        result: 2022
    },
    {
        expression: "date and time(\"2022-04-10T13:15:20\").month",
        data: {},
        result: 4
    },
    {
        expression: "@\"2022-04-10T13:15:20\".month",
        data: {},
        result: 4
    },
    {
        expression: "date and time(\"2022-04-10T13:15:20\").day",
        data: {},
        result: 10
    },
    {
        expression: "date and time(\"2022-04-10T13:15:20\").hour",
        data: {},
        result: 13
    },
    {
        expression: "date and time(\"2022-04-10T13:15:20\").minute",
        data: {},
        result: 15
    },
    {
        expression: "date and time(\"2022-04-10T13:15:20\").second",
        data: {},
        result: 20
    },
    {
        expression: "@\"P12D5M\".months",
        data: {},
        result: 5
    },
    {
        expression: "@\"P12D5MT5H30M15S\".minutes",
        data: {},
        result: 30
    },
    {
        expression: "@\"2022-04-10T13:15:20\" + @\"P1M\"",
        data: {},
        result: "2022-05-10T13:15:20"
    },
    {
        expression: "@\"2022-05-10T13:15:20\" - @\"P1M\"",
        data: {},
        result: "2022-04-10T13:15:20"
    },
    {
        expression: "date(\"2025-03-30\") + duration(\"P7D\")",
        data: {},
        result: "2025-04-06"
    },
    {
        expression: "date(\"2025-03-30\") + duration(\"P10M\")",
        data: {},
        result: "2026-01-30"
    },
    {
        expression: "@\"2022-04-10\" + @\"P2D1M\"",
        data: {},
        result: "2022-05-12"
    },
    {
        expression: 'date("2025-03-30") + duration("P20M7D")',
        data: {},
        result: "2026-12-07"
    },
    {
        expression: 'date("2017-08-30") + duration("P18M")',
        data: {},
        result: "2019-02-28"
    },
    {
        expression: 'date("2026-12-07") - duration("P20M7D")',
        data: {},
        result: "2025-03-31"
    },
    {
        expression: "@\"2022-04-10T13:15:20\" + @\"PT30M\"",
        data: {},
        result: "2022-04-10T13:45:20"
    },
    {
        expression: "@\"PT30M\" + @\"2022-04-10T13:15:20\"",
        data: {},
        result: "2022-04-10T13:45:20"
    },
    {
        expression: "@\"13:15:20\" + @\"PT30M\"",
        data: {},
        result: "13:45:20"
    },
    {
        expression: "@\"13:45:20\" - @\"PT30M\"",
        data: {},
        result: "13:15:20"
    },
    {
        expression: "@\"P7M2Y\" + @\"P5D\"",
        data: {},
        result: "P5D7M2Y"
    },
    {
        expression: "@\"P7M2Y\" - @\"P5M\"",
        data: {},
        result: "P2M2Y"
    },
    {
        expression: "@\"P7M2Y\" - @\"P5D\"",
        data: {},
        result: "P7M2Y"
    },
    {
        expression: "date(\"2022-05-14\") - date(\"2020-09-10\")",
        data: {},
        result: "P4D8M1Y"
    },
    {
        expression: "date(\"2020-09-10\")-date(\"2022-05-14\")",
        data: {},
        result: "-P4D8M1Y"
    },
    {
        expression: "today().year",
        data: {},
        result: new Date().getFullYear()
    },
    {
        expression: "now().minute",
        data: {},
        result: new Date().getMinutes()
    },
    {
        expression: "day of week(@\"2022-04-16\")",
        data: {},
        result: "Saturday"
    },
    {
        expression: "day of year(@\"2022-04-16\")",
        data: {},
        result: 106
    },
    {
        expression: "month of year(@\"2022-04-16\")",
        data: {},
        result: "April"
    },
    {
        expression: "week of year(@\"2022-04-16\")",
        data: {},
        result: 15
    },
    {
        expression: `abs(@"-P7M2Y")`,
        data: {},
        result: "P7M2Y"
    },
    {
        expression: `years and months duration(date("2022-05-14"), date("2020-09-10"))`,
        data: {},
        result: "-P8M1Y"
    },
    {
        expression: `years and months duration(date("2020-09-10"),date("2022-05-14"))`,
        data: {},
        result: "P8M1Y"
    },
    {
        expression: `date(from:date and time("2017-08-30T10:25:00"))`,
        data: {},
        result: "2017-08-30"
    },
    {
        expression: `time(19,48,55,duration("PT1H"))`,
        data: {},
        result: "20:48:55"
    },
    {
        expression: `string(date("999999999-12-31"))`,
        data: {},
        result: "999999999-12-31"
    },
    {
        expression: `string(date("-999999999-12-31"))`,
        data: {},
        result: "-999999999-12-31"
    },
    {
        expression: `string(date(999999999,12,31))`,
        data: {},
        result: "999999999-12-31"
    },
    {
        expression: `string(date(-999999999,12,31))`,
        data: {},
        result: "-999999999-12-31"
    },
    {
        case: "wrong format for date",
        expression: `date("2012-12-25T")`,
        data: {},
        result: null
    },
    {
        expression: `date(date and time(date and time("2017-08-14T14:25:00"),time("10:50:00")))`,
        data: {},
        result: "2017-08-14"
    },
    {
        expression: `date(1000999999,12,32)`,
        data: {},
        result: null
    },
    {
        expression: `date(-1000999999,12,32)`,
        data: {},
        result: null
    },
    {
        expression: `date(-1000999999,12,01)`,
        data: {},
        result: null
    }
];

module.exports = {
    tests
};