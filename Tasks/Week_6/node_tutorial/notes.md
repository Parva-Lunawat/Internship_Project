NodeJS Notes

Browser <--> API Layer <--> Backend <--> DB

src -> 
    index -> DB Connection
    app -> config cookie url encoding
    constants -> enums db names etc
db -> actual db connection code
models -> data models, schemas
controllers -> methods/functionality (this is MVC)
routes -> routing complete routing logic what controller to call when which route etc
middlewares ->
utils -> extra utilities of code like emailing models etc

get -> browser to server
post -> server -> browser

