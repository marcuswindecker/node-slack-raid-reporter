# Slack Raid Reporter
##### Because knowing is half the battle.
This is a Slack app designed to help you build a competent raid fireteam in Destiny 2. It's triggered with a [slash command](https://api.slack.com/slash-commands) that you customize.

`/report marcuswindecker` returns an initial response that looks like:

`Processing request! Here's the raid.report in the meantime: https://raid.report/ps/marcuswindecker`

This initial response satisfies the 3sec window that Slack waits for before timing out the request. Once the full stats are retrieved, a followup response is POSTed to the `response_url` sent with the initial Slack request. That followup response looks like:

`This user has 420 completions in total on PSN.`

An error message is returned if the user isn't found on PSN.

##### Deploying this app on Heroku.
1. Clone or fork this repo
2. `npm install`
3. `npm start`
4. The server will spin up at `http://localhost:3000` (you can configure the port in `index.js`)
5. Verify that the app has compiled correctly and is accessible using [Postman](https://www.getpostman.com/) or cURL
6. When you are able to verify that the app is responding as expected, follow [these instructions](https://devcenter.heroku.com/articles/getting-started-with-nodejs#deploy-the-app)  to deploy the app on Heroku
7. When you've verified that the app is correctly deployed on Heroku, create a new slack app in your channel. Create a slash command within the app and point it at your newly created Heroku URL using whatever command you prefer to trigger the app, I like `/report` but you can use `/jamjort` if you want.
8. If all goes well, you'll be reporting on fools in no time and getting those 30-minute raids in with a solid team.

*Note:* currently, there is a single endpoint: `/api/raid`. The request/initial response structure is as follows:
```javascript
POST /api/raid

Request:
{
		'text': '<username>',
		'response_url': '<url>'
}

Initial Response:
{
    'response_type': 'in_channel',
    'text': 'Processing request! Here\'s the raid.report in the meantime: https://raid.report/ps/<username>'
}

Delayed Response:
{
		'response_type': 'in_channel',
    'text': 'This user has <completion_count> completions in total on PSN.'
}
```

# Warning!
The code in this repo may be stable or unstable at any given time. Beware! Maybe if this thing gets traction I'll put a proper release protocol in place but for now everything's going to `master`!

## Roadmap:
* Ability to specify platform with the request i.e. `/report xbox marcuswindecker`, `/report psn marcuswindecker`
* Ability to specify a specific raid with the request i.e. `/report leviathan marcuswindecker`, `/report eaterofworlds marcuswindecker`
* Include additional stats like:
	* completion percentage
	* times: fastest, average, most recent
	* dates: first, most recent

## Acknowledgements
* [The Traveler](https://github.com/alexanderwe/the-traveler) npm package from @alexanderwe - This package is the only reason this entire project came together. I can't express how happy I was to find this and how smooth it made the project.
* The [raid.report](https://raid.report) team for their work on one of the most damn useful Destiny 2 webapps I've come across. Seriously, that thing is slick.
* Bungie for providing such a comprehensive API for Destiny 2. (Although, your docs need some work...)