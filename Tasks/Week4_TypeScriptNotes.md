---
---

---

# 📘 TypeScript – Comprehensive Notes (Comment-Driven & Intuition-First)

These notes are written so that **future me can revise quickly** and still remember *why* TypeScript behaves the way it does.

---

## 🔹 What is TypeScript?

TypeScript:
- Supports **all JavaScript features**
- Adds **extra language-level features**:
  - Generics
  - Interfaces
  - Tuples
  - Enums
  - Union / Intersection types
- Uses a **strict typing system**
- JavaScript uses **dynamic typing**

👉 TypeScript = **JavaScript + Safety + Scalability**

---

## 🔹 Type System Basics

### Built-in Types

```ts
Number
String
Boolean

Null
Undefined
Void

Object
Array
Tuple

Any
Never
Unknown

---

### `number`

```ts
let x: number = 10;
```

* Covers **int, float, decimal**
* JS does not distinguish numeric types → TS keeps it simple
* Everything numeric = `number`

---

## 🔹 Type Inference (VERY IMPORTANT)

```ts
let user: number = 900;
```

⬇️ Can be simplified to:

```ts
let user = 900;
```

✔️ TS **infers** the type automatically

---

### When Explicit Typing is REQUIRED

```ts
let user: number;
```

Here:

* No value assigned
* TS **cannot infer**
* So you MUST specify the type

---

### ❌ Dangerous Case: Implicit `any`

```ts
let user; // inferred as any

function hero() {
    return "thor";
}

user = hero();
```

Why this happens:

* `user` has **no type**
* TS assigns `any`
* `any` disables type checking

👉 **This defeats the purpose of TypeScript**

Rule:

> If TS ever silently assigns `any`, you should feel uncomfortable.

---

## 🔹 Functions & Return Types

### Explicit Function Return Type

```ts
function addGood(num: number): number {
    return num + 2;
}

addGood(5);
```

Why this is good:

* Input is enforced
* Output is guaranteed
* Compiler protects future changes

---

### Arrow Function with Return Type

```ts
const getHello = (s: string): string => {
    return "";
}
```

Why TS complains if no return:

```ts
// A function whose declared type is neither
// 'undefined', 'void', nor 'any' must return a value
```

👉 If you say it returns `string`, it **must return a string**.

---

### ❌ Bad Practice: `any` in Functions

```ts
function addTwo(num: any): any {
    return num + 2;
}
```

Why unacceptable:

* No guarantees
* Caller has no idea what comes back
* Bugs shift to runtime

Rule:

> `any` = “I give up type safety”

---

## 🔹 Returning Objects from Functions

```ts
function createCourse(): { name: string; isPaid: boolean } {
    return { name: "Parva", isPaid: true };
}
```

Why explicit object return type matters:

* Prevents missing keys
* Prevents wrong value types
* Acts like a **mini contract**

---

## 🔹 Object Parameters & a BIG GOTCHA

```ts
// ❌ WRONG
function createUser({ name: string, payment: number }) {}
```

Why this is wrong:
JS interprets this as:

* Extract `name` → rename to variable `string`
* Extract `payment` → rename to variable `number`

It is **NOT typing**.

---

### ✅ Inline Typing Fix

```ts
function createUser(
  { name, payment }: { name: string; payment: number }
) {}
```

Now:

* `name` is string
* `payment` is number
* Correct destructuring + typing

---

## 🔹 Interfaces (Object Shape Contracts)

```ts
interface user {
    name: string;
    payment: number;
}
```

Purpose:

* Defines **minimum required structure**
* Used heavily in APIs, React props, Redux state

---

### Function Using Interface

```ts
function createUser({ name, payment }: user) {}
```

---

### Structural Typing (Important Concept)

```ts
let newUser = { name: "Parva", payment: 100 };
let addUser = { name: "Parva", payment: 100, email: "p@p.com" };

createUser(newUser);
createUser(addUser); // ✅ accepted
```

Why TS allows this:

* TS checks **shape**, not exact match
* Extra properties are allowed
* Minimum contract satisfied

Mental model:

> “If it has what I need, I don’t care if it has more.”

---

## 🔹 Type Aliases (`type`)

```ts
type User = {
    readonly _id: number;
    name: string;
    age: number;
    email: string;
    isActive: boolean;
}
```

Why use `readonly`:

* Prevents accidental mutation
* Useful for DB IDs, UUIDs

---

### Function Using Type

```ts
function userAdder(newUser: User): User {
    return {
        _id: 9,
        name: "",
        age: 1,
        email: "",
        isActive: false
    };
}
```

---

### Compile-Time Safety Examples

```ts
// ❌ Missing argument
userAdder();
// Expected 1 arguments

// ❌ Missing properties
userAdder({});
```

---

### Readonly Enforcement

```ts
let myGuy: User = {
    _id: 4,
    name: "",
    age: 1,
    email: "",
    isActive: false
};

// myGuy._id = 12 ❌ not allowed
```

---

## 🔹 Intersection Types (`&`)

Used to **merge multiple types into one**

```ts
type cardNumber = {
    cardNum: number;
}

type cardDate = {
    date: string;
}

type cardDetails = cardNumber & cardDate & {
    cvv: number;
}
```

Mental model:

> Intersection = “AND all these together”

---

## 🔹 Arrays in TypeScript

```ts
const superHero = []; 
// inferred as any[]
```

Better:

```ts
const superHero: string[] = [];
```

---

### Generic Array Syntax (Cleaner)

```ts
const answers: Array<string> = [];
```

Why preferred:

* Explicit
* Works well with generics
* Common in TS-heavy codebases

---

## 🔹 Union Types (`|`)

Used when value can be **one of multiple types** (but not anything).

```ts
let score: string | number = 44;
score = "55";
score = 100;
```

Why union > any:

* Controlled flexibility
* Compiler still protects you

---

### Union with Objects

```ts
type UserPart = {
    name: string;
    id: number;
}

type admin = {
    username: string;
    id: number;
}
```

```ts
let Parva: UserPart | admin = {
    name: "Parva",
    id: 1234,
}

Parva = { username: "PL", id: 345 };
```

---

## 🔹 Type Narrowing (CRUCIAL)

```ts
function getValue(
  myVal: number,
  id: number | string
): boolean | string {

  if (typeof id === "string") {
    id.includes("start"); // string methods available
    return false;
  }

  if (typeof id === "number") {
    id.toString(); // number methods available
    return true;
  }

  if (myVal > 5) return true;
  return "200 OK";
}
```

Key idea:

> `typeof` narrows the union inside that block

---

## 🔹 Tuples

Used when:

* Order matters
* Length is fixed

```ts
let rgb: [number, number, number] = [255, 255, 255];
```

```ts
rgb = [255, 255, 255, 123]; // ❌ error
```

⚠️ Runtime caveat:

```ts
rgb.push(123); // allowed at runtime, bad logically
```

---

## 🔹 Enums

```ts
enum SeatChoice {
    AISLE = 10,
    MIDDLE,
    WINDOW,
}
```

Behavior:

* `AISLE = 10`
* `MIDDLE = 11`
* `WINDOW = 12`

Usage:

```ts
const hcSeat = SeatChoice.AISLE;
```

Why enums:

* Self-documenting
* Prevent magic numbers
* Easy future changes

---

## 🔹 Interfaces with Methods

```ts
interface spUser {
    readonly _id: number;
    name: string;
    email: string;
    googleId?: number;
    startTrialFunc(): string;
    getCoupon(couponName: string, disc: number): number;
}
```

---

### Implementing Interface

```ts
const parva: spUser = {
    _id: 22,
    name: "Parva",
    email: "p@p.com",
    gitId: "",
    startTrialFunc: () => "Trial Started",
    getCoupon: () => 2
}
```

If function signature mismatches:

* TS throws error
* Even parameter type mismatch is caught

---

## 🔹 Interface Reopening (POWER FEATURE)

```ts
interface spUser {
    gitId: string;
}
```

What happens:

* Interface gets **extended**
* Old declarations remain
* New property becomes mandatory

---

## 🔹 Interface Extension

```ts
interface administrator extends spUser {
    role: "ta" | "da" | "learner";
}
```

```ts
const ishan: administrator = {
    _id: 22,
    name: "Parva",
    email: "p@p.com",
    gitId: "",
    startTrialFunc: () => "Trial Started",
    getCoupon: () => 2,
    role: "da"
};
```

---

## 🔹 Type vs Interface (Rule of Thumb)

| Feature       | Interface | Type |
| ------------- | --------- | ---- |
| Reopen        | ✅ Yes     | ❌ No |
| Extend        | `extends` | `&`  |
| Object Shapes | ✅ Best    | ⚠️   |
| Union Support | ❌         | ✅    |

---

## 🔹 Golden Rules (Future Reference)

* ❌ Avoid `any`
* ✅ Prefer `unknown` if unsure
* ✅ Use interfaces for objects
* ✅ Use unions for flexibility
* ✅ Narrow types before usage
* 🔒 Use `readonly` aggressively
* ⚙️ Enable `"strict": true` in `tsconfig.json`

---

🧠 **TypeScript is not about writing more code —
it’s about writing code you don’t have to fear later.**

```

---

If you want next, I strongly recommend:
- **Generics (mental model + real React examples)**
- **TypeScript with React props & hooks**
- **Common TS compiler errors decoded**
- **`unknown` vs `any` vs `never` (deep dive)**

Just tell me what to add next 🚀
```

```ts
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

```