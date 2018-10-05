// The iframe-resizer module seems to export it's methods in an odd way
// So we use an underscore here.
import _ from 'iframe-resizer'

function Example ($module) {
  this.$module = $module
}

Example.prototype.init = function () {
  var $module = this.$module
  if (!$module) {
    return
  }
  this.resize()
  this.expandMacroOptions()
}
Example.prototype.resize = function () {
  var $module = this.$module

  try {
    // Example iframe; set the height equal to the body height
    _.iframeResizer({ scrolling: 'auto', autoResize: true }, $module)
  } catch (err) {
    if (err) {
      console.error(err.message)
    }
  }
}

// Open Nunjucks tab and expand macro options details when URL hash is 'nunjucks-options-[example]'
Example.prototype.expandMacroOptions = function () {
  var hash = window.location.hash

  if (hash.match('^#nunjucks-options-')) {
    var exampleName = hash.split('#nunjucks-options-')[1]

    if (exampleName) {
      var tabLink = document.getElementById(exampleName += '-nunjucks') // Tab link for the example
      var tabHeading = tabLink ? tabLink.parentNode : null
      var optionsDetailsElement = document.getElementById(hash.substring(1))

      if (tabHeading && optionsDetailsElement) {
        tabHeading.className += 'app-tabs__item--current'
        optionsDetailsElement.open = true
      }
    }
  }
}

export default Example
