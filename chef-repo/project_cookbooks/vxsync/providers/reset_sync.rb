require 'net/http'
require 'fileutils'

use_inline_resources

action :execute do

  chef_gem 'httparty' do
    version '0.11.0'
  end

  node[:vxsync][:vxsync_applications].each do |app|
    service "vxsync_#{app}" do
      provider Chef::Provider::Service::Upstart
      action :stop
    end
  end

  service "osync" do
    provider Chef::Provider::Service::Upstart
    action :stop
    only_if { node[:vxsync][:vxsync_applications].include?("client") }
  end

  service "soap_handler" do
    provider Chef::Provider::Service::Upstart
    action :stop
  end

  node[:vxsync][:vxsync_applications].each do |app|
    service "beanstalk_#{app}" do
      provider Chef::Provider::Service::Upstart
      action :stop
    end
  end

  ruby_block 'clear jds cache' do
    block do
      if find_optional_nodes_by_criteria(node[:stack], "role:jds_app_server").empty?
        raise "No JDS App Server has been found, yet you attempted to point to a jds_app_server" unless node[:vxsync_client][:jds_app_server_assignment].nil?
        jds = find_node_by_role("jds", node[:stack])
      else
        raise "JDS App Servers have been found in this environment, but a jds_app_server_assignment was not set." if node[:vxsync_client][:jds_app_server_assignment].nil?
        jds = find_optional_node_by_criteria(node[:stack], "role:jds_app_server AND jds_app_server_ident:#{node[:vxsync_client][:jds_app_server_assignment]}")
        raise "JDS App Server #{node[:vxsync_client][:jds_app_server_assignment]} not found in stack." if jds.nil?
      end
      solr = find_multiple_nodes_by_role("solr", node[:stack])

      JDSCache.clear("http://#{jds['ipaddress']}:#{jds['jds']['cache_listener_ports']['vxsync']}")
      solr.each do |solr_machine|
        SolrCache.clear("http://#{solr_machine['ipaddress']}:#{solr_machine['solr']['port']}")
      end
    end
    action :create
    only_if { new_resource.reset }
  end

  node[:vxsync][:vxsync_applications].each do |app|
    directory node["vxsync_#{app}".to_sym][:documents_dir] do
      recursive true
      owner node[:vxsync][:user]
      group node[:vxsync][:group]
      action :delete
      notifies :create, "directory[#{node["vxsync_#{app}".to_sym][:documents_dir]}]", :immediately
      only_if { new_resource.reset}
    end
  end

  first_vxsync = node[:vxsync][:vxsync_applications][0]
  ruby_block "reset vista" do
    block do
      vxsync_config = ::File.read(node["vxsync_#{first_vxsync}".to_sym][:config_file])
      vista_sites = JSON.parse(vxsync_config)["vxsync"]["vistaSites"]
      vista_sites.each do |site_name, site_config|
        system("node #{node["vxsync_#{first_vxsync}".to_sym][:home_dir]}/tools/vista-sync-tools/rpc-unsubscribe-all.js --host \"#{site_config['host']}\" \
                                                                                  --port #{site_config['port']} \
                                                                                  --accessCode #{site_config['accessCode']} \
                                                                                  --verifyCode #{site_config['verifyCode']}")
      end
    end
    action :create
    only_if { new_resource.reset }
  end

  ruby_block 'clear HDR pub/sub subscription' do
    block do
      vxsync_config = ::File.read(node["vxsync_#{first_vxsync}".to_sym][:config_file])
      hdr_config = JSON.parse(vxsync_config)["vxsync"]["hdr"]
      hdr_mode = hdr_config["operationMode"]
      if hdr_mode && "PUB/SUB".casecmp(hdr_mode) == 0
        pubsub_config = hdr_config["pubsubConfig"]
        base_url = "#{pubsub_config['protocol']}://#{pubsub_config['host']}:#{pubsub_config['port']}/#{pubsub_config['path']}"
        HDRClient.unsubscribeAll("#{base_url}")
      end
    end
    action :create
    only_if { new_resource.reset }
  end

  execute "clear persistence directory and error logs" do
    command "rm -rf #{node[:vxsync][:persistence_dir]}/*"
    command "rm -f #{node[:vxsync][:log_directory]}/*_error.log*"
    only_if { new_resource.reset }
  end

  execute "echo 'starting vxsync processes'" do
    node[:vxsync][:vxsync_applications].each { |app| notifies :start, "service[beanstalk_#{app}]", :immediately }
    notifies :start, "service[soap_handler]", :immediately
    notifies :start, "service[osync]", :immediately
    node[:vxsync][:vxsync_applications].each { |app| notifies :start, "service[vxsync_#{app}]", :immediately }
    only_if { node[:vxsync][:start_vxsync_services] }
  end

  sites = find_multiple_nodes_by_role("vista-.*", node[:stack])

  sites.each { |site|
    site_id = site['vista']['site_id']

    vxsync_wait_for_connection "triggering initial operational data sync for site #{site_id}" do
      url "http://localhost:#{node[:vxsync][:web_service_port]}/data/doLoad?sites=#{site_id}"
      only_if { node[:roles].include?("primary_vxsync_client") && new_resource.reset }
    end
  }

end
