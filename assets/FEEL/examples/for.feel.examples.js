
let today = new Date();
let todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

const tests = [
    {
        expression: `for item in items return { amount: item.amount, overdue: date(item.dueDate) < today() }`,
        data: { items: [
            { amount: 345.00, "dueDate":"2022-05-25" },
            { amount: 445.00, "dueDate":"2022-05-24" }
        ]},
        result: [
            { amount: 345.00, overdue: true },
            { amount: 445.00, overdue: true }
        ]
    },
    {
        expression: `for item in items return
                        put all(
                            item, 
                            { overdue: date(item.dueDate) < today() }
                        )`,
        data: { items: [
            { amount: 345.00, "dueDate":"2022-05-25" },
            { amount: 445.00, "dueDate":"2022-05-24" },
            { amount: 545.00, "dueDate":todayString }
        ]},
        result: [
            { amount: 345.00, "dueDate":"2022-05-25", overdue: true },
            { amount: 445.00, "dueDate":"2022-05-24", overdue: true },
            { amount: 545.00, "dueDate":todayString, overdue: false }
        ]
    }
];

module.exports = {
    tests
};