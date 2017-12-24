
class AppDocumentationFetch < SitePrism::Page 
  set_url 'resource/docs/vx-api'
  set_url_matcher Regexp.new("resource/docs/vx-api")

  element :title, ".content header h1"
  elements :navigation, ".resource-group"
end