
//make budgetController module;
var budgetController = (function(){

    var Income = function (id, description, value){
        this.id             = id;
        this.description    = description;
        this.value          = value;
    }

    var Expense = function (id, description, value){
        this.id             = id;
        this.description    = description;
        this.value          = value;
        this.percentage     = -1;
    }

    Expense.prototype.calcPercentage = function(totalIncome){
        if (totalIncome>0){
            this.percentage = Math.round((this.value / totalIncome) * 100);
        }else {
            this.percentage = -1;
        }
    }

    Expense.prototype.getPercentage = function(){
        return this.percentage;
    }
    
    var calculateTotal = function(type){
        var sum = 0;
        data.allItems[type].forEach(function(cur){
            sum+=cur.value;
        })
        data.totals[type]= sum;
    }

    var data = {
        allItems : {
            inc: [],
            exp: []
        },

        totals: {
            inc: 0,
            exp: 0
        },
        budget: 0,
        percentage: 0
    };

    return {
        addItem : function(type, des, val){

            var newItem, ID;

            //create new ID;
            if (data.allItems[type].length > 0){
                ID = data.allItems[type][data.allItems[type].length-1].id+1;
            }else {
                ID = 0;
            }

            //create new item based on 'inc' or 'exp' type
            if (type === 'exp'){
                newItem = new Expense (ID, des, val);
            }else {
                newItem = new Income (ID, des, val);
            }

            //push it into our data structure;
            data.allItems[type].push(newItem);
            
            //return new item
            return newItem;
        },

        //make a delete item return function;
        deletItem: function(types, id){
            var ids, index;

            //restrict mapping if types are not inc or exp
            if (types.startsWith('inc') || types.startsWith('exp')){

                //use map function to make an array of all items inside inc or exp;
                ids = data.allItems[types].map(function(current){
                    return current.id;
                });
    
                // keep only the index number;
                index = ids.indexOf(id);
    
                //remove the index using splice when the index is not -1;
                if (index !== -1){
                    data.allItems[types].splice(index, 1);
                }
            }
            
            

        },

        calculateBudget: function(){
            //calculate total income and expense;
            calculateTotal('exp');
            calculateTotal('inc');

            //calculate the budget = income-expense;
            data.budget = data.totals.inc-data.totals.exp;

            //calculate the percentage
            if (data.totals.inc> 0){
                data.percentage = Math.round((data.totals.exp/data.totals.inc) * 100);
            }else{
                data.percentage = -1;
            }
            
        },

        getBudget: function(){
            return {
                //return an object of four elements to the controllerl; 
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
        },

        calculatePercentage: function(){
            data.allItems.exp.forEach(function(cur){
                cur.calcPercentage(data.totals.inc);
            })
        },

        getPercentage: function(){
            var allPerc = data.allItems.exp.map(function(cur){
                return cur.getPercentage();
            });
            return allPerc;
        },
        

        test: function(){
            console.log(data)
        }
    }

})();





//.......................................................................................................................................................
//........................................................................................................................................................





//make UIController module;
var UIController = (function(){
    
    var DomStrings = { // it is an object for dom strings 

        inputType :             '.add__type',
        inputDescription :      '.add__description',
        inputValue :            '.add__value',
        inputBtn :              '.add__btn',
        incomeContainer :       '.income__list',
        expenseContainer :      '.expenses__list',
        budgetLabel:            '.budget__value',
        expenseLabel:           '.budget__expenses--value',
        incomeLabel:            '.budget__income--value',
        percentageLabel:        '.budget__expenses--percentage',
        container:              '.container',
        expensesPercLabel:      '.item__percentage',
        dateLabel:              '.budget__title--month'
    }
    
    var formatNumber = function(num,type){
        var int, dec, numSplit;

        num = Math.abs(num);
        num = num.toFixed(2);
        numSplit = num.split('.');
        int = numSplit[0];
        dec = numSplit[1];

        if (int.length>3){
            int = int.substr(0, int.length-3) + ',' + int.substr(int.length-3, 3);
        }

        return (type === 'exp'? '-':'+') + int + '.' + dec;
    };

    var nodeListForeach = function(list, callback){
        for (var i= 0; i<list.length; i++){
            callback (list[i], i);
        }
    };

    return {
        getInput: function(){

            return {
                type:          document.querySelector(DomStrings.inputType).value, // inc or exp
                description:   document.querySelector(DomStrings.inputDescription).value,
                value :        parseInt(document.querySelector(DomStrings.inputValue).value)
            };

        }, //use comma 

        addListItem: function(obj,type){
            var html, newHTML, element;
            if (type === 'inc'){
                element = DomStrings.incomeContainer;

                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div> </div> </div>';
            }else if(type === 'exp'){
                element = DomStrings.expenseContainer;

                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }

            newHTML = html.replace('%id%', obj.id);
            newHTML = newHTML.replace('%description%', obj.description);
            newHTML = newHTML.replace('%value%', formatNumber (obj.value, type));

            document.querySelector(element).insertAdjacentHTML('beforeend', newHTML);

        },

        deleteListItem: function(selectorID){
            
            ////restrict dom manipulation if types are not inc or exp
            if (selectorID.startsWith('inc') || selectorID.startsWith('exp')){
                var el = document.getElementById(selectorID);

                //use removechild method to remove the child of the parent element
                el.parentNode.removeChild(el);
            }

        },

        clearFields: function(){
            var fields, fieldArr;
            fields = document.querySelectorAll(DomStrings.inputDescription + ', ' + DomStrings.inputValue);
            fieldArr = Array.from(fields); //change the list to array

            //clear the array
            fieldArr.forEach(function(current, index, array){
                current.value="";
            })
        },

        displayBudget: function(obj){
            var type;

            obj.budget>0? type = 'inc':'exp';

            //display the four data to the UI
            document.querySelector(DomStrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DomStrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DomStrings.expenseLabel).textContent = formatNumber(obj.totalExp, 'exp');

            //add perxent sign and also do not add percent befor income added;
            if (obj.percentage > 0){
                document.querySelector(DomStrings.percentageLabel).textContent = obj.percentage + '%';
            }else{
                document.querySelector(DomStrings.percentageLabel).textContent = '---';
            };
            
        },

        displayPercentage: function(percentages){
            var fields = document.querySelectorAll(DomStrings.expensesPercLabel);



            nodeListForeach (fields, function(current, index){

                if (percentages[index]>0){
                    current.textContent = percentages[index] + '%';
                } else{
                    current.textContent = '---';
                }
                
            })
        },

        displayMonths: function(){
            var now, month, monthNames, year;

            now = new Date();
            monthNames = ["January","February","March","April","May","June","July",
                            "August","September","October","November","December"];
            month = now.getMonth();
            year = now.getFullYear();

            document.querySelector(DomStrings.dateLabel).textContent = monthNames[month] + ' ' + year;
        },

        changeType : function(){
            var fields = document.querySelectorAll(
                    DomStrings.inputType + ',' +
                    DomStrings.inputDescription + ',' + 
                    DomStrings.inputValue
            );
            
            nodeListForeach (fields, function(cur){
                cur.classList.toggle('red-focus')
            })

            document.querySelector(DomStrings.inputBtn).classList.toggle('red');
        },


        getDomstrings : function (){
            return DomStrings;
        } //dont use the semicolon here



    };

})();

//...............................................................................................................................................
// ...............................................................................................................................................




//make controller mdouel
var controller = (function(budgetCntrl, UICntrl){

    var setupEventListener = function(){

        var Dom = UICntrl.getDomstrings();
        document.querySelector(Dom.inputBtn).addEventListener('click', cntrlAddItem);   
        document.addEventListener('keypress', function(event){
            if (event.keypress === 13 || event.which === 13){
                cntrlAddItem();
            }
        });

        document.querySelector(Dom.container).addEventListener('click', cntrlDeleteItems);

        document.querySelector(Dom.inputType).addEventListener('change', UICntrl.changeType);
    }

    var updateBudget = function (){
        
        // 1. calculate the budget;
        budgetCntrl.calculateBudget();

        // 2. return the budget
        var budget = budgetCntrl.getBudget();

        // 3. display the budget on the ui;
        UICntrl.displayBudget(budget);
    };

    var updatePercentage = function(){

        // 1.calculate percentage;
        budgetCntrl.calculatePercentage();

        // 2.read percentage from the budger controller;
        var percentages = budgetCntrl.getPercentage();

        
        // 3. Update the UI with the new percentage
        UICntrl.displayPercentage(percentages);
    }


    var cntrlAddItem = function (){

        var newItem, input;
        // 1. get the field input data;
        input = UICntrl.getInput();

        if (input.description !=="" && !isNaN(input.value) && input.value > 0){

            // 2. add the item to the budget controller;
            newItem = budgetCntrl.addItem(input.type, input.description, input.value);

            // 3. add the item to the UI;
            UICntrl.addListItem(newItem, input.type);
    
            // 4. Clear the form;
            UICntrl.clearFields(); 
            
            //calculate and update budget
            updateBudget();

            //update percentages'
            updatePercentage();
        }
       
    };

    var cntrlDeleteItems = function(event){
        var itemID = 'test', splitID, types = 'test', ID;

        //it is a method called event delegation where we can return parent element in html depending on any child;
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        //split the td and convert it into float
        if (itemID){
            splitID = itemID.split('-');
            types = splitID[0];
            ID = parseInt(splitID[1]);
        };

        

        //delete the items from the data structure;
        budgetCntrl.deletItem(types, ID);

        //delete items from the UI
        UICntrl.deleteListItem(itemID);

        //update the budget
        updateBudget();

    }

    return {
        init : function(){
            console.log('Application has started');
            setupEventListener();
            UICntrl.displayMonths();
            UICntrl.displayBudget({
                //initially all values are 0;
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: 0
            });
        }
    }

})(budgetController,UIController);

controller.init();
