---
---

Phalcon Architecture
- Model-View-Controller pattern design: -
    - MOdel: DB related actions, fields and other functions
    - View: Guides the frontennd tech/UI + Routes guider
    - Controller: Business logic of the entire application

Controller: -
- This all in "controller" folder 
```php
<?php
// extending base controller abilities: Here PollController (Child) <- Controller (Parent)
class PollController extends \Phalcon\Mvc\Controller {
    // business logic here
    public function indexAction() {
        $this->view->polls = Polls::find();
    }
    public function showActions() {
        $this->view->poll = Polls::findFirstById($pollId)
        $this->view->options = PollOptions::findByPolls($pollId);
    }
    public function voteAction($optionId) {
        $option = PollsOption::findFirstById($optionId);
        $option->number_votes++;
        $option->save();

        return this->dispatcher->forward(array(
            'action' => 'show',
            'params' => array($option->polls_id),
        ));
    }
    public function submitOption($pollId) {
        if ($this->request->isPost()) {
            $option = new PollsOptions();
            $option->polls_id = $pollsId;
            $option->name = $this->request->getPost('name');
            $option->number_votes = 0;
            $option->save();
        }
        return this->dispatcher->forward(array(
            'action' => 'show',
            'params' => array($pollsId),
        ));
    }
}

?>
```

View: -
- This all in "View" folder
- for separate route views create folder struct like in NextJS and a index.volt (like page.tsx)
- views/polls/index.volt ~> website path is http://localhost/{folder_name}/poll/
```php
<?php
<h1>Polls</h1>
<ul>
{% for poll in polls %}
    <li>{{ link_to('poll/show/' ~poll.id, poll.question) }}</li> 
    // on Click leads to http://localhost/{folder_name}/poll/show/{id}
{% endfor %}
</ul>
?>
```

Cron Job Formatting: -
- (* * * * *) ==>
- 1st * => Minute (0–59)
- 2nd * => Hour (0–23)
- 3rd * => Day of month (1–31)
- 4th * => Month (1–12)
- 5th * => Day of week (0–7) (0 or 7 = Sunday)

Special Symbols
- ( * ) => any value
- ( */5 ) => every 5 units
- ( , ) => multiple values (e.g., 1,15)
- ( - ) => range (e.g., 1-5)

Examples => 
- 0 9 * * 0 /some/thing => runs at 9am evry sunday
- 15 16 * * 0 or 15 16 * * 7 or 15 16 * * SUN: run something 16:15 i.e. 4:15pm every sunday
- 45 15 * * 1,4-6 /something: job running 3:45pm on mon and thurs to sun

Notes =>
- 0 & 7 both are sundays
- 1 -> monday 6->sat
- 24 hour clock used

## ACL in Phalcon
ACL = Access Control List
It controls: Who can access what resource.
Used for:
- Role-based permissions
- Admin/User separation

// our codebase: index -> service -> cnofig hence loading easy

```php
// creation of acl how?
use Phalcon\Acl\Adapter\Memory as AclList;
use Phalcon\Acl\Component;
use Phalcon\Acl\Enum as Acl;
use Phalcon\Acl\Role;

$acl = new AclList();
$acl->setDefaultAction(Acl::DENY);
// roles registration here
// ARO Access request Object
$roles = array(
    'users' => new Role('Users');
    'admin' => new Role('SuperAdmin');
);

//Add roles
foreach ($roles as $role) {
    $acl->addRole($role);
}

// define resource list
$resourceArray = [
    CUSTOMER_ACCESS,
    MODEL_ACCESS,
];

//add all resources to acl
// ACO Access Control Objects
foreach ($resourceArray as $value) {
    foreach ($value as $resource => $actions) {
        $acl->addComponent(new Component($resource), $actions);
    }
}

//Grant access to public areas to both users and guests
// if specific resource grants remove 1st loop
foreach ($roles as $role) { 
    foreach ($publicResources as $resource => $actions) {
        foreach ($actions as $action) {
            $acl->allow($role->getName(), $resource, $action);
        }
    }
}

return $this->persistent->acl;
```

```php
// this is pure desigation of acl
define(                                         // definition of access start
    'CUSTOMER_ACCESS',                          // for whom is this list designed
    array(                                      // array of access start
        'secret' => array('index'),         
        'auth' => array(                        // auth -> controller & 
            'logout',                           // logout is action/method (in controller written as logoutAction)
            'getLoggedInDeviceList'             // array -> so as to import multiple action/methods to access perm list
        ),
        'two_fa' => array('change2FaStatus'),
        'users' => array(
            'deactivate',
            'profileUpdate',
            'updateGenderPreference',
            'passwordUpdate',
            'disableModel',
        )
    )
)
```

Dependency Injection: -
- Example structure:
    - Application needs Foo
    - Foo needs Bar
    - Bar needs Bim
- Before DI: -
    - Flow thereafter 
        - Application => creates Foo
        - Foo => creates Bar
        - Bar => creates Bim
    - Each class has this structure
        ```php
        class Bar {
            private $bim;
            public function __construct() {
                $this->bim = new Bim();   // Bar creates Bim
            }
        }
        ```
        - So each class creates required depd and controls them
        - I.e. niche jake realise hota hai ke yeh bhi chahiye
- After DI
    - Flow
        - Application creates Bim
        - Application creates Bar and gives Bim to it
        - Application creates Foo and gives Bar to it
        - Application calls Foo
    - Each class structure is like this now
        ```php
        class Bar {
            private $bim;
            public function __construct(Bim $bim) {
                $this->bim = $bim;   // Injected
            }
        }
        '''
        - So each class just uses the depd created by the main application
        - I.e. upar hi realise ho gaya kya kya chahiye hence bana diya and ye single instance sabko share kar diya
- This is also called *Inversion of Control*
- Benefits:
    - Loosely coupled code
    - Easier testing
    - Better maintainability
    - Centralized configuration

SQL Injection: -
- SQL Injection happens when user input is directly injected into SQL queries.
- `$sql = "SELECT * FROM users WHERE id = " . $_GET['id'];`
- Issue: -
    - if user did id = 1 OR 1=1 then
    - Query: SELECT * FROM users WHERE id = 1 OR 1=1;
    - Result: All users returned

Query Builder in PHP: -
- PDO === PHP Data Objects; a database access layer that provides a consistent, object-oriented interface for communicating with various database
- Yes, user-input data in PHP—specifically from $_GET, $_POST, $_REQUEST, or $_COOKIE—is received as a string by default. Because HTTP protocols send data as text, PHP interprets all incoming form data as string literals, even if they contain numbers, unless explicitly cast to another type by the developer. 
    - Behavior: $_POST['age'] will be the string "25", not the integer 25.
    - Type Casting: You can use (int)$_POST['age'] or intval($_POST['age']) to convert it.
    - Refer Markdown 5a for this