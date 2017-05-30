#
# Cookbook Name:: ehmp_provisioner
# Attributes:: zookeeper
#

default[:ehmp_provision][:zookeeper][:copy_files] = {}

#######################################################################################################################
# zookeeper specific aws configuration options
default[:ehmp_provision][:zookeeper][:aws][:instance_type] ="m3.medium"
default[:ehmp_provision][:zookeeper][:aws][:subnet] = "subnet-213b2256"
default[:ehmp_provision][:zookeeper][:aws][:ssh_username] = "REDACTED"
default[:ehmp_provision][:zookeeper][:aws][:ssh_keyname] = "REDACTED"
default[:ehmp_provision][:zookeeper][:aws][:ssh_key_path] = "#{ENV['HOME']}/Projects/vistacore/.chef/keys/#{node[:ehmp_provision][:vxsync][:aws][:ssh_keyname]}"
#######################################################################################################################

#######################################################################################################################
# zookeeper specific vagrant configuration options
default[:ehmp_provision][:zookeeper][:vagrant][:ip_address] = "IP       "
default[:ehmp_provision][:zookeeper][:vagrant][:provider_config] = {
  :memory => 512
}
default[:ehmp_provision][:zookeeper][:vagrant][:shared_folders] = []
#######################################################################################################################
