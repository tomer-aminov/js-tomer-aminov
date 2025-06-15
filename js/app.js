const cardsContainer = document.getElementById('cardsContainer')
const errorContainer = document.getElementById('errorContainer')
const searchInput = document.getElementById('searchInput')
const sortSelect = document.getElementById('sortSelect')
const themeToggleBtn = document.getElementById('themeToggle')
const themeIcon = document.getElementById('themeIcon')

let items = []

document.addEventListener('DOMContentLoaded', fetchDataFunc)

async function fetchDataFunc() {
   applySavedTheme()

   try {
      const response = await fetch('data/items.json')
      if (!response.ok) throw new Error(`HTTP ${response.status}`)

      items = await response.json()
      render()

      searchInput.addEventListener('input', render)
      sortSelect.addEventListener('change', render)
      themeToggleBtn.addEventListener('click', toggleTheme)
   } catch (err) {
      showError('Failed to load items. Please try again later.')
      console.error(err)
   }
}

function render() {
   const filtered = filterItems(items, searchInput.value)
   const sorted = sortItems(filtered, sortSelect.value)

   cardsContainer.innerHTML = ''

   if (sorted.length === 0) {
      showError('No items found.')
      return
   }

   hideError()

   const frag = document.createDocumentFragment()
   sorted.forEach((item) => frag.appendChild(createCard(item)))
   cardsContainer.appendChild(frag)
}

function filterItems(arr, query = '') {
   const q = query.trim().toLowerCase()
   if (!q) return [...arr]
   return arr.filter(
      ({ title, author }) =>
         title.toLowerCase().includes(q) || author.toLowerCase().includes(q)
   )
}

function sortItems(arr, rule = '') {
   const [prop, dir] = rule.split('-')
   if (!prop) return [...arr]

   const dirFactor = dir === 'desc' ? -1 : 1
   return [...arr].sort((a, b) => a[prop].localeCompare(b[prop]) * dirFactor)
}

function createCard({ id, title, author, description, image }) {
   const col = document.createElement('div')
   col.className = 'col'

   const card = document.createElement('div')
   card.className = 'card card-custom h-100'
   card.setAttribute('data-id', id)

   const imgWrap = document.createElement('div')
   imgWrap.className = 'card-img-container'

   const img = document.createElement('img')
   img.src = image
   img.alt = title
   img.className = 'card-img-top'
   img.loading = 'lazy'
   img.addEventListener('error', () => handleBrokenImage(img))

   imgWrap.appendChild(img)

   const body = document.createElement('div')
   body.className = 'card-body d-flex flex-column'

   const ttl = document.createElement('h5')
   ttl.className = 'card-title'
   ttl.textContent = title

   const auth = document.createElement('span')
   auth.className = 'badge badge-author align-self-start mb-2'
   auth.textContent = author

   const desc = document.createElement('p')
   desc.className = 'card-text mb-0'
   desc.textContent = description

   body.append(ttl, auth, desc)
   card.append(imgWrap, body)
   col.appendChild(card)

   return col
}

function toggleTheme() {
   const darkEnabled = document.body.classList.toggle('dark-mode')
   setThemeIcon(darkEnabled)
   localStorage.setItem('theme', darkEnabled ? 'dark' : 'light')
}

function applySavedTheme() {
   const saved = localStorage.getItem('theme')
   const dark = saved === 'dark'
   if (dark) document.body.classList.add('dark-mode')
   setThemeIcon(dark)
}

function setThemeIcon(darkMode) {
   themeIcon.className = darkMode ? 'bi bi-sun-fill' : 'bi bi-moon-fill'
}

function showError(msg) {
   errorContainer.textContent = msg
}

function hideError() {
   errorContainer.textContent = ''
}

function handleBrokenImage(imgEl) {
   imgEl.style.display = 'none'

   const altText = document.createElement('div')
   altText.className = 'p-3 text-center fst-italic'
   altText.textContent = imgEl.alt
   imgEl.parentElement.appendChild(altText)
}
