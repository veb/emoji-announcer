# Slack Emoji Announcer 🎉

[![Add to Slack](https://platform.slack-edge.com/img/add_to_slack.png)](https://slack.com/oauth/v2/authorize?client_id=19362919508.3176143454119&scope=chat:write,chat:write.customize,emoji:read,channels:read,groups:read&user_scope=)

Want to know when new emoji are added to your workspace, so that your coworkers marvel at how hip and trendy you are? Add Emoji Announcer to your workspace, so you receive an alert every time an emoji is changed! Simply add the bot to any channel, and it will post in the channel any time an emoji is added, removed, or renamed.

## Installation & Usage

Getting Emoji Announcer up and running is super easy! Simply [install the app](https://slack.com/oauth/v2/authorize?client_id=19362919508.3176143454119&scope=chat:write,chat:write.customize,emoji:read,channels:read,groups:read&user_scope=) and then add `@Emoji Announcer` to the channels where you want emoji alerts to be sent.

After the app is installed, simply [customize your emoji](https://slack.com/customize/emoji)! Alerts will be send approximately 30 seconds after the last change.

If you encounter any bugs, please [file an issue](https://gitlab.com/wjharney/slack-emoji-announcer/-/issues/new)!

## Development

This app is designed to be installed in multiple Slack workspaces. It is deployed to Heroku and uses [Heroku Postgres](https://www.heroku.com/postgres) for the database.

### Requirements

To run the app, all that is required is node.js and a database that is compatible with [sequelize](https://www.npmjs.com/package/sequelize). The app comes with support for PostgreSQL and SQLite. To use other databases, you will need to install the relevant packages for sequelize to function correctly (but no code changes!).

The following environment variables must be set to run the app:

| Environment Variable | Description |
| --- | --- |
| `DATABASE_URL` | URL pointing to the database where installation data is stored |
| `PORT` | Port for the app to listen on |
| `SLACK_CLIENT_ID` | Slack app client ID, found in your app's **Basic Information** |
| `SLACK_CLIENT_SECRET` | Slack app client secret, found in your app's **Basic Information** |
| `SLACK_SIGNING_SECRET` | Slack app signing secret, found in your app's **Basic Information** |
| `SLACK_STATE_SECRET` | Arbitrary string used for encoding state |
| `SLACK_DEVELOPER_MODE` | (Optional, default `false`) Whether to enable Bolt's developer mode |
| `EMOJI_ANNOUNCER_BATCH_DELAY` | (Optional, default `30000`) Number of milliseconds to wait before sending a message |
| `EMOJI_ANNOUNCER_BATCH_SIZE` | (Optional, default `100`) Maximum number of `emoji_changed` events to include in a message |

### Starting the App

After the environment variables have been configured, run the following commands to start the app:

```sh
yarn install
yarn build
yarn start
```
