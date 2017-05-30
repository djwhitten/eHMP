#
# Cookbook Name:: rdk_provisioner
# Attributes:: rdk
#

default[:rdk_provision][:rdk][:copy_files] = {}

#######################################################################################################################
# rdk specific aws configuration options
default[:rdk_provision][:rdk][:aws][:instance_type] = "m3.medium"
default[:rdk_provision][:rdk][:aws][:subnet] = "subnet-213b2256"
default[:rdk_provision][:rdk][:aws][:ssh_username] = "REDACTED"
default[:rdk_provision][:rdk][:aws][:ssh_keyname] = "REDACTED"
default[:rdk_provision][:rdk][:aws][:ssh_key_path] = "#{ENV['HOME']}/Projects/vistacore/.chef/keys/#{node[:rdk_provision][:rdk][:aws][:ssh_keyname]}"
#######################################################################################################################

#######################################################################################################################
# rdk specific vagrant configuration options
default[:rdk_provision][:rdk][:vagrant][:ip_address] = "IP        "
default[:rdk_provision][:rdk][:vagrant][:provider_config] = {}
default[:rdk_provision][:rdk][:vagrant][:shared_folders] = []
#######################################################################################################################
