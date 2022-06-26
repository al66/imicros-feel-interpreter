"use strict";

const Interpreter = require("../lib/interpreter.js");
const util = require('util');

const interpreter = new Interpreter();

describe("Test interpreter", () => {

    describe("FOR expression", () => {
        it("should evaluate for a in [1,2,3] return a*2 -> [2,4,6]", () => {
            let result = interpreter.evaluate("for a in [1,2,3] return a*2");
            expect(result).toEqual([2,4,6]);
        });
        it("should evaluate for item in items return { amount: item.amount, overdue: date(item.dueDate) < today() } -> [{..},{..}]", () => {
            let result = interpreter.evaluate(`for item in items return { amount: item.amount, overdue: date(item.dueDate) < today() }`, { items: [
                { amount: 345.00, "dueDate":"2022-05-25" },
                { amount: 445.00, "dueDate":"2022-05-24" }
            ]});
            expect(result.length).toEqual(2);
            expect(result[0].overdue).toEqual(true);
            // console.log(util.inspect(result, { showHidden: false, depth: null, colors: true }));
        });
        
        it("should evaluate for item in items return put all(item, { overdue: date(item.dueDate) < today() }) -> [{..., overdue:true},{..., overdue:true},{..., overdue:false}]", () => {
            let today = new Date();
            let todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
            let result = interpreter.evaluate(`for item in items return
                                                    put all(
                                                        item, 
                                                        { overdue: date(item.dueDate) < today() }
                                                    )`, { items: [
                { amount: 345.00, "dueDate":"2022-05-25" },
                { amount: 445.00, "dueDate":"2022-05-24" },
                { amount: 545.00, "dueDate":todayString }
            ]});
            expect(result.length).toEqual(3);
            expect(result).toContainEqual({ amount: 345.00, "dueDate":"2022-05-25", overdue: true });
            expect(result).toContainEqual({ amount: 445.00, "dueDate":"2022-05-24", overdue: true });
            expect(result).toContainEqual({ amount: 545.00, "dueDate":todayString, overdue: false });
            console.log(util.inspect(result, { showHidden: false, depth: null, colors: true }));
        });
    });

});
