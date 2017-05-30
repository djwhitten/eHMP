#
# Cookbook Name:: oracle_wrapper
# Attributes:: apex
#

default['oracle_wrapper']['apex']['package'] = "apex-5.1"
default['oracle_wrapper']['apex']['dir'] = "#{node['oracle']['rdbms']['ora_home']}/#{node['oracle_wrapper']['apex']['package']}"
default['oracle_wrapper']['apex']['source'] = "#{node[:nexus_url]}/nexus/content/repositories/filerepo/third-party/project/oracle/apex/5.1_en/apex-5.1_en.zip"
default['oracle_wrapper']['apex']['install_apex'] = {
  'dbf_dir' => "/oradata",
  # following values are taken from APEX installation documentation: https://oracle-base.com/articles/misc/oracle-application-express-apex-5-0-installation
  'tablespace_apex' => 'APEX',
  'tablespace_files' => 'APEX',
  'tablespace_temp' => 'TEMP',
  'images' => '/i/'
}
