# Introducing NodeJS
- [Introducing NodeJS](#introducing-nodejs)
  - [Environment](#environment)
  - [Gentle introduction to Node applications](#gentle-introduction-to-node-applications)
    - [HelloWorld in Node](#helloworld-in-node)
    - [Functions in Node Applications](#functions-in-node-applications)
      - [resources](#resources)
    - [HelloWorld with NPM](#helloworld-with-npm)
    - [Asynchronous in Node](#asynchronous-in-node)
    - [Handle HTTP Request with Node](#handle-http-request-with-node)


This lab is only a very brief introduction of NodeJS and how to get started with it. You will run a few prepared Node applications, learn about some key aspects of the NodeJS programming language and the package system that Node applications use and you will implement a REST API using Node. 

## Environment

The Gitpod workspace comes preinstalled with the Node runtime. You can check which version is currently available by running the following command inn a new bash terminal:

`node -v`

on the commandline. This should run successfully and return the version label for the installed Node version.

Also run:

`npm -v`

on the commandline to verify whether *npm* is installed successully. This should return the version label for the installed version of *npm*. NPM is the Node Package Manager - the component that takes care of downloading and installing packages that provide modules with reusable functionality. Check the website [npmjs.com](https://www.npmjs.com/) to explore the wealth of the more than 1 Million packages available on NPM.

The resources for this part of the hands on workshop are available in VS Code in the directory *lab2-introducingNodeJS*. All folders and files the instructions below ask you to create are already available in the directory *lab2-introducingNodeJS/solutions*. Instead of creating all files as per the instructions, you can also use these prepared files to see the effect.


## Gentle introduction to Node applications

We will very quickly take a look at Node applications. If you have seen Node in action before, you skip this section and continue on to the next lab where you will work with NodeJS microservices and Apache Kafka.

Note: for a more thorough yet quite accessible introduction to Node you may want to check out [this tutorial](https://nodejs.dev/learn/introduction-to-nodejs).
    
### HelloWorld in Node

Create a folder called *hello-world* under folder *lab2-introducingNodeJS*. In this folder, create a file called *app.js*. Edit this file and add the following line of code:
```
console.log("Hello World!")
```
Save the file. On the command line, execute:
`node app.js`

This will run the Node runtime, load file app.js and interpret and execute its contents. You should see the string *Hello World* printed in the console. It may not be much yet, but it is your first Node application right there!

### Functions in Node Applications

You can define and call functions in Node. Additionally, you can store references to functions in variables and even pass these references in calls to other functions. You can instruct a function to call another function. 

All subsequent steps are already implemented in the file *hello-world-functions/solutions/app.js*. Either follow along using that file or create your own new file.

Let's first define a function
```
function print(message) {
    console.log(message)
}
```
and invoke it with this line:
```
print("Hello")
```
A function (reference) can be assigned to a variable. That function can be invoked through that variable. For example:
```
const otherPrint = function (message) {
    console.log(`Special type of printing: ${message}`)
}
```
Invoking this function can be done using:
```
otherPrint("Hello")
```

A second function can be created that takes a function reference as its input and invokes that function:
```
function execute (functionToCall, message) {
    functionToCall(message)
}
```

Using the following command, **print* and *otherPrint* can be invoked in an indirect way:
```
execute(print, "Hello")
execute(otherPrint, "Hello")
```

To really make things interesting, we can create a function reference together with state available to that function when it is executed and that is determined when the function reference is created. This is called a closure - the combination of the function to execute and the state to execute it with. This

Function *getPrintFunction* returns a reference to function (or a closure) that can subsequently be invoked. The closure is a function constructed inside another function and has access to all variables in the other scope (local variables as well as input parameters). When the closure is returned, the references inside the function to variables that existed outside of it are still valid. In this case, the value of input parameter *message* outside of the function that is returned is still available when the function reference that is returned to the caller is invoked. Multiple calls to getPrintFunction with different values for input parameter message result in multiple closures with each their own value for msg (taken from that input parameter) 

```
let printFunctionInstantiationCount = 0
function getPrintFunction(message) {
    let instanceSequence = ++printFunctionInstantiationCount // assign the current increased value to local variable to use in closure 
    return () => {
        console.log(`Printing from closure ${instanceSequence} the message ${message}`)
    }
}
```
Let's now use this closure generating function like this:
```
let pf1 = getPrintFunction("Hello")  // get hold of a closure - function plus state - that can be executed
let pf2 = getPrintFunction("World")  // a second closure,  based on the same function and with different state 

pf1() // execute the first closure
pf2() // execute the second closure
pf2() // execute closures as often as you want

execute(pf1) // the closure is a function reference that our function execute can invoke
``` 
#### resources
[Working With Closures in NodeJS](https://www.c-sharpcorner.com/UploadFile/f50501/working-with-closure-in-nodejs/)
[Introduction to Closures](https://learnnode.wordpress.com/2017/10/11/closure/)

### HelloWorld with NPM

On the machine and environment with the Node runtime, create a folder called *my-world-npm*. Navigate to this folder and run `npm init` to create a new application. Folder *solutions/hello-world-npm* contains the sample.

```
cd my-world-npm
npm init
```
Walk through the command line wizard. Feel free to either accept all default answers or provide your own values. When asked `Is this OK? (yes)` press enter. NPM will now create a package.json file based on your responses. Inspect the contents of this file.

Add a line with this content: `,    "start": "node index.js"` to the file, inside the `scripts` element and right under the line with the *test* script property. Save the file. 

Create a new file called *index.js* in this same directory. Add the line
```
console.log("Hello World!")
```
to this file. Now type `npm start` at the command line and press enter. We now leverage npm to take care of running the application. For this very simple application, you will not really see any difference yet: the code in *index.js* is executed.

### Asynchronous in Node
JavaScript is single threaded – no parallel threads can be started from your code. However: multiple actions can be in progress at the same time. Any action in Node that requires network or file system interaction is typically performed asynchronously: the command is started and handed to the Node background processes (that run parallel to the single foreground thread); the main thread continues with other work and when the background processes have completed the task, the results are returned to the invoker (when the main thread has an opening to attend to it).

The code discussed in this section can be found in file *solutions/hello-world-async/app.js*. Feel free to peruse that file or create your own.

The function *later* will print a message on the console output, but only do so after a specified period of time (in miliseconds) has passed:

```
function later(message, timeout) {
    setTimeout(() => {
        console.log(message)
    }, timeout)
}
```
Executing these lines will print three pieces of text. But in which order?
```
later("Hello", 2000)
later("World", 1000)
console.log("Goodbye!")
```
Here we see that when the timeout expires, the indicated function (closure) is executed.

Note: 
```
() => {
        console.log(message)
    }
```
defines an anonymous function that takes no input parameters and is equivalent to
```
function () {
  console.log(message)
}
```
where *message* is taken from the closure that includes the input parameter *message* from the outer function *later* that produced this inner function.  

This next piece of code will make an HTTP request that fetches a text document from URL [raw.githubusercontent.com/chrisbuttery/greeting/master/greetings.json](https://raw.githubusercontent.com/chrisbuttery/greeting/master/greetings.json) that contains a JSON-like array of greeting messages. The standard Node module *https* is enlisted to make this request - and so it is imported using the *require* statement.

Passed to *https.get* is a aonymous callback function - that Node will invoke once the asynchronous action of sending the HTTP request and receiving the response is complete. The callback function writes a randomly selected message from the retrieved set of greetings.

When this asynchronous action is put in motion, the main thread continues. With the call to *later*, the message *World* is scheduled for printing - when 1 ms has passed. And the final action in the main thread is the synchronous printing of *Hello*. When the main thread is done, two asynchronous actions will make their belated contributions.

```
const https = require('https')

https.get('https://raw.githubusercontent.com/chrisbuttery/greeting/master/greetings.json',
    function (res) {
        res.setEncoding('utf8');
        res.on('data', (chunk) => { // function to callback when body of http response is received
            let greetingsArray = JSON.parse(`{ "data" : ${chunk} }`).data
            let randomGreetingIndex = Math.floor(Math.random() * greetingsArray.length)
            console.log(greetingsArray[randomGreetingIndex])
        });
    })

later("World", 1)
console.log("Hello")
```
Run this code a few time to be greeted in a variety of ways.

Finally, let's look at the *async* and *await* keywords and the concept of *promises*. Create a function:
```
const slow = async function (name) { // async function returns a Promise, not yet a real value
    return ("Hello "+ name)
}
```
Note the *async* keyword that marks this function as an asynchronous function. Such as function returns a Promise - a reference to result that will be produced at some point, probably in the future. 

Function *main* calls function *slow* using the *await* keyword. This forces processing of the main thread to wait for the result from *slow* to be truly available - not just the Promise must be there, but it has to be resolved as well. The second call to *slow* does not have this *await* prepended to it. It does not wait for the real value, but settles for the Promise itself. Variable *message2* does not contain the string that function *slow* produces, but instead the Promise that is returned as a result of the *async* designation. The

In the last line of function *main* you see how we can retrieve the real value from a Promise, using *then( <function>)*. The anonymous function is called with the Promise's value when it becomes available.

```
async function main() {
  console.log("Start")
  let message = await slow("Joanne") // await forces a wait until the Promise can render the real value
  console.log("Slow Message: "+message)
  let message2 = slow("Johnny") // without await, the value of message2 is the (initially unresolved) Promise
  console.log("Slow Message: "+message2) // no proper message is available yet
  message2.then((msg) => {console.log("Slow Message after the Promise was resolved: "+msg)}) // .then is a way to force a wait for the promise to be resolved into a real value
}

main()
```
Note: you may wonder about the use of a separate function *main*. However, the keyword *await* cannot be used outside the scope of an async function.

You may also wonder why you would want to use Promise.then() instead of simply await. Well, with *await* the processing is stopped. However, with promises we can have multiple asynchronous functions executing in parallel, waiting for all their results to become available - or even the first result to become available. This

Rewrite *main* for example to:
```
async function main() {
    let p1 = slow("Mary")
    let p2 = slow("Edith")
    let p3 = slow("Tom")

    Promise.all([p1, p2, p3]).then(function (values) {
        for (const message of values) {
            console.log(message)
        }
    });
}
```
Here, three concurrent Promises are retrieved and we wait for all of them to produce their result instead of waiting for one of them in particular. Using [Promise.any](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/any) we can wait for the first promise to produce a value and continue.

### Handle HTTP Request with Node
We will make a Node application now that is a little bit more interesting than what we did before. This application will be capable of handling an HTTP request that passes in a query parameter; it will read the parameter and return an appropriate and friendly message.

On the machine and environment with the Node runtime, create a folder called *my-world-web*. Navigate to this folder and run `npm init` to create a new application.  Folder *solutions/hello-world-web* contains the sample.

```
cd my-world-web
npm init
```
Walk through the command line wizard. Feel free to either accept all default answers or provide your own values. When asked `Is this OK? (yes)` press enter. NPM will now create a package.json file based on your responses. Inspect the contents of this file.

Add a line with this content: `,    "start": "node index.js"` to the file, inside the `scripts` element and right under the line with the *test* script property. Save the file. 

Create a new file called *index.js* in this same directory. Add the following contents to the file:

```
const http = require('http')
const url = require('url')
const PORT = 3000

// create an HTTP server that handles HTTP requests; it is handed to parameters: the request and response objects
const server = http.createServer((req, res) => {
    if (req.method === 'GET') {
        // get all query parameters from the URL
        const query = url.parse(req.url, true).query
        // return the HTTP response; use the value of the name parameter if it was provided, or use World if it was not
	    	res.setHeader('Content-Type', 'text/html');
        res.end(`Hello ${query.name ? query.name : "World"}`)
    }
})
server.listen(PORT);
console.log(`HTTP Server is listening at port ${PORT} for HTTP GET requests`)
```
Save the file.

On the command line, type `npm start` to execute the application. The HTTP Server is now listening for HTTP Requests at `localhost`, on *port 3000*.

From a new bash terminal window *curl* or *wget* send an HTTP Request: [http://localhost:3000?name=John+Doe](http://localhost:3000?name=John+Doe)

```
curl http://localhost:3000?name=John+Doe 
```

Alternatively, Gitpod can help you with this by providing the external URL for accessing the Node application on port 3000 through curl:

```
curl  $(gp url 3000)?name=John+Williamson
```

or through the browser:

```
gp preview  $(gp url 3000)?name=John+Williamson
```

This should open a browser window and send a GET request to the Node application. The URL used for making that request is a public URL and could be used by anyone on any device.


You should receive an appropriate response from the service. Feel free to make some additional calls - and of course to modify the code to get some more interesting results. 
```
curl http://localhost:3000?name=Janet+Doe 
curl http://localhost:3000?name=Sandra+Buck 
curl http://localhost:3000?name=Randy+Deer 
curl http://localhost:3000?name=Fluffy+Bunny 
```

Resource: [Node documentation on http-module](https://nodejs.org/api/http.html), [Introduction to cURL](https://developer.ibm.com/articles/what-is-curl-command/)

