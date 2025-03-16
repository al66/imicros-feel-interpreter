
const tests = [
    {
        case: "Spring, 3 guests, with children",
        //analyse: true,
        data: {
                "Season": "Spring", 
                "Number of Guests": 3,
                "Guests with children?": true
              },
        result: {
            Beverages: [ 'Pinot Noir', 'Apple Juice' ]
        }
    },
    {
        case: "Fall, 3 guests, with children",
        data: {
                "Season": "Fall", 
                "Number of Guests": 3,
                "Guests with children?": true
              },
        result: {
            Beverages: [ "Aecht Schlenkerla Rauchbier", 'Apple Juice' ]
        }
    }
];

module.exports = {
    tests
};