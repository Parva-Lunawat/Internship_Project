// function addTwo(num: any): any
function addTwo(num) {
    return num + 2;
}
addTwo(2);
// This is unacceptable; induces type issues
// function addGood(num: number): number
// Clear cut understanding
function addGood(num) {
    return num + 2;
}
addGood(5);

export {}
