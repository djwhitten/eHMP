# Valid Login information to be used for most tests
class DefaultLogin
#    @@hmp_url = ENV.keys.include?('LEIPR_IP') ? 'https://' + ENV['LEIPR_IP'] :"https://hmpdemo.vainnovations.us"
#    @@facility = "HMP SANDBOX"
#    @@accesscode = "10VEHU"
#    @@verifycode = "VEHU10"

  # @@hmp_url = 'https://' + ENV['EHMP_IP'] + ":8443"
  if !ENV['VE2_ATEST'].nil? && ENV['VE2_ATEST'] == "1"
    p "Using VE2 for Acceptance Tests"
    @@hmp_url = ENV.keys.include?('VE2_EHMP_IP') ? 'https://' + ENV['VE2_EHMP_IP'] + ":8443" : "https://REDACTED       "
    @@fhir_url = ENV.keys.include?('VE2_VE_API_IP') ? 'https://' + ENV['VE2_VE_API_IP'] : "https://REDACTED  "
    @@jds_url = ENV.keys.include?('VE2_JDS_IP') ? 'http://' + ENV['VE2_JDS_IP'] + ":9080" : "http://REDACTED         "
    @@solr_url = ENV.keys.include?('VE2_SOLR_IP') ? 'http://' + ENV['VE2_SOLR_IP'] + ":8983" : "http://REDACTED        "
    @@vx_sync_url = ENV.keys.include?('VX_SYNC_IP') ? 'http://' + ENV['VX_SYNC_IP'] + ":8080" : "https://REDACTED       "
  else
    p "Using default VistA-Exchange for Acceptance Tests"
    @@hmp_url = ENV.keys.include?('EHMP_IP') ? 'https://' + ENV['EHMP_IP'] + ":8443" : "https://REDACTED       "
    @@jds_url = ENV.keys.include?('JDS_IP') ? 'http://' + ENV['JDS_IP'] + ":9080" : "http://REDACTED         "
    @@fhir_url = ENV.keys.include?('VE_API_IP') ? 'https://' + ENV['VE_API_IP'] : "https://REDACTED  "
    @@solr_url = ENV.keys.include?('SOLR_IP') ? 'http://' + ENV['SOLR_IP'] + ":8983" : "http://REDACTED        "
    @@vx_sync_url = ENV.keys.include?('VX_SYNC_IP') ? 'http://' + ENV['VX_SYNC_IP'] +":8080" : "http://REDACTED       "
  end

  @@facility = "PANORAMA"
  @@accesscode = "REDACTED"
  @@verifycode = "REDACTED"
  # @@jds_url = 'https://' + ENV['JDS_IP'] + ":9080"

  @@default_wait_time = 50

  @@rdk_url = ENV.keys.include?('RDK_IP') ? 'http://' + ENV['RDK_IP'] + ":8888" : "http://127.0.0.1:8888"
  @@rdk_api_url = ENV.keys.include?('RDK_API_IP') ? 'http://' + ENV['RDK_API_IP'] + ":8888" : "http://REDACTED         "
  
  def self.rdk_url
    return @@rdk_url
  end

  def self.rdk_api_url
    return @@rdk_api_url
  end
  
  @@ve2_hmp_url = ENV.keys.include?('VE2_EHMP_IP') ? 'https://' + ENV['VE2_EHMP_IP'] + ":8443" : "https://REDACTED       "
  @@ve2_fhir_url = ENV.keys.include?('VE2_VE_API_IP') ? 'https://' + ENV['VE2_VE_API_IP'] : "https://REDACTED  "
  @@ve2_jds_url = ENV.keys.include?('VE2_JDS_IP') ? 'http://' + ENV['VE2_JDS_IP'] + ":9080" : "http://REDACTED         "
  @@ve2_solr_url = ENV.keys.include?('VE2_SOLR_IP') ? 'http://' + ENV['VE2_SOLR_IP'] + ":8983" : "http://REDACTED        "

  def self.wait_time
    return @@default_wait_time
  end

  def self.jds_url
    return @@jds_url
  end
  def self.fhir_url
    return @@fhir_url
  end
  def self.solr_url
    return @@solr_url
  end

  def self.facility
    return @@facility
  end

  def self.access_code
    return @@accesscode
  end

  def self.verify_code
    return @@verifycode
  end

  def self.hmp_url
    return @@hmp_url
  end

  def self.ve2_jds_url
    return @@ve2_jds_url
  end
  
  def self.ve2_fhir_url
    return @@ve2_fhir_url
  end
 
  def self.ve2_hmp_url
    return @@ve2_hmp_url
  end
  
  def self.ve2_solr_url
    return @@ve2_solr_url
  end
  
  def self.vx_sync_url
    return @@vx_sync_url
  end
  
end

