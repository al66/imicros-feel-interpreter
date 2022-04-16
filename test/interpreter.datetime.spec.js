"use strict";

const Interpreter = require("../lib/interpreter.js");

const interpreter = new Interpreter();

describe("Test interpreter", () => {

    describe("Date and time expression", () => {
        it("should evaluate date(\"2022-04-10\") -> \"2022-04-10\"", () => {
            let result = interpreter.evaluate("date(\"2022-04-10\")");
            expect(result).toEqual("2022-04-10");
        });
        it("should evaluate date(\"2022-04-10\").year -> 2022", () => {
            let result = interpreter.evaluate("date(\"2022-04-10\").year");
            expect(result).toEqual(2022);
        });
        it("should evaluate date(\"2022-04-10\").month -> 4", () => {
            let result = interpreter.evaluate("date(\"2022-04-10\").month");
            expect(result).toEqual(4);
        });
        it("should evaluate @\"2022-04-10\".month -> 4", () => {
            let result = interpreter.evaluate("@\"2022-04-10\".month");
            expect(result).toEqual(4);
        });
        it("should evaluate date(\"2022-04-10\").day -> 10", () => {
            let result = interpreter.evaluate("date(\"2022-04-10\").day");
            expect(result).toEqual(10);
        });
        it("should evaluate date and time(\"2022-04-10T13:15:20\") -> \"2022-04-10T13:15:20\"", () => {
            let result = interpreter.evaluate("date and time(\"2022-04-10T13:15:20\")");
            expect(result).toEqual("2022-04-10T13:15:20");
        });
        it("should evaluate date and time(\"2022-04-10T13:15:20\").year -> 2022", () => {
            let result = interpreter.evaluate("date and time(\"2022-04-10T13:15:20\").year");
            expect(result).toEqual(2022);
        });
        it("should evaluate date and time(\"2022-04-10T13:15:20\").month -> 4", () => {
            let result = interpreter.evaluate("date and time(\"2022-04-10T13:15:20\").month");
            expect(result).toEqual(4);
        });
        it("should evaluate @\"2022-04-10T13:15:20\".month -> 4", () => {
            let result = interpreter.evaluate("@\"2022-04-10T13:15:20\".month");
            expect(result).toEqual(4);
        });
        it("should evaluate date and time(\"2022-04-10T13:15:20\").day -> 10", () => {
            let result = interpreter.evaluate("date and time(\"2022-04-10T13:15:20\").day");
            expect(result).toEqual(10);
        });
        it("should evaluate date and time(\"2022-04-10T13:15:20\").hour -> 13", () => {
            let result = interpreter.evaluate("date and time(\"2022-04-10T13:15:20\").hour");
            expect(result).toEqual(13);
        });
        it("should evaluate date and time(\"2022-04-10T13:15:20\").minute -> 15", () => {
            let result = interpreter.evaluate("date and time(\"2022-04-10T13:15:20\").minute");
            expect(result).toEqual(15);
        });
        it("should evaluate date and time(\"2022-04-10T13:15:20\").second -> 20", () => {
            let result = interpreter.evaluate("date and time(\"2022-04-10T13:15:20\").second");
            expect(result).toEqual(20);
        });
        it("should evaluate @\"P12D5M\".months -> 5", () => {
            let result = interpreter.evaluate("@\"P12D5M\".months");
            expect(result).toEqual(5);
        });
        it("should evaluate @\"P12D5MT5H30M15S\".minutes -> 30", () => {
            let result = interpreter.evaluate("@\"P12D5MT5H30M15S\".minutes");
            expect(result).toEqual(30);
        });
        it("should evaluate @\"2022-04-10T13:15:20\" + @\"P1M\" -> \"2022-05-10T13:15:20\"", () => {
            let result = interpreter.evaluate("@\"2022-04-10T13:15:20\" + @\"P1M\"");
            expect(result).toEqual("2022-05-10T13:15:20");
        });
        it("should evaluate @\"2022-04-10\" + @\"P2D1M\" -> \"2022-05-12\"", () => {
            let result = interpreter.evaluate("@\"2022-04-10\" + @\"P2D1M\"");
            expect(result).toEqual("2022-05-12");
        });
        it("should evaluate @\"2022-04-10T13:15:20\" + @\"PT30M\" -> \"2022-04-10T13:45:20\"", () => {
            let result = interpreter.evaluate("@\"2022-04-10T13:15:20\" + @\"PT30M\"");
            expect(result).toEqual("2022-04-10T13:45:20");
        });
        it("should evaluate @\"PT30M\" + @\"2022-04-10T13:15:20\" -> \"2022-04-10T13:45:20\"", () => {
            let result = interpreter.evaluate("@\"PT30M\" + @\"2022-04-10T13:15:20\"");
            expect(result).toEqual("2022-04-10T13:45:20");
        });
        it("should evaluate @\"P7M2Y\" + @\"P5D\" -> \"P5D7M2Y\"", () => {
            let result = interpreter.evaluate("@\"P7M2Y\" + @\"P5D\"");
            expect(result).toEqual("P5D7M2Y");
        });
        it("should evaluate @\"P7M2Y\" - @\"P5M\" -> \"P2M2Y\"", () => {
            let result = interpreter.evaluate("@\"P7M2Y\" - @\"P5M\"");
            expect(result).toEqual("P2M2Y");
        });
        it("should evaluate @\"P7M2Y\" - @\"P5D\" -> \"P7M2Y\"", () => {
            let result = interpreter.evaluate("@\"P7M2Y\" - @\"P5D\"");
            expect(result).toEqual("P7M2Y");
        });
    });

});
