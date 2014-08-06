# TvChous Client

Client to [TvChous Server](https://github.com/axelhzf/tvchous-server)

## Usage

```
var client = new Client("http://localhost:5004");
client.call("findShows").then(function (shows) {
    //success
}, function (error) {
    //failure
);
```      