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
        expression: "@\"P2Y5M\".months",
        data: {},
        result: 5
    },
    {
        expression: "@\"P12DT5H30M15S\".minutes",
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
        expression: "@\"2022-04-10\" + @\"P2Y1M\"",
        data: {},
        result: "2024-05-10"
    },
    {
        expression: 'date("2025-03-30") + duration("P20M") + duration("P7D")',
        data: {},
        result: "2026-12-07"
    },
    {
        expression: 'date("2017-08-30") + duration("P18M")',
        data: {},
        result: "2019-02-28"
    },
    {
        expression: 'date("2026-12-07") - duration("P20M") - duration("P7D")',
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
        expression: "@\"P2Y7M\" + @\"P1M\"",
        data: {},
        result: "P2Y8M"
    },
    {
        expression: "@\"P2Y7M\" - @\"P5M\"",
        data: {},
        result: "P2Y2M"
    },
    {
        expression: "@\"P2Y7M\" - @\"P5D\"",
        description: "subtraction of a days and time duration from a years and  month duration is not allowed",
        data: {},
        result: null
    },
    {
        expression: '@"P20DT5H30M" - @"P25D"',
        data: {},
        result: "-P4DT18H30M"
    },
    {
        expression: "date(\"2022-05-14\") - date(\"2020-09-10\")",
        data: {},
        result: "P611D"
    },
    {
        expression: "date(\"2020-09-10\")-date(\"2022-05-14\")",
        data: {},
        result: "-P611D"
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
        expression: `abs(@"-P2Y7M")`,
        data: {},
        result: "P2Y7M"
    },
    {
        expression: `years and months duration(date("2022-05-14"), date("2020-09-10"))`,
        data: {},
        result: "-P1Y8M"
    },
    {
        expression: `years and months duration(date("2020-09-10"),date("2022-05-14"))`,
        data: {},
        result: "P1Y8M"
    },
    {
        expression: `date(from:date and time("2017-08-30T10:25:00"))`,
        data: {},
        result: "2017-08-30"
    },
    {
        expression: `time(19,48,55,duration("PT1H"))`,
        data: {},
        result: "19:48:55+01:00"
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
        //analyse: true,
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
    },
    {
        expression: `@"P10D" instance of days and time duration`,
        data: {},
        result: true
    },
    {
        expression: `string(@"2018-12-08T10:30:11@Australia/Melbourne")`,
        data: {},
        result: "2018-12-08T10:30:11@Australia/Melbourne"
    },
    {
        expression: `string(@"2025-04-25T20:30:11@Australia/Melbourne")`,
        data: {},
        result: "2025-04-25T20:30:11@Australia/Melbourne"
    },
    {
        expression: `string(@"2018-12-08T10:30:11+11:00")`,
        data: {},
        result: "2018-12-08T10:30:11+11:00"
    },
    {
        expression: `string(@"10:30:11+11:00")`,
        //analyse: true,
        data: {},
        result: "10:30:11+11:00"
    },
    {
        expression: `duration("-PT2H")`,
        data: {},
        result: "-PT2H"
    },
    {
        expression: `date("2025-03-30" ) + duration("P7D")`,
        data: {},
        result: "2025-04-06"
    },
    {
        expression: `time(hour:11, minute:59, second:0, offset: duration("-PT2H"))`,
        data: {},
        result: "11:59:00-02:00"
    },
    {
        expression: `string(@"2018-12-08T10:30:11+11:00")`,
        //analyse: true,
        data: {},
        result: "2018-12-08T10:30:11+11:00"
    },
    {
        expression: `time(11, 59, 45, duration("-PT0H"))`,
        data: {},
        result: "11:59:45Z"
    },
    {
        expression: `time(date("2017-08-10"))`,
        data: {},
        result: "00:00:00Z"
    },
    {
        expression: `time(date and time(date and time("2017-09-05T10:20:00"),time("09:15:30Z")))`,
        data: {},
        result: "09:15:30Z"
    },
    {
        expression: `time(date and time("2017-08-10T10:20:00-00:00"))`,
        data: {},
        result: "10:20:00Z"
    },
    {
        expression: `time("11:22:00.123456789")`,
        //analyse: true,
        data: {},
        result: "11:22:00.123456789"
    },
    {
        expression: `day of week(date: @"2019-09-17")`,
        //analyse: true,
        data: {},
        result: "Tuesday"
    },
    {
        expression: `string(date and time(date and time("2017-09-05T10:20:00@Europe/Paris"),time("09:15:30.987654321@Europe/Paris")))`,
        //analyse: true,
        data: {},
        result: "2017-09-05T09:15:30.987654321@Europe/Paris"
    },
    {
        expression: `string(date and time("-999999999-12-31T23:59:59.999999999+02:00"))`,
        //analyse: true,
        data: {},
        result: "-999999999-12-31T23:59:59.999999999+02:00"
    },
    {
        expression: `years and months duration(from:date and time("2014-12-31T23:59:59"),to:date and time("2016-12-31T00:00:01"))`,
        //analyse: true,
        data: {},
        result: "P2Y"
    },
    {
        expression: `years and months duration(date("2016-01-01"),date("2016-01-01"))`,
        //analyse: true,
        data: {},
        result: "P0M"
    },
    {
        expression: `years and months duration(date and time("2014-12-31T23:59:59"), date and time("-2019-10-01T12:32:59"))`,
        //analyse: true,
        data: {},
        result: "-P4033Y2M"
    },
    {
        expression: `day of year(date_input_001)`,
        //analyse: true,
        data: { date_input_001: "1970-01-01T10:10:10" },
        result: 1
    },
    {
        expression: `day of week(date_input_001+@"P1D")`,
        //analyse: true,
        data: { date_input_001: "2021-01-11" },
        result: "Tuesday"
    },
    {
        expression: `week of year(@"2004-01-01")`,
        //analyse: true,
        data: { },
        result: 1
    },
    {
        expression: `week of year(date(2005, 1, 1))`,
        //analyse: true,
        data: { },
        result: 53
    },
    {
        expression: `Base Vacation Days + max( Extra days case 1, Extra days case 3 ) + Extra days case 2`,
        //analyse: true,
        data: { "Base Vacation Days": 25,
                "Extra days case 1": 5,
                "Extra days case 2": 1,
                "Extra days case 3": 3,
         },
        result: 31
    }
    // 
];

module.exports = {
    tests
};