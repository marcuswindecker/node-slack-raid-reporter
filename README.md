# The Speaker
##### Because knowing is half the battle.
This is a Slack app designed to help you build a competent raid fireteam in Destiny 2. It's triggered with a [slash command](https://api.slack.com/slash-commands) that you customize.

`/speaker marcuswindecker` returns an initial response that looks like:

`I'm consulting with the Traveler...`

This initial response satisfies the 3sec window that Slack waits for before timing out the request. Once the full stats are retrieved, a followup response is POSTed to the `response_url` sent with the initial Slack request.

Optionally, you can submit a platform ('psn', 'xbox', 'pc') to search that platform specifically. If this platform isn't present, then the request will default to PSN.

An error message is returned if the user isn't found on the platform or if an incorrect number of params is sent in the request.

##### Deploying this app on Heroku.
1. Clone or fork this repo
2. `npm install`
3. `npm start`
4. The server will spin up at `http://localhost:3000` (you can configure the port in `index.js`)
5. Verify that the app has compiled correctly and is accessible using [Postman](https://www.getpostman.com/) or cURL
6. When you are able to verify that the app is responding as expected, follow [these instructions](https://devcenter.heroku.com/articles/getting-started-with-nodejs#deploy-the-app)  to deploy the app on Heroku
7. When you've verified that the app is correctly deployed on Heroku, create a new slack app in your channel. Create a slash command within the app and point it at your newly created Heroku URL using whatever command you prefer to trigger the app, I like `/speaker` but you can use `/freaker` if you want.
8. If all goes well, you'll be reporting on fools in no time and getting those 30-minute raids in with a solid team.

*Note:* currently, there is only a single endpoint configured: `/api/raid`. The request/response structures are as follows:
```javascript
POST /api/raid

Request:
{
    text: '[<platform>] <username>',
    response_url: <url>
}

Initial Response:
{
    response_type: 'in_channel',
    text: 'I\'m consulting with the Traveler...'
}

Delayed Response (success):
{
    response_type: 'in_channel',
    text: 'Here are the detailed stats for <username> on <platform>'
    attachments: [{
        fallback: '<username> has <completion_count> completions in total on <platform>.',
        fields: [
            {
                title: 'Total Completions',
                value: <completion_count>,
                short: true
            },
            {
                title: 'Completion Percentage',
                value: <completion_percentage>,
                short: true
            },
            {
                title: 'Fastest Time',
                value: <fastest_time>,
                short: true
            }
        ],
        color: 'good'
    }]
}

Delayed Response (error):
{
    response_type: 'in_channel',
    attachments: [{
        fallback: <error_message>,
        text: <error_message>,
        color: 'danger'
    }]
}
```

# Warning!
The code in this repo may be stable or unstable at any given time. Beware! Maybe if this thing gets traction I'll put a proper release protocol in place but for now everything's going to `master`!

## Roadmap:
* Ability to specify a specific raid with the request i.e. `/speaker leviathan marcuswindecker`, `/speaker eaterofworlds marcuswindecker`
* Include additional stats like:
  * times: average, most recent
  * dates: first, most recent

## Acknowledgements
* [The Traveler](https://github.com/alexanderwe/the-traveler) npm package from @alexanderwe - This package is the only reason this entire project came together. I can't express how happy I was to find this and how smooth it made the project.
* The [raid.report](https://raid.report) team for their work on one of the most damn useful Destiny 2 webapps I've come across. Seriously, that thing is slick.
* Bungie for providing such a comprehensive API for Destiny 2.