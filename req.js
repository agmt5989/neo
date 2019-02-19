const request = require("request");
const url = "https://jsonplaceholder.typicode.com/posts/1";
request.get(url, (error, response, body) => {
    let json = JSON.parse(body);
    console.log(body);
});
