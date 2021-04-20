console.log('En garde loaded')

async function createChallenge ({ userId, time, mode, increment, color }) {
  const payload = new URLSearchParams({
    variant: 1, // 1 = standard
    mode, // 0 = casual, 1 = rated
    timeMode: 1, // no idea but I think 1 = "timed"
    time, // in minutes
    increment,
    days: 2, // this has to be here for some reason
    color: 'random'
  })

  const response = await content.fetch(`https://lichess.org/setup/friend?user=${userId || 'any'}`, {
    'credentials': 'include',
    'headers': {
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:87.0) Gecko/20100101 Firefox/87.0",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.5",
      "Content-Type": "application/x-www-form-urlencoded",
      "Upgrade-Insecure-Requests": "1"
    },
    'referrer': 'https://lichess.org/',
    'body': payload.toString(),
    'method': 'POST',
    'mode': 'cors'
  })

  if (!response.ok) {
    const e = new Error(response.statusText)
    e.status = response.status
    e.body = response.body
    throw e
  }

  // the API sends a redirect and the url property is the game page
  return response.url
}


async function main () {
  // only do this on the home page
  if (window.location.pathname !== '/') return

  const storageItem = await browser.storage.sync.get('engarde')
  const options = storageItem.engarde || {}

  if (!options.parsed || !options.parsed.length) return
  if (!document.querySelector('#user_tag')) return // they aren't logged in

  const container = document.querySelector('.lobby__app__content')

  const validShortcuts = options.parsed.filter((opt) => opt.alias && opt.time && opt.increment && opt.username)

  // delete buttons for however many shortcuts are well-defined
  for (const shortcut of validShortcuts) {
    if (shortcut.alias && shortcut.time && shortcut.increment && shortcut.username) {
      container.childNodes[container.childNodes.length - 1].remove()
    }
  }

  for (const shortcut of validShortcuts) {
    const btn = document.createElement('div')
    const clock = document.createElement('div')
    const name = document.createElement('div')

    clock.innerText = `${shortcut.time} + ${shortcut.increment}`
    clock.classList.add('clock')

    name.innerText = shortcut.alias

    btn.appendChild(clock)
    btn.appendChild(name)

    btn.addEventListener('click', () => {
      createChallenge({
        userId: shortcut.username,
        time: shortcut.time,
        mode: shortcut.rated === 'on' ? 1 : 0,
        increment: shortcut.increment
      }).then((gameUrl) => open(gameUrl))
        .catch((e) => console.error(e))
    })

    container.appendChild(btn)
  }
}

main()
