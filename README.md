# insomnia-plugin-count-in-page

Count the total occurrences of a matched string or regular expression in a response body in Insomnia REST Client, see a list of all lines where a match was found

## Installation

### From Insomnia Plugin Hub

1. Navigate to [https://insomnia.rest/plugins/insomnia-plugin-count-in-page](https://insomnia.rest/plugins/insomnia-plugin-count-in-page)
2. Click _Install Plugin_
3. Click _Open_
4. Once opened, click _Install_

### From the Insomnia App

1. Go to _Application_ > _Preferences_ **or** click the cog icon (⚙️)
2. Navigate to the _Plugins_ tab
3. Enter `insomnia-plugin-count-in-page`
4. Click _Install_

### Manual Install

1. Using a terminal, `cd` into your Insomnia plugins folder - [See Insomnia Docs](https://docs.insomnia.rest/insomnia/introduction-to-plugins)
2. Run `git clone https://github.com/okdv/insomnia-plugin-count-in-page`
3. Run `cd insomnia-plugin-count-in-page`

## Usage

1. Click the dropdown arrow of the request you would like to search the response of and select "Count in Page"
2. Input a string or regular expression (**Note:** just like native Find in Page in Insomnia, wrap your input in '/' to treat at RegEx. e.g. EXAMPLE is a string, /EX[A-Z]+/ is a RegEx.) and hit Count
3. Wait a moment, you'll notice the request is automatically resent, shortly after you will get a popup showing the input, total matches, total lines, and a list of all of the above
4. Any subsequent requests will not use this input, you must start from Step 1 each time you want to use this plugin 

### Known Limitations

- Cannot use this plugin on historical responses, when you attempt to "Count in Page" it will resend the request and generate a new response to count in. There is no current workaround for this aside from potentially using other plugins to fake responses.
- Only designed to work with XML and JSON, however the 'total matches' count should work regardless of format. Matched lines may not as responses often do not come pre-formatted, and so they are formatted with [pretty-data.js](http://www.eslinstructor.net/pretty-data/) based on their content-type, and at this time only XML and JSON content-types are checked, but if the response comes pre-formatted then hey, it will probably work. 
- Cannot match across multiple lines. e.g. `/<lineOne\/>\w*[\r\n]{1}\w*<lineTwo\/>*/` would not work as the response is broken into lines and each line is independently searched for a match. If needed, removing all formatting to find occurrences like this can be done, but as of now it seems like an edge case so this is not a feature at this time. 

### Enable / Disable Plugin

It's disabled by default, can only be enabled for a single request by "Count in Page" in request dropdown. Once done once, the plugin goes back to doing nothing

#### Using Insomnia Plugins Settings

1. Go to _Application_ > _Preferences_ **or** click the cog icon (⚙️)
2. Navigate to the _Plugins_ tab
3. Toggle off this plugin

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.
Please make sure to update tests as needed.

## License

[MIT](https://choosealicense.com/licenses/mit/)

---

Boostrapped using [create-insomnia-plugin](https://gitlab.com/okdv/create-insomnia-plugin)
