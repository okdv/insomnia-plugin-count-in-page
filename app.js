// https://docs.insomnia.rest/insomnia/hooks-and-actions

var pd = require('pretty-data').pd

const sanitizeInput = str => {
  if (str.startsWith('/') && str.endsWith('/')) {
    return new RegExp(str.slice(1, -1), 'g')
  } else {
    return str.replace(/[-[\]{}()*+?.,\\/^$|#\s]/g, '\\$&')
  }
}

const trigger = {
  label: 'Count in page',
  action: async (context, data) => {
    const { request } = data
    const prompt = await context.app.prompt('Count in page', {
      label: 'Count in page',
      submitName: 'Count',
      cancelable: true,
    })
    await context.store.setItem(`count.${request._id}`, prompt)
    await context.network.sendRequest(request)
  },
}

const count = async context => {
  const countPrompt = await context.store.getItem(
    `count.${context.request.getId()}`
  )
  await context.store.removeItem(`count.${context.request.getId()}`)
  if (countPrompt && countPrompt.length > 0) {
    const regex = sanitizeInput(countPrompt)
    try {
      let body = context.response.getBody().toString('utf-8')
      const contentType = context.response.getHeader('content-type')
      if (contentType.includes('xml')) {
        body = pd.xml(body)
      } else if (contentType.includes('json')) {
        body = pd.json(body)
      }
      const bodyArr = body.split(/[\n\r]/)
      const matches = []
      bodyArr.map((line, i) => {
        const rgx = typeof regex === 'string' ? new RegExp(regex, 'g') : regex
        if (rgx.test(line)) {
          const replaced = line
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(rgx, match => `<b style="color:red;">${match}</b>`)
          if (replaced !== line) {
            const res = `<b>${i + 1}</b>: <code>${replaced}</code>`
            matches.push(res)
          }
        }
      })
      const html = `
        <h2>Found ${
          matches.length
        } instances of ${countPrompt} in ${context.request.getName()}:</h2>
        <p>${matches.join('</p><p>')}</p>
      `
      context.app.showGenericModalDialog(`Count ${countPrompt}`, { html })
    } catch {
      console.log(context.response.getBody(), 'failed to retrieve buffer')
    }
  }
  return false
}

module.exports.requestActions = [trigger]
module.exports.responseHooks = [count]
