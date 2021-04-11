import uniqid from 'uniqid';

export const budgetController = (() => {

    class Elements {
        constructor(id, description, value) {
            this.id = id;
            this.description = description;
            this.value = value;
        }
    }

    class Income extends Elements {
        constructor (id, description, value) {
            super(id, description, value);
        }
    }
    
    class Expenses extends Elements {
        constructor (id, description, value) {
            super(id, description, value);
            this.percentage = -1;
        }
    }

    
    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            inc: 0.00,
            exp: 0.00
        },
        availableBudget: 0.00,
        percentage: -1
    }
    
    const calculateTotals = (type) => {
        var sum_of_total = 0;

        data.allItems[type].forEach(item => sum_of_total += item.value);
        data.totals[type] = sum_of_total;
    }

    window.data = data;
    return {
        addNewItem: (type, description, value) => {
            const ID = uniqid();
            var newItem;

            if (type === 'inc') newItem = new Income(ID, description, value);
            else newItem = new Expenses(ID, description, value);

            data.allItems[type].push(newItem);
            return newItem;
        },

        calculateBudget: () => {
            calculateTotals('inc');
            calculateTotals('exp');

            data.availableBudget = data.totals.inc - data.totals.exp;
            if (data.totals.inc > 0)
                data.percentage = parseFloat(((data.totals.exp / data.totals.inc) * 100).toFixed(2));
            budgetController.printData();
        },

        getBudget: () => {
            return {
                total_inc           : data.totals.inc,
                total_exp           : data.totals.exp,
                available_budget    : data.availableBudget,
                used_inc_percentage : data.percentage
            }
        },


        printData: () => {
            console.log(data);
        },

        getData: () => {
            return data;
        }
    }
})();