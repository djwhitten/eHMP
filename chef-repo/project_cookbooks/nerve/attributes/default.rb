#
# Cookbook Name:: nerve
# Attributes:: default
#

default['nerve']['user'] = 'nerve'
default['nerve']['home'] = '/opt/nerve'
default['nerve']['install_dir'] = '/opt/nerve'
default['nerve']['version'] = '0.8.0'
default['nerve']['executable'] = "#{node['nerve']['install_dir']}/bin/nerve"
default['nerve']['config_file'] = "#{node['nerve']['install_dir']}/nerve.conf.json"
default['nerve']['nerve_conf_dir'] = "#{node['nerve']['install_dir']}/nerve_services"
default['nerve']['remote_services_dir'] = "/nerve/services"
