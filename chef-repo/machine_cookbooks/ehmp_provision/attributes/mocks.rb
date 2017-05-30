#
# Cookbook Name:: ehmp_provisioner
# Attributes:: mocks
#

default[:ehmp_provision][:mocks][:copy_files] = {}

#######################################################################################################################
# mocks specific aws configuration options
default[:ehmp_provision][:mocks][:aws][:instance_type] = "m3.medium"
default[:ehmp_provision][:mocks][:aws][:subnet] = "subnet-213b2256"
default[:ehmp_provision][:mocks][:aws][:ssh_username] = "REDACTED"
default[:ehmp_provision][:mocks][:aws][:ssh_keyname] = "REDACTED"
default[:ehmp_provision][:mocks][:aws][:ssh_key_path] = "#{ENV['HOME']}/Projects/vistacore/.chef/keys/#{node[:ehmp_provision][:mocks][:aws][:ssh_keyname]}"
#######################################################################################################################

#######################################################################################################################
# mocks specific vagrant configuration options
default[:ehmp_provision][:mocks][:vagrant][:ip_address] = "IP        "
default[:ehmp_provision][:mocks][:vagrant][:provider_config] = {
  :memory => 1024
}
default[:ehmp_provision][:mocks][:vagrant][:shared_folders] = []
#######################################################################################################################
