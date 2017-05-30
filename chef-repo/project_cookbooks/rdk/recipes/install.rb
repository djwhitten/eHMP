#
# Cookbook Name:: rdk
# Recipe:: install
#

include_recipe "rdk::service" # Included due to dependency to service resource

remote_file "#{Chef::Config['file_cache_path']}/rdk.zip" do
  source node[:rdk][:source]
  mode   "0755"
  use_conditional_get true
  notifies :delete, "directory[#{node[:rdk][:home_dir]}]", :immediately
  not_if ("mountpoint -q #{node[:rdk][:home_dir]}")
end

directory node[:rdk][:home_dir] do
  mode "0755"
  recursive true
  action :create
end

directory node[:rdk][:log_dir] do
  mode "0755"
  recursive true
  action :create
end

directory node[:rdk][:pid_dir] do
  mode "0755"
  recursive true
  action :create
end

directory node[:rdk][:incidents][:root_directory] do
  mode "0755"
  recursive true
  action :create
end

# Run npm install only if using shared folders
execute "install modules" do
  cwd node[:rdk][:home_dir]
  command "npm install"
  action :run
  only_if ("mountpoint -q #{node[:rdk][:home_dir]}")
end

# Stopping rdk services is required because dev deploys create a hanging process which prevents the oracle
# npm module from being installed/updated.. Restarting the fetch_server and activity_handler processes
# in this manner frees up the locked file/folder and allows the reinstall of the oracle module

execute "install oracledb module" do
  cwd node[:rdk][:home_dir]
  command "npm install oracledb@#{node[:rdk][:oracledb_module][:version]}"
  action :run
  notifies :stop, "service[#{node[:rdk][:services][:fetch_server][:service]}]", :before
  notifies :stop, "service[#{node[:rdk][:services][:activity_handler][:service]}]", :before
  notifies :restart, "service[#{node[:rdk][:services][:fetch_server][:service]}]"
  notifies :restart, "service[#{node[:rdk][:services][:activity_handler][:service]}]"
  only_if ("mountpoint -q #{node[:rdk][:home_dir]}")
end

execute "extract from ZIP" do
  cwd node[:rdk][:home_dir]
  command "unzip #{Chef::Config['file_cache_path']}/rdk.zip"
  action :run
  notifies :stop, "service[#{node[:rdk][:services][:fetch_server][:service]}]", :before
  notifies :stop, "service[#{node[:rdk][:services][:write_back][:service]}]", :before
  notifies :stop, "service[#{node[:rdk][:services][:pick_list][:service]}]", :before
  notifies :stop, "service[#{node[:rdk][:services][:activity_handler][:service]}]", :before
  notifies :restart, "service[#{node[:rdk][:services][:fetch_server][:service]}]"
  notifies :restart, "service[#{node[:rdk][:services][:write_back][:service]}]"
  notifies :restart, "service[#{node[:rdk][:services][:pick_list][:service]}]"
  notifies :restart, "service[#{node[:rdk][:services][:activity_handler][:service]}]"
  only_if { (Dir.entries(node[:rdk][:home_dir]) - %w{ . .. }).empty? }
end

mvi = find_node_by_role("mvi", node[:stack], "mocks")

template "#{node[:rdk][:config][:xml_path]}/1305.xml" do
  source "1305.xml.erb"
  mode "644"
  variables({
      :mvi => mvi
  })
  action :create
end

template "#{node[:rdk][:config][:xml_path]}/1309.xml" do
  source "1309.xml.erb"
  mode "644"
  variables({
      :mvi => mvi
  })
  action :create
end

