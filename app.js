// https://docs.insomnia.rest/insomnia/hooks-and-actions

var pd = require('pretty-data').pd

// Detects if regex or string matching, sanitizes string inputs
const sanitizeInput = str => {
  // check if regex (starts/ends with /) or if a string
  if (str.startsWith('/') && str.endsWith('/')) {
    // create a global regex, removing the / used for identification
    return new RegExp(str.slice(1, -1), 'g')
  } else {
    // sanitize potentially conflicting or harmful characters
    return str.replace(/[-[\]{}()*+?.,\\/^$|#\s]/g, '\\$&')
  }
}

// requestAction, this creates the "Count in page" button in the dropdown of a request
const trigger = {
  label: 'Count in page',
  action: async (context, data) => {
    const { request } = data
    const prompt = await context.app.prompt('Count in page', {
      label: 'Count in page',
      submitName: 'Count',
      cancelable: true,
    })
    // create a store item assocaited with the prompt and request ID
    await context.store.setItem(`count.${request._id}`, prompt)
    // resend request so count() will be triggered as a responseHook
    await context.network.sendRequest(request)
  },
}

// responseHooks, this is called when a response is loaded
const count = async context => {
  // check store to see if shoudl attempt to count, if so retrieve prompt
  const countPrompt = await context.store.getItem(
    `count.${context.request.getId()}`
  )
  // remove item from store no matter what, this will block further triggering of count() on future responses
  await context.store.removeItem(`count.${context.request.getId()}`)
  // block further triggering if no prompt retrieved or if its empty
  if (countPrompt && countPrompt.length > 0) {
    const regex = sanitizeInput(countPrompt)
    try {
      // y is total matches across response
      let y = 0
      // retrieve body buffer and convert it to string
      let body = context.response.getBody().toString('utf-8')
      // retrieve content-type header for pd call
      const contentType = context.response.getHeader('content-type')
      // prettify data string based on content-type header
      if (contentType.includes('xml')) {
        body = pd.xml(body)
      } else if (contentType.includes('json')) {
        body = pd.json(body)
      }
      // split body by newline/return
      const bodyArr = body.split(/[\n\r]/)
      // array of matched lines from body
      const matches = []
      // loop through every line in body
      bodyArr.forEach((line, i) => {
        // create regex of string, or use provided regex, depending on user input
        const rgx = typeof regex === 'string' ? new RegExp(regex, 'g') : regex
        // number of matches in line
        const x = line.match(rgx)
        // skip line if no matches
        if (x && x.length > 0) {
          // add matches from line into total matches
          y = y + x.length
          // replace xml characters that confuse html with entities, replace each match with itself as bold red text
          const replaced = line
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(rgx, match => `<b style="color:red;">${match}</b>`)
          // ignore pushing to results if the replacement and original strings are the same
          if (replaced !== line) {
            const res = `<b>${i + 1}</b>: <code>${replaced}</code>`
            matches.push(res)
          }
        }
      })
      // generate html for dialogue modal
      const html = `
        <h2>Found ${y} matches across ${
        matches.length
      } rows in ${context.request.getName()}:</h2>
        <p>${matches.join('</p><p>')}</p>
      `
      // using old dialog modal, i have never managed to get the new one working correctly, fingers crossed its support for a while longer...
      context.app.showGenericModalDialog(`Count ${countPrompt}`, { html })
    } catch {
      console.log('[count-in-page] failed to retrieve buffer')
    }
  }
  return false
}

// declare hooks/actions for insomnia
module.exports.requestActions = [trigger]
module.exports.responseHooks = [count]
