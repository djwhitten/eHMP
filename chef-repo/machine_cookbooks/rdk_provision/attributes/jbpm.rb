#
# Cookbook Name:: rdk_provisioner
# Attributes:: jbpm
#

default[:rdk_provision][:jbpm][:copy_files] = {}

#######################################################################################################################
# jbpm specific aws configuration options
default[:rdk_provision][:jbpm][:aws][:instance_type] = "m3.xlarge"
default[:rdk_provision][:jbpm][:aws][:subnet] = "subnet-213b2256"
default[:rdk_provision][:jbpm][:aws][:ssh_username] = "REDACTED"
default[:rdk_provision][:jbpm][:aws][:ssh_keyname] = "REDACTED"
default[:rdk_provision][:jbpm][:aws][:ssh_key_path] = "#{ENV['HOME']}/Projects/vistacore/.chef/keys/#{node[:rdk_provision][:jbpm][:aws][:ssh_keyname]}"
#######################################################################################################################

#######################################################################################################################
# jbpm specific vagrant configuration options
default[:rdk_provision][:jbpm][:vagrant][:ip_address] = "IP        "
default[:rdk_provision][:jbpm][:vagrant][:provider_config] = {
  :memory => 2048,
  :cpus => 4
}
default[:rdk_provision][:jbpm][:vagrant][:shared_folders] = []
#######################################################################################################################
