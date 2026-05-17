---
---

### 1. `$this->` (Object Instance)
**Context:** Used inside a class to refer to a specific "row" or "instance" of that class.
**Naming Convention:** CamelCase for classes (`Location`), snake_case for properties matching DB columns (`region_name`).

```php
// Inside the Location Controller
public function updateAction($id) {
    $location = Location::findFirstById($id); // Get one specific location
    
    // We use $this to set data on THIS specific object
    $location->region_name = "New York"; 
    $location->save(); 
}
```
**Analogy:** If `Location` is a blueprint for a house, `$this` refers to the specific house you are standing in right now.

---

### 2. `self::` (Current Class)
**Context:** Used to access static properties or constants defined within that exact class. It ignores inheritance.
**Naming Convention:** UPPERCASE for constants (`STATUS_ACTIVE`).

```php
class Location extends \Phalcon\Mvc\Model {
    const STATUS_ACTIVE = 1;

    public function checkStatus() {
        // Always looks at Location::STATUS_ACTIVE
        return self::STATUS_ACTIVE; 
    }
}
```

---

### 3. `static::` (Called Class / Late Static Binding)
**Context:** This is the "smarter" version of `self::`. It waits to see which class actually called the method.
**Why it matters in MVC:** If you have a `BaseModel` that many other models inherit from, `static::` ensures you get the child class's info, not the parent's.

```php
class BaseModel extends \Phalcon\Mvc\Model {
    public static function getTableName() {
        return static::class; // Returns the name of the child class that called it
    }
}

class AgeVerificationLocation extends BaseModel {
    // Inherits getTableName()
}

// Calling AgeVerificationLocation::getTableName() returns "AgeVerificationLocation"
// because 'static' looks at the caller, not the owner of the code.
```

---

### 4. `parent::` (Parent Class)
**Context:** Used when you want to run the original logic from the class you extended, usually before adding your own custom logic.
**Naming Convention:** Commonly used in `initialize()` or `beforeSave()` methods.

```php
class AgeVerificationLocation extends \Phalcon\Mvc\Model {
    public function initialize() {
        // Run the setup logic defined in Phalcon's built-in Model class first
        parent::initialize(); 
        
        // Then add our specific table name
        $this->setSource('age_verification_locations');
    }
}
```

---

### 5. `ClassName::` (External Static)
**Context:** Used when you are outside the class (like in a Controller) and need to trigger a method without creating a "new" object first.
**Usage:** Most common for "Finders" (searching the DB).

```php
// Inside a Controller
public function getAction($id) {
    // We don't have a location object yet, so we call the class directly
    // to search the database and RETURN an object.
    $location = AgeVerificationLocation::findFirst($id);
}
```

---

### Summary Comparison Table

| Call | Where are you? | What are you calling? | Common MVC Use Case |
| :--- | :--- | :--- | :--- |
| **`$this->`** | Inside the class | An instance property/method | Setting a column value (e.g., `$this->name = 'X'`) |
| **`self::`** | Inside the class | A constant or static method | Checking a fixed status code (`self::ACTIVE`) |
| **`static::`** | Inside a Parent class | A child's version of a method | Creating generic methods in a `BaseModel` |
| **`parent::`** | Inside a Child class | The Parent's original method | Extending `initialize()` or `onConstruct()` |
| **`User::`** | Outside the class | A static "Finder" method | Querying the DB: `User::findFirst()` |
