function saveOptions(e) {
  e.preventDefault()

  const data = new FormData(this)

  const raw = [...data.entries()]

  // extract each shortcut's settings
  const parsed = []
  const keys = ['alias', 'username', 'time', 'increment', 'rated']
  for (let i = 1; i <= 3; i++) {
    parsed[i - 1] = {}
    for (const key of keys) {
      const val = data.get(`shortcut_${i}_${key}`)
      parsed[i - 1][key] = val
    }
  }

  browser.storage.sync.set({ engarde: { raw, parsed } })

  const btn = document.getElementById('submit_btn')
  btn.innerText = 'Settings saved'
  setTimeout(() => {
    btn.innerText = 'Save'
  }, 2000)
}

function restoreOptions() {
  const storageItem = browser.storage.sync.get('engarde')
  storageItem.then((res) => {
    const { raw } = res.engarde
    for (const [key, val] of raw) {
      if (key.includes('rated')) {
        document.getElementById(key).checked = val === 'on'
      } else {
        document.getElementById(key).value = val
      }
    }
  })
}

document.addEventListener('DOMContentLoaded', restoreOptions)
document.querySelector('form').addEventListener('submit', saveOptions)
