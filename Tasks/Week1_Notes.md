---
---

JavaScript How to: -

Case Sensitive Lang
Display Methods: -
    console.log() debug helper & everything
    update DOM via innerText / textContent / innerHTML
        innerHTML: Change internal innerHTML
        innerText: Change inner text ONLY 
    document.write() is basically “don’t use in real apps”: rewrites curr page html
    alert() is only for quick demos

JavaScript Values
    Variables: 
    Literals: fixed int dec normal; string etc in "" or ''

Keywords: def actions to be performed
    var	                    Declares a variable
    let	                    Declares a block variable
                                BOTH Block Scope + non-redeclarable + must be declared before use + no binding to 'this' + not hoisted
                                Unlike var -> Global scope + redeclarable in diff scopes + hoisted
    const	                Declares a block constant
    if	                    Marks a block of statements to be executed on a condition
    switch	                Marks a block of statements to be executed in different cases
    for	                    Marks a block of statements to be executed in a loop
    function	            Declares a function
    return	                Exits a function
    try	                    Implements error handling to a block of statements

&& (AND): Returns the first falsy operand or the last operand if all are truthy.
|| (OR): Returns the first truthy operand or the last operand if all are falsy.

Data Types: Num, bool, str, bigint, obj (dict essentially), null, symbol, undefined <= typeof -> idetify

// Infinite Args method:
    function sum(...args) {
    let sum = 0;
    for (let arg of args) sum += arg;
    return sum;
    }

    let x = sum(4, 9, 16, 25, 29, 100, 66, 77);

JavaScript arguments => pass by val: The func know the values, not the args locations. change != reflect ouside


NO HYPHENING only camel casing
