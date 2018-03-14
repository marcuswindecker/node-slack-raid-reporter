# Slack Raid Reporter
##### Because knowing is half the battle.
This is a Slack app designed to help you build a competent raid fireteam in Destiny 2. It's triggered with a [slash command](https://api.slack.com/slash-commands) that you build.

`/report skaterape` returns "Here's the raid report for skaterape on PSN: [https://raid.report/ps/skaterape](https://raid.report/ps/skaterape)"

##### Deploying this app on Heroku.
1. Clone or fork this repo
2. `npm install`
3. `npm start`
4. The server will spin up at `http://localhost:3000` (you can configure the port in `index.js`)
5. Verify that the app has compiled correctly and is accessible using [Postman](https://www.getpostman.com/) or cURL
6. When you are able to verify that the app is responding as expected, follow [these instructions](https://devcenter.heroku.com/articles/getting-started-with-nodejs#deploy-the-app)  to deploy the app on Heroku
7. When you've verified that the app is correctly deployed on Heroku, create a new slack app in your channel. Create a slash command within the app and point it at your newly created Heroku URL using whatever command you prefer to trigger the app, I like `/report` but you can use `/jamjort` if you want.
8. If all goes well, you'll be reporting on fools in no time and getting those 30-minute raids in with a solid team.

*Note:* currently, there is a single endpoint: `/stats`. The request/response structure is as follows:
```javascript
POST /stats

Request:
{
	'text': '<username>'
}

Response:
{
	'response_type': 'in_channel',
    'text': 'Here\'s the raid report for <username> on PSN: https://raid.report/ps/<username>'
}
```

# Warning!
The code in this repo may be stable or unstable at any given time. Beware! Maybe if this thing gets traction I'll put a proper release protocol in place but for now everything's going to `master`!

## Roadmap:
* Ability to specify platform with the request i.e. `/report xbox marcuswindecker`, `/report psn marcuswindecker`
* Ability to specify a specific raid with the request i.e. `/report leviathan marcuswindecker`, `/report eaterofworlds marcuswindecker`
* Possibly using something like [PhantomJS](http://phantomjs.org/) to scrape the raid.report site and either provide a screenshot or the values in the `.total-completions` fields
	* I wasn't having much luck with this due to raid.report being a react app. I was getting some funny errors back when crawling the page. (Let me know if you think you can help with this, I'll pay in beer or raid runs!) 	
* V2: remove the raid.report dependency and go directly to the Bungie API for the data

## Acknowledgements
* The [raid.report](https://raid.report) team for their work on one of the most damn useful Destiny 2 webapps I've come across. Seriously, that thing is slick.
* Bungie for providing such a comprehensive API for Destiny 2. (Although, your docs need some work...)
* [The Traveler](https://github.com/alexanderwe/the-traveler) npm package from @alexanderwe - I haven't made use of this yet, but I can already tell it's going to come in handy...