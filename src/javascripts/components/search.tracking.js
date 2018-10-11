function addToDataLayer (payload) {
  window.dataLayer = window.dataLayer || []
  window.dataLayer.push(payload)
}

function stripPossiblePII (string) {
    // Try to detect emails and redact it.
  string = string.replace(/\S*@\S*\s?/g, '[blocked]')
    // If someone has typed in a number it's likely not related so redact it
  string = string.replace(/0|1|2|3|4|5|6|7|8|9/g, '[blocked]')
  return string
}

function trackConfirm ($module, result) {
  if (window.DO_NOT_TRACK_ENABLED) {
    return
  }

  var $input = $module.querySelector('.app-site-search__input')
  var searchTerm = stripPossiblePII($input.value)

  var $options = $module.querySelectorAll('.app-site-search__option')

  var products = Array.from($options).map(function ($option, key) { // Array.from Needs polyfilling etc? Autocomplete only works in IE9+...
    var $section = $option.querySelector('.app-site-search--section')
    var category = $section ? $section.textContent : ''
    var $aliases = $option.querySelector('.app-site-search__aliases')
    var aliases = $aliases ? $aliases.textContent : ''
    var name = $option.textContent.replace(category, '').replace(aliases, '')
    return {
      name: name,
      category: category,
      list: searchTerm, // Used to match an searchTerm with results
      position: (key + 1)
    }
  }).filter(function (product) {
    return product.name === result.title
  })

  addToDataLayer({
    event: 'site-search',
    eventDetails: {
      category: 'site search',
      action: 'click',
      label: searchTerm + ' | ' + result.title
    },
    ecommerce: {
      click: {
        actionField: { list: searchTerm },
        products: products
      }
    }
  })
}

function trackInput ($module, $input) {
  if (window.DO_NOT_TRACK_ENABLED) {
    return
  }

  var $options = $module.querySelectorAll('.app-site-search__option')
  var searchTerm = stripPossiblePII($input.value)

  if ($options.length === 0) {
    return
  }

  var hasResults = !$options[0].classList.contains('app-site-search__option--no-results') // Class list polyfill?
  var impressions = []
  if (hasResults) {
    // Impressions is Google Analytics lingo for what people have seen.
    impressions = Array.from($options).map(function ($option, key) { // Array.from Needs polyfilling etc? Autocomplete only works in IE9+...
      var $section = $option.querySelector('.app-site-search--section')
      var category = $section ? $section.textContent : ''
      var $aliases = $option.querySelector('.app-site-search__aliases')
      var aliases = $aliases ? $aliases.textContent : ''
      var name = $option.textContent.replace(category, '').replace(aliases, '')
      return {
        name: name,
        category: category,
        list: searchTerm, // Used to match an searchTerm with results
        position: (key + 1)
      }
    })
  }

  addToDataLayer({
    event: 'site-search',
    eventDetails: {
      category: 'site search',
      action: hasResults ? 'results' : 'no result',
      label: searchTerm
    },
    ecommerce: {
      impressions: impressions
    }
  })
}

export { trackConfirm, trackInput }
