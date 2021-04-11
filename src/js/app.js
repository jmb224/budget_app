import uniqid from 'uniqid';
// import * as budgetController from './models/BudgetController';

const budgetController = (() => {

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

        calcPercentage(total_income) {
            if (total_income > 0)
                this.percentage = parseFloat(((this.value / total_income * 100)).toFixed(2));
        }

        getPercentage () {
            return this.percentage;
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
        
        calcPercentages: () => data.allItems.exp.forEach(item => item.calcPercentage(data.totals.inc)),

        getPercentages: () => {
            const all_percentages = data.allItems.exp.map(item => {
                return item.getPercentage();
            });

            return all_percentages;
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
            // console.log(data);
        },

        getData: () => {
            return data;
        }
    }
})();

window.budgetCtrl = budgetController;

const UIController = (() => {

    const DOMStrings = {
        input_name          : 'choice',
        add_btn             : ".btn__add",
        total_income        : '#total-inc',
        total_expenses      : '#total-exp',
        input_description   : '.input__text',
        available_budget    : '.budget__value',
        input_value         : '.input__value--number',
        consumed_percentage : '.budget__box--percentage', 
        inc_container       : '.description-income__list',
        exp_container       : '.description-expense__list',
        item_percentage     : '.description-item__percentage'
    }
    
    const addEditButton = () => {
        return `<button class="btn btn__edit-item">
                    <svg class="description-item__edit-btn">
                        <use xlink:href="img/sprite.svg#icon-edit"></use>
                    </svg>
                </button>`;

    }

    const addDeleteBtn = () => {
        return `<button class="btn btn__delete-item--inc">
                    <svg class="description-item__delete-btn">
                        <use xlink:href="img/sprite.svg#icon-trash"></use>
                    </svg>
                </button>`;
    }
    
    const nodeListForEach = (percentages_list, callback) => {
        for (var i = 0; i < percentages_list.length; i++) {
           callback(percentages_list[i], i);
        }
    }

    const getInputType = () => document.querySelector(`input[name=${DOMStrings.input_name}]:checked`).value
    
    return {
        getUserInput: () => {
            return {
                type        : getInputType(),
                description : document.querySelector(DOMStrings.input_description).value,
                value       : parseFloat(document.querySelector(DOMStrings.input_value).value)
            }
        },


        addNewListItem: (type, obj) => {
            var html, container;

            if (type === 'inc') {
                container = DOMStrings.inc_container;
                html = `
                    <li class="description-item description-item--inc" id="inc-${obj.id}">
                        ${addEditButton()}
                        <span class="description-item__name">${obj.description}</span>
                        <div class="description-item__price description-item__price--inc">
                            <span class="description-item__value">+${obj.value} &euro;</span>
                            ${addDeleteBtn()}
                        </div>
                    </li>
                `;
            }
            else {
                container = DOMStrings.exp_container;
                html = `
                    <li class="description-item description-item--exp" id="exp-%id">
                        ${addEditButton()}
                        <span class="description-item__name">${obj.description}</span>
                        <div class="description-item__price description-item__price--exp">
                            <span class="description-item__value">-${obj.value} &euro;</span>
                            <span class="description-item__percentage"></span>
                            ${addDeleteBtn()}
                        </div>
                    </li>
                `;
            }

            document.querySelector(container).insertAdjacentHTML('beforeend', html);
            console.log('Add element to the UI');
        },
        
        
        displayBudget: (obj) => {
            document.querySelector(DOMStrings.available_budget).textContent = obj.available_budget.toFixed(2);
            document.querySelector(DOMStrings.total_income).textContent = `+${obj.total_inc.toFixed(2)}`;
            if (obj.total_exp === 0)
            document.querySelector(DOMStrings.total_expenses).textContent = obj.total_exp.toFixed(2);
            else
            document.querySelector(DOMStrings.total_expenses).textContent = `-${obj.total_exp.toFixed(2)}`;
            if (obj.used_inc_percentage <= 0)
            document.querySelector(DOMStrings.consumed_percentage).textContent = '--';
            else
            document.querySelector(DOMStrings.consumed_percentage).textContent = `${obj.used_inc_percentage}%`;
        },
        
        displayPercentages: (percentages) => {
            var all_items_percentages = document.querySelectorAll(DOMStrings.item_percentage);
            // window.items = items;

            nodeListForEach (all_items_percentages, (current, index) => {
                if (percentages[index] > 0)
                   current.textContent = percentages[index] + "%";
                else
                   current.textContent = '--';
             });
        },

        changedType: function () {
            var fields = document.querySelectorAll(
                this.getInputType(), + ', ' +
                DOMStrings.inputDescript + ', ' +
                DOMStrings.input_value
            );
   
            nodeListForEach(fields, function (curr) {
                $(curr).toggleClass('red-focus');
            });
   
            $(DOMStrings.add_btn).toggleClass('red');
         },

        toggleBorderColor: (type) => {
            if (type === 'inc') {
                $(DOMStrings.input_description).toggleClass('inc-highlight-border');
            } else {
                $(DOMStrings.input_description).toggleClass('exp-highlight-border');
            }
        },
        
        clearInputFields: () => {
            const input_fields = document.querySelectorAll(`${DOMStrings.input_description}, ${DOMStrings.input_value}`);

            Array.from(input_fields).forEach((item) => item.value = '');
            input_fields[0].focus();
        },
        
        getDOMStrings: () => {return DOMStrings;}
    }
})();


const globalController = ((budgetCtrl, UICtrl) => {
    const setUpEventListener = () => {
        const DOM = UICtrl.getDOMStrings();
        const crtlAddBtn = document.querySelector(DOM.add_btn);

        crtlAddBtn.addEventListener('click', crtlAddItem);
        document.addEventListener('keypress', (e) => {
            if (e.keyCode === 13 || e.which === 13) crtlAddItem();
        });
        
        // document.querySelectorAll('.input__radio').forEach((radio_item) => toggleBorderColor(radio_item));
        // document.querySelector(UICtrl.getInputType()).addEventListener('change', UICtrl.changedType);
    }

    // const toggleBorderColor = (radio) => {
    //     radio.addEventListener('click', () => {
    //         if (radio.value === 'exp') {
    //             $('.btn__add').addClass('btn__add--red-border');
    //         } else {
    //             $('.btn__add').removeClass('btn__add--red-border');
    //             $('.input__text:focus').css('');
    //         }
    //     });
    // }

    const crtlAddItem = () => {
        // 1. Get the user input
        const input = UICtrl.getUserInput();
        var newItem; 

        // 2. Add item to the budget controller
        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
            newItem = budgetCtrl.addNewItem(input.type, input.description, input.value);
            console.log('Add new Item');

            // 3. Add item to the UI
            UICtrl.addNewListItem(input.type, newItem);

            // 4. Clear the inputs fields
            UICtrl.clearInputFields();

            // 5. Calculate and update the budget
            updateBudget();
            
            // 6. Calculate and update the percentages
            updatePercentages();
            
        }
    }

    const updateBudget = () => {
        // 1. Calculate the budget
        budgetCtrl.calculateBudget();

        // 2. Return the budget
        const budget = budgetCtrl.getBudget();

        // 3. Display the budget on the UI
        UICtrl.displayBudget(budget);
    }

    const updatePercentages = () => {
        budgetCtrl.calcPercentages();

        const all_percentg = budgetCtrl.getPercentages();

        UICtrl.displayPercentages(all_percentg);
    }

    return {
        init: () => {
            setUpEventListener();
            updateBudget();
            console.log("App is running smoothly");
        }
    }

})(budgetController, UIController);

globalController.init();