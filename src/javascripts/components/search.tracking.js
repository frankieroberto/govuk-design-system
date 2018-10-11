import 'govuk-frontend/vendor/polyfills/Element/prototype/classList'
import common from 'govuk-frontend/common'
var nodeListForEach = common.nodeListForEach

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

function getSearchResults ($module) {
  var $options = $module.querySelectorAll('.app-site-search__option')

  var results = []
  nodeListForEach($options, function ($option, key) {
    var $section = $option.querySelector('.app-site-search--section')
    var section = $section ? $section.textContent : ''
    var $aliases = $option.querySelector('.app-site-search__aliases')
    var aliases = $aliases ? $aliases.textContent : ''
    var title = $option.textContent.replace(section, '').replace(aliases, '')
    results.push({
      title: title,
      section: section,
      aliases: aliases
    })
  })
  return results
}

function getSearchTerm ($module) {
  var $input = $module.querySelector('.app-site-search__input')
  return stripPossiblePII($input.value)
}

function trackConfirm ($module, result) {
  if (window.DO_NOT_TRACK_ENABLED) {
    return
  }

  var searchTerm = getSearchTerm($module)
  var searchResults = getSearchResults($module)
  var products =
    searchResults
      .map(function (result, key) {
        return {
          name: result.title,
          category: result.section,
          list: searchTerm, // Used to match an searchTerm with results
          position: (key + 1)
        }
      })
      .filter(function (product) {
        // Only return the product that matches what was clicked
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

function trackInput ($module) {
  if (window.DO_NOT_TRACK_ENABLED) {
    return
  }

  var searchTerm = getSearchTerm($module)
  var searchResults = getSearchResults($module)

  if (searchResults.length === 0) {
    return
  }

  var hasResults = (searchResults[0].title !== 'No results found')
  var impressions = []
  if (hasResults) {
    // Impressions is Google Analytics lingo for what people have seen.
    impressions = searchResults.map(function (result, key) {
      return {
        name: result.title,
        category: result.section,
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
