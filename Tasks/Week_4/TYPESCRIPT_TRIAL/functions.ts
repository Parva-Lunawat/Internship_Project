// function addTwo(num: any): any
// function addTwo(num) { 
//     return num + 2;
// }

// addTwo(2);
// This is unacceptable; induces type issues

// function addGood(num: number): number
// Clear cut understanding
function addGood(num: number) {
return num + 2;
}
addGood(5);


const getHello = (s: string): string => {
// A function whose declared type is neither 'undefined', 'void', nor 'any' must return a value.ts(2355)
// if no return then this error
return "";
}

// if you want fixed OBJECT returns out of a function
// function createCourse():{}{} 
function createCourse():{name:string, isPaid: boolean}{
return {name: "Parva", isPaid: true};
}

// When you write {name: string, payment: number}, JavaScript (and thus TypeScript) interprets this as:
// "Extract the property name and rename it to a local variable called string."
// "Extract the property payment and rename it to a local variable called number."

// Use Interface
interface user {
name: string;
payment: number;
}
// function createUser({name: string, payment: number}) {}

// inline correction method
// function createUser({ name, payment }: { name: string; payment: number }) {
//   // Now 'name' is a string and 'payment' is a number
// }
function createUser({name, payment}: user) {}

let newUser = {name: "Parva", payment: 100};
let addUser = {name: "Parva", payment: 100, email: "p@p.com"};

createUser(newUser);
createUser(addUser); // weird part! accepting 3 things !!!

// another method
// custom type maker method
type User = {
    readonly _id: number;
    name: string;
    age: number;
    email: string;
    isActive: boolean;
}

function userAdder(newUser: User): User {
    return {_id: 9, name: "", age: 1, email: "", isActive: false};
}

// userAdder() 
// Expected 1 arguments, but got 0.ts(2554)
// functions.ts(66, 20): An argument for 'newUser' was not provided.

// userAdder({})
// Argument of type '{}' is not assignable to parameter of type 'User'.
//   Type '{}' is missing the following properties from type 'User': name, age, email, isActivets(2345)

userAdder({_id: 4, name: "", age: 1, email: "", isActive: false});

let myGuy: User = {_id: 4, name: "", age: 1, email: "", isActive: false};
// myGuy._id = 12; // Cannot assign to '_id' because it is a read-only property.ts(2540)

type cardNumber = {
    cardNum: number; 
}
type cardDate = {
    date: string;
}

type cardDetails = cardNumber & cardDate & {
    cvv: number;
}

const superHero = []; // const superHero: any[] earlier it was never
superHero.push("Spiderman");

// const answers: string[] = [];
const answers: Array<string> = []; // better way
// answers.push(1); // Argument of type 'number' is not assignable to parameter of type 'string'. 

// union when not sure what will be the type but to avoid "Any"

let score: string | number = 44;
score = "55";
score = 100;

type UserPart = {
    name: string;
    id: number;
}

type admin = {
    username: string;
    id: number;
}

let Parva: UserPart | admin = {
    name: "Parva",
    id: 1234,
}
Parva = {username: "PL", id: 345};

// Usage of Union
function getValue(myVal: number, id: number | string): boolean | string {
    // if (id > 5) return false; // Operator '>' cannot be applied to types 'string | number' and 'number'.
    // id. // toLocaleString, valueOf, toString
    // but typeof narrows done var type scope 
    if (typeof id === "string") {
        id.includes("start"); // shows all string functions
        return false;
    } else if (typeof id === "number") {
        id.toString(); // shows all number functions
        return true;
    }
    if (myVal > 5) return true;
    return "200 OK";

}

const data: Array<number> = [1,2,3];
const data2: Array<string> = ["1","2","3"];
const data3: Array<string | number> = ["1", 2, "3"];

let rgb: [number, number, number] = [255, 255, 255, 123]; // Type '[number, number, number, number]' is not assignable to type '[number, number, number]'.
//   Source has 4 element(s) but target allows only 3.


// enum
// makes the code more dynamic, clean and reliable for future upgrades
enum SeatChoice {
    AISLE = 10,
    MIDDLE,
    WINDOW,
}

const hcSeat = SeatChoice.AISLE;
const mcSeat = SeatChoice.MIDDLE;
// if AISLE == 10 then now next options will be incremented by 1 as per options


// INTERFACE
// It acts like an organizer such that when such an object is init, it must require those details to be mentioned compulsorily
// loosely more like a class but very superficial level of class ir these are the data members and member functions
interface spUser {
    readonly _id: number,
    name: string,
    email: string,
    googleId?: number;
    // startTrialFunc: () => string,
    startTrialFunc(): string,
    getCoupon(couponName: string, disc: number): number
}

const parva: spUser = {_id: 22, name: "Parva", email: "p@p.com", gitId: "", startTrialFunc: () => {
    return "Trail Started";
}, getCoupon: (name: "wow") => {
    return 2;
}}
// No issue (disc param) if not declared in const parva but if declared and of wrong type then this error =>
// Type '(name: "wow", second: "2") => number' is not assignable to type '(couponName: string, disc: number) => number'.
//   Types of parameters 'second' and 'disc' are incompatible.
//     Type 'number' is not assignable to type '"2"'.

interface spUser {
    gitId: string,
} // reopeneing of interface
// this extends interface without overwriting it. Now previous declared now needs gitId to be declared

interface administrator extends spUser {
    role: "ta" | "da" | "learner"
}
// since extended all prev vals + new val addition for role from preset ones
const ishan: administrator = {_id: 22, name: "Parva", email: "p@p.com", gitId: "", startTrialFunc: () => {
    return "Trail Started";
}, getCoupon: (name: "wow") => {
    return 2;
}, role: "da"};

// type can't be reopenend but can be extended using "&"
